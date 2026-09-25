import { db, auth, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

class FirebaseQueryBuilder {
  constructor(private table: string) {}
  
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private conditions: any[] = [];
  private orderings: any[] = [];
  private data: any = null;
  private isSingle = false;
  private limitCount = 0;

  select(fields?: string, options?: any) {
    this.action = 'select';
    return this;
  }

  insert(data: any) {
    this.action = 'insert';
    this.data = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.data = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.conditions.push({ column, operator: '==', value });
    return this;
  }
  
  neq(column: string, value: any) {
    this.conditions.push({ column, operator: '!=', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderings.push({ column, direction: options?.ascending === false ? 'desc' : 'asc' });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }
  
  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  async execute() {
    try {
      const colRef = collection(db, this.table);
      
      if (this.action === 'select') {
        let q = query(colRef);
        for (const cond of this.conditions) {
          q = query(q, where(cond.column, cond.operator as any, cond.value));
        }
        for (const ord of this.orderings) {
          q = query(q, orderBy(ord.column, ord.direction));
        }
        if (this.limitCount) {
          q = query(q, limit(this.limitCount));
        }
        const snap = await getDocs(q);
        const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (this.isSingle) {
          return { data: results[0] || null, error: null };
        }
        return { data: results, error: null };
      }
      
      if (this.action === 'insert') {
        if (Array.isArray(this.data)) {
           const res = [];
           for (const d of this.data) {
              const docRef = await addDoc(colRef, d);
              res.push({ id: docRef.id, ...d });
           }
           return { data: res, error: null };
        } else {
           const docRef = await addDoc(colRef, this.data);
           return { data: [{ id: docRef.id, ...this.data }], error: null };
        }
      }
      
      if (this.action === 'update' || this.action === 'delete') {
        let q = query(colRef);
        for (const cond of this.conditions) {
          q = query(q, where(cond.column, cond.operator as any, cond.value));
        }
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          if (this.action === 'update') {
            await updateDoc(doc(db, this.table, d.id), this.data);
          } else {
            await deleteDoc(doc(db, this.table, d.id));
          }
        }
        return { data: null, error: null };
      }
    } catch (e) {
       console.error("Firebase adapter error:", e);
       return { data: null, error: e };
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}


let _initialAuthResolved = false;
let _authResolveQueue: any[] = [];

auth.onAuthStateChanged((u) => {
  if (!_initialAuthResolved) {
    _initialAuthResolved = true;
    _authResolveQueue.forEach(resolve => resolve(u));
    _authResolveQueue = [];
  }
});

const waitForInitialAuth = () => {
  if (_initialAuthResolved) return Promise.resolve(auth.currentUser);
  return new Promise(resolve => {
    _authResolveQueue.push(resolve);
  });
};

export const firestoreDB = {

  from: (table: string) => new FirebaseQueryBuilder(table),
  auth: {
    getUser: async () => {
      const u = await waitForInitialAuth();
      if (u) return { data: { user: u }, error: null };
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
       const u = await waitForInitialAuth();
       if (u) return { data: { session: { user: u } }, error: null };
       return { data: { session: null }, error: null };
    },
    onAuthStateChange: (cb: any) => {
       const unsub = auth.onAuthStateChanged(user => {
          cb("STATE_CHANGE", user ? { user } : null);
       });
       return { data: { subscription: { unsubscribe: unsub } } };
    },
    setSession: async () => ({ data: {}, error: null })
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File | Blob, options?: { upsert?: boolean }) => {
        try {
          const storageRef = ref(storage, `${bucket}/${path}`);
          await uploadBytes(storageRef, file);
          return { data: { path }, error: null };
        } catch (error: any) {
          console.error(`Firebase Storage upload error for ${bucket}/${path}:`, error);
          return { data: null, error };
        }
      },
      getPublicUrl: (path: string) => {
        const bucketName = storage.app.options.storageBucket || "peerless-gateway-8lkqp.firebasestorage.app";
        const encoded = encodeURIComponent(`${bucket}/${path}`);
        return {
          data: {
            publicUrl: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`
          }
        };
      },
      getDownloadURL: async (path: string) => {
        try {
          const storageRef = ref(storage, `${bucket}/${path}`);
          const url = await getDownloadURL(storageRef);
          return { data: { publicUrl: url }, error: null };
        } catch (error: any) {
          return { data: null, error };
        }
      }
    })
  },
  functions: {
    invoke: async (functionName: string, options?: any) => {
      let endpoint = `/api/${functionName}`;
      if (functionName === "mesomb-collect") endpoint = "/api/mesomb/collect";
      else if (functionName === "mesomb-deposit") endpoint = "/api/mesomb/deposit";
      else if (functionName === "mesomb-webhook") endpoint = "/api/mesomb/webhook";
      else if (functionName === "extract-metadata") endpoint = "/api/extract-metadata";
      else if (functionName === "send-withdrawal-email") endpoint = "/api/send-withdrawal-email";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options?.body || {}),
        });
        const result = await response.json();
        return { data: result, error: !response.ok ? new Error(result.error || result.message || "Failed") : null };
      } catch (error) {
        console.error(`functions.invoke error on ${functionName}:`, error);
        return { data: null, error };
      }
    }
  }
};
