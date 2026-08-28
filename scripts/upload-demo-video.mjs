// One-off uploader for marketing demo videos → Vercel Blob.
// Usage: node scripts/upload-demo-video.mjs <local-file-path> [blob-pathname]
//
// Requires BLOB_READ_WRITE_TOKEN in the environment (from .env.local or
// exported in the shell) — get it from the Vercel dashboard:
// Project → Storage → Blob → create a store if you don't have one →
// copy the BLOB_READ_WRITE_TOKEN shown there into .env.local.

import { put } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const [, , localPath, blobPathArg] = process.argv;

if (!localPath) {
  console.error('Usage: node scripts/upload-demo-video.mjs <local-file-path> [blob-pathname]');
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN — add it to .env.local (see comment at top of this script).');
  process.exit(1);
}

const blobPath = blobPathArg || `chatbot-demos/${basename(localPath)}`;

const file = await readFile(localPath);

const result = await put(blobPath, file, {
  access: 'public',
  contentType: 'video/mp4',
  addRandomSuffix: false,
});

console.log('\n✓ Uploaded successfully\n');
console.log('URL:', result.url);
console.log('Pathname:', result.pathname);
console.log('Content-Type:', result.contentType);
