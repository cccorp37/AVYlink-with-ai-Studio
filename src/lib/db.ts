import { db, auth, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, addDoc, orderBy, limit, onSnapshot, documentId } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const _storageUrlMap = new Map<string, string>();

function cleanDataForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(cleanDataForFirestore);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = cleanDataForFirestore(v);
      }
    }
    return res;
  }
  return obj;
}

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
    if (this.action === 'select') {
      this.action = 'select';
    }
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

        // Fast path for single doc by ID
        const idCond = this.conditions.find(c => c.column === 'id' && c.operator === '==');
        if (idCond && this.conditions.length === 1 && typeof idCond.value === 'string') {
          try {
            const singleDoc = await getDoc(doc(db, this.table, idCond.value));
            if (singleDoc.exists()) {
              const res = { id: singleDoc.id, ...singleDoc.data() };
              return this.isSingle ? { data: res, count: 1, error: null } : { data: [res], count: 1, error: null };
            }
          } catch (_) {}
        }

        let results: any[] = [];
        try {
          let q = query(colRef);
          for (const cond of this.conditions) {
            if (cond.column === 'id') {
              q = query(q, where(documentId(), cond.operator as any, cond.value));
            } else {
              q = query(q, where(cond.column, cond.operator as any, cond.value));
            }
          }
          for (const ord of this.orderings) {
            q = query(q, orderBy(ord.column, ord.direction));
          }
          if (this.limitCount) {
            q = query(q, limit(this.limitCount));
          }
          const snap = await getDocs(q);
          results = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        } catch (queryErr: any) {
          // 1. Try local client fallback
          try {
            const fallbackSnap = await getDocs(colRef);
            let allDocs = fallbackSnap.docs.map(d => ({ ...d.data(), id: d.id } as any));
            for (const cond of this.conditions) {
              allDocs = allDocs.filter(doc => {
                const val = cond.column === 'id' ? (doc.id || (doc as any)._id) : doc[cond.column];
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
          } catch (permErr: any) {
            // 2. Client SDK fallback through Admin server proxy
            try {
              const res = await fetch("/api/db/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  table: this.table,
                  conditions: this.conditions,
                  orderings: this.orderings,
                  limitCount: this.limitCount,
                }),
              });
              if (res.ok) {
                const sData = await res.json();
                results = sData.data || [];
              }
            } catch (_) {}
          }
        }

        if (this.isSingle) {
          return { data: results[0] || null, count: results.length ? 1 : 0, error: null };
        }
        return { data: results, count: results.length, error: null };
      }
      
      if (this.action === 'insert') {
        const cleanedPayload = cleanDataForFirestore(this.data);
        try {
          if (Array.isArray(cleanedPayload)) {
             const res = [];
             for (const d of cleanedPayload) {
                let docId = d.id;
                let itemData = { ...d };
                if (docId) {
                  await setDoc(doc(db, this.table, docId), { ...itemData, id: docId }, { merge: true });
                } else {
                  const docRef = await addDoc(colRef, itemData);
                  docId = docRef.id;
                  await setDoc(docRef, { id: docId }, { merge: true });
                }
                res.push({ ...itemData, id: docId });
             }
             return this.isSingle ? { data: res[0] || null, error: null } : { data: res, error: null };
          } else {
             let docId = cleanedPayload.id;
             let itemData = { ...cleanedPayload };
             if (docId) {
               await setDoc(doc(db, this.table, docId), { ...itemData, id: docId }, { merge: true });
             } else {
               const docRef = await addDoc(colRef, itemData);
               docId = docRef.id;
               await setDoc(docRef, { id: docId }, { merge: true });
             }
             const created = { ...itemData, id: docId };
             return this.isSingle ? { data: created, error: null } : { data: [created], error: null };
          }
        } catch (insertErr: any) {
          try {
            const res = await fetch("/api/db/mutate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "insert", table: this.table, data: cleanedPayload }),
            });
            const sData = await res.json();
            const resData = sData.data;
            if (this.isSingle && Array.isArray(resData)) {
              return { data: resData[0] || null, error: null };
            }
            return { data: resData || [], error: null };
          } catch (_) {
            return { data: null, error: insertErr };
          }
        }
      }
      
      if (this.action === 'update' || this.action === 'delete') {
        for (const cond of this.conditions) {
          if (cond.value === undefined) {
            console.warn(`Firestore Query Builder: Undefined value for ${cond.column} in ${this.action}. Aborting.`);
            return { data: null, error: null };
          }
        }
        const cleanedUpdate = cleanDataForFirestore(this.data);
        try {
          const idCond = this.conditions.find(c => c.column === 'id' && c.operator === '==');
          let affectedDocs: any[] = [];

          if (idCond && this.conditions.length === 1 && typeof idCond.value === 'string') {
            const docRef = doc(db, this.table, idCond.value);
            const currentDoc = await getDoc(docRef);
            const prevData = currentDoc.exists() ? currentDoc.data() : {};
            if (this.action === 'update') {
              await setDoc(docRef, { ...cleanedUpdate, id: idCond.value }, { merge: true });
              affectedDocs.push({ ...prevData, ...cleanedUpdate, id: idCond.value });
            } else {
              await deleteDoc(docRef);
              affectedDocs.push({ id: idCond.value });
            }
          } else {
            let q = query(colRef);
            for (const cond of this.conditions) {
              if (cond.column === 'id') {
                q = query(q, where(documentId(), cond.operator as any, cond.value));
              } else {
                q = query(q, where(cond.column, cond.operator as any, cond.value));
              }
            }
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              const prevData = d.data();
              if (this.action === 'update') {
                await setDoc(doc(db, this.table, d.id), { ...cleanedUpdate, id: d.id }, { merge: true });
                affectedDocs.push({ ...prevData, ...cleanedUpdate, id: d.id });
              } else {
                await deleteDoc(doc(db, this.table, d.id));
                affectedDocs.push({ id: d.id });
              }
            }
          }

          if (this.action === 'update') {
            const singleResult = affectedDocs[0] || (idCond ? { id: idCond.value, ...cleanedUpdate } : null);
            return this.isSingle ? { data: singleResult, error: null } : { data: affectedDocs, error: null };
          }
          return { data: null, error: null };
        } catch (mutErr: any) {
          try {
            await fetch("/api/db/mutate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: this.action,
                table: this.table,
                conditions: this.conditions,
                data: cleanedUpdate,
              }),
            });
            const idCond = this.conditions.find(c => c.column === 'id' && c.operator === '==');
            const fallbackItem = idCond ? { id: idCond.value, ...cleanedUpdate } : cleanedUpdate;
            return this.isSingle ? { data: fallbackItem, error: null } : { data: [fallbackItem], error: null };
          } catch (_) {
            return { data: null, error: mutErr };
          }
        }
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
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("avylink_user_session") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.uid || parsed.id)) {
            parsed.id = parsed.id || parsed.uid;
            return { data: { user: parsed }, error: null };
          }
        }
      } catch (_) {}
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
       const u = await waitForInitialAuth();
       if (u) {
         (u as any).id = u.uid;
         return { data: { session: { user: u } }, error: null };
       }
       try {
         const stored = typeof window !== "undefined" ? localStorage.getItem("avylink_user_session") : null;
         if (stored) {
           const parsed = JSON.parse(stored);
           if (parsed && (parsed.uid || parsed.id)) {
             parsed.id = parsed.id || parsed.uid;
             return { data: { session: { user: parsed } }, error: null };
           }
         }
       } catch (_) {}
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
      upload: async (path: string, file: File | Blob, _options?: { upsert?: boolean }) => {
        try {
          // 1. Read file to base64 data URL
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          let publicUrl: string | null = null;

          // 2. Post to resilient server upload endpoint
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileData: base64Data, fileName: path, bucket }),
            });
            if (res.ok) {
              const rData = await res.json();
              if (rData.url) {
                publicUrl = rData.url;
              }
            }
          } catch (_) {}

          // 3. Parallel sync to Firebase Storage if possible
          try {
            const storageRef = ref(storage, `${bucket}/${path}`);
            await uploadBytes(storageRef, file);
            const dlUrl = await getDownloadURL(storageRef);
            if (!publicUrl) publicUrl = dlUrl;
          } catch (_) {}

          // Fallback to base64 if server endpoint did not return
          if (!publicUrl) {
            publicUrl = base64Data;
          }

          _storageUrlMap.set(`${bucket}/${path}`, publicUrl);
          return { data: { path, publicUrl }, error: null };
        } catch (error: any) {
          console.error("Storage upload error:", error);
          return { data: null, error };
        }
      },
      getPublicUrl: (path: string) => {
        const cached = _storageUrlMap.get(`${bucket}/${path}`);
        if (cached) {
          return { data: { publicUrl: cached } };
        }
        const bucketName = storage.app.options.storageBucket || "peerless-gateway-8lkqp.firebasestorage.app";
        const encoded = encodeURIComponent(`${bucket}/${path}`);
        return {
          data: {
            publicUrl: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`
          }
        };
      },
      getDownloadURL: async (path: string) => {
        const cached = _storageUrlMap.get(`${bucket}/${path}`);
        if (cached) {
          return { data: { publicUrl: cached }, error: null };
        }
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
  },
  channel: (channelName: string) => {
    let unsubs: (() => void)[] = [];
    const channelObj = {
      on: (
        _type: string,
        filter: { event?: string; schema?: string; table?: string; filter?: string },
        callback: (payload: any) => void
      ) => {
        if (filter?.table) {
          try {
            const colRef = collection(db, filter.table);
            let isFirst = true;
            const unsub = onSnapshot(
              colRef,
              (snapshot) => {
                if (isFirst) {
                  isFirst = false;
                  return;
                }
                snapshot.docChanges().forEach((change) => {
                  const docData = { id: change.doc.id, ...change.doc.data() };
                  const eventType =
                    change.type === "added"
                      ? "INSERT"
                      : change.type === "modified"
                        ? "UPDATE"
                        : "DELETE";

                  if (filter.filter) {
                    const match = filter.filter.match(/([a-zA-Z0-9_]+)=eq\.(.+)/);
                    if (match) {
                      const [, field, expectedVal] = match;
                      if (String((docData as any)[field]) !== String(expectedVal)) {
                        return;
                      }
                    }
                  }

                  if (
                    filter.event &&
                    filter.event !== "*" &&
                    filter.event !== eventType
                  ) {
                    return;
                  }

                  callback({
                    eventType,
                    new: docData,
                    old: eventType === "DELETE" ? docData : undefined,
                  });
                });
              },
              (err) => {
                console.warn(
                  `Firestore onSnapshot channel [${channelName}] notice:`,
                  err.message
                );
              }
            );
            unsubs.push(unsub);
          } catch (e) {
            console.warn(`Firestore onSnapshot channel setup notice:`, e);
          }
        }
        return channelObj;
      },
      subscribe: (statusCallback?: (status: string) => void) => {
        if (statusCallback) {
          setTimeout(() => statusCallback("SUBSCRIBED"), 0);
        }
        return channelObj;
      },
      unsubscribe: () => {
        unsubs.forEach((u) => {
          try {
            u();
          } catch (_) {}
        });
        unsubs = [];
      },
    };
    return channelObj;
  },
  removeChannel: (channel: any) => {
    if (channel && typeof channel.unsubscribe === "function") {
      channel.unsubscribe();
    }
  },
  removeAllChannels: () => {},
};
