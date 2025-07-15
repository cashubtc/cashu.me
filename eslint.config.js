import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = require('./.eslintrc.js');

export default [config];
