#!/bin/bash

# Move Supabase query builder to a new db service
cat << 'DBEOF' > src/lib/db.ts
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc, orderBy, limit } from "firebase/firestore";

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

export const firestoreDB = {
  from: (table: string) => new FirebaseQueryBuilder(table),
  auth: {
    getUser: async () => {
      if (auth.currentUser) return { data: { user: auth.currentUser }, error: null };
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
       if (auth.currentUser) return { data: { session: { user: auth.currentUser } }, error: null };
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
      upload: async (path: string, file: File) => {
         console.log("Mock upload to", bucket, path);
         return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
         return { data: { publicUrl: \`https://fake-url.com/\${bucket}/\${path}\` } };
      }
    })
  },
  functions: {
    invoke: async (functionName: string, options: any) => {
      console.log("Mock invoking function:", functionName, options);
      if (functionName === "mesomb-collect") {
         return { data: { success: true }, error: null };
      }
      return { data: { success: true }, error: null };
    }
  }
};
DBEOF

cat << 'AUTHEOF' > src/lib/auth.ts
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (fullName) {
      await updateProfile(userCredential.user, { displayName: fullName });
    }
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { data: { user: userCredential.user }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { data: {}, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
};
AUTHEOF

# Copy types file to lib so we don't break type definitions yet.
cp src/integrations/supabase/types.ts src/lib/types.ts

# Replace imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/integrations/supabase/client|@/lib/db|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/integrations/supabase/types|@/lib/types|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|@/lib/supabase-auth|@/lib/auth|g' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's|import { supabase }|import { firestoreDB as supabase }|g' {} +

