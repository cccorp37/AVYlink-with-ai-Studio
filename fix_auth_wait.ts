import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/lib/db.ts';
let code = readFileSync(filePath, 'utf8');

const replacement = `
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
`;

code = code.replace('export const firestoreDB = {', replacement);

const getUserReplacement = `
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
`;

code = code.replace(/getUser:\s*async\s*\(\)\s*=>\s*\{[^}]*\},/, getUserReplacement.split('\n')[1] + '\n' + getUserReplacement.split('\n')[2] + '\n' + getUserReplacement.split('\n')[3] + '\n' + getUserReplacement.split('\n')[4] + '\n' + getUserReplacement.split('\n')[5]);
code = code.replace(/getSession:\s*async\s*\(\)\s*=>\s*\{[^}]*\},/, getUserReplacement.split('\n')[6] + '\n' + getUserReplacement.split('\n')[7] + '\n' + getUserReplacement.split('\n')[8] + '\n' + getUserReplacement.split('\n')[9] + '\n' + getUserReplacement.split('\n')[10]);

writeFileSync(filePath, code);
