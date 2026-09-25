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

  private selectOptions: any = null;

  select(fields?: string, options?: any) {
    this.action = 'select';
    this.selectOptions = options;
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

  gte(column: string, value: any) {
    this.conditions.push({ column, operator: '>=', value });
    return this;
  }

  gt(column: string, value: any) {
    this.conditions.push({ column, operator: '>', value });
    return this;
  }

  lte(column: string, value: any) {
    this.conditions.push({ column, operator: '<=', value });
    return this;
  }

  lt(column: string, value: any) {
    this.conditions.push({ column, operator: '<', value });
    return this;
  }

  in(column: string, values: any[]) {
    this.conditions.push({ column, operator: 'in', value: values });
    return this;
  }

  is(column: string, value: any) {
    this.conditions.push({ column, operator: '==', value });
    return this;
  }

  contains(column: string, value: any) {
    this.conditions.push({ column, operator: 'array-contains', value });
    return this;
  }

  match(obj: Record<string, any>) {
    if (obj && typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        this.eq(key, val);
      }
    }
    return this;
  }

  filter(column: string, operator: string, value: any) {
    let op = operator;
    if (op === 'eq') op = '==';
    else if (op === 'neq') op = '!=';
    else if (op === 'gte') op = '>=';
    else if (op === 'gt') op = '>';
    else if (op === 'lte') op = '<=';
    else if (op === 'lt') op = '<';
    this.conditions.push({ column, operator: op, value });
    return this;
  }

  range(from: number, to: number) {
    this.limitCount = to - from + 1;
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
  
  maybeSingle() {
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
        for (const cond of this.conditions) {
          if (cond.value === undefined) {
            console.warn(`Firestore Query Builder: Undefined value for ${cond.column}. Returning empty result.`);
            return this.isSingle ? { data: null, count: 0, error: null } : { data: [], count: 0, error: null };
          }
        }

        let results: any[] = [];
        try {
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
          results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (queryErr: any) {
          console.warn("Firestore native query failed, running resilient client fallback:", queryErr?.message || queryErr);
          // If query failed (e.g. missing composite index in Firestore),
          // fallback to fetching docs and filtering in-memory
          const fallbackSnap = await getDocs(colRef);
          let allDocs = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          for (const cond of this.conditions) {
            allDocs = allDocs.filter(doc => {
              const val = doc[cond.column];
              if (cond.operator === '==') return val === cond.value;
              if (cond.operator === '!=') return val !== cond.value;
              if (cond.operator === '>=') return val >= cond.value;
              if (cond.operator === '>') return val > cond.value;
              if (cond.operator === '<=') return val <= cond.value;
              if (cond.operator === '<') return val < cond.value;
              if (cond.operator === 'in') return Array.isArray(cond.value) && cond.value.includes(val);
              if (cond.operator === 'array-contains') return Array.isArray(val) && val.includes(cond.value);
              return true;
            });
          }
          for (const ord of this.orderings) {
            allDocs.sort((a, b) => {
              if (a[ord.column] < b[ord.column]) return ord.direction === 'desc' ? 1 : -1;
              if (a[ord.column] > b[ord.column]) return ord.direction === 'desc' ? -1 : 1;
              return 0;
            });
          }
          if (this.limitCount) {
            allDocs = allDocs.slice(0, this.limitCount);
          }
          results = allDocs;
        }

        if (this.isSingle) {
          return { data: results[0] || null, count: results.length ? 1 : 0, error: null };
        }
        return { data: results, count: results.length, error: null };
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
          if (cond.value === undefined) {
            console.warn(`Firestore Query Builder: Undefined value for ${cond.column} in ${this.action}. Aborting.`);
            return { data: null, error: null };
          }
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
      if (u) {
        (u as any).id = u.uid;
        return { data: { user: u }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
       const u = await waitForInitialAuth();
       if (u) {
         (u as any).id = u.uid;
         return { data: { session: { user: u } }, error: null };
       }
       return { data: { session: null }, error: null };
    },
    onAuthStateChange: (cb: any) => {
       const unsub = auth.onAuthStateChanged(user => {
          if (user) (user as any).id = user.uid;
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
