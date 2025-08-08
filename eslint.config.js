import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = require('./.eslintrc.js');

export default [
  { ignores: ["dist/**","backups/**","android/**","ios/**","src/lib/cashu-ts/test/**","src/lib/cashu-ts/examples/**"] },config];
