import { Buffer } from 'buffer'
declare global { var Buffer: typeof Buffer | undefined }
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer
}
