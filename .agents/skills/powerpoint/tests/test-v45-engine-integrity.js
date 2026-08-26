#!/usr/bin/env node
'use strict';

const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const expected = Object.freeze({
  'assets/brand-components.js': '71054c073c4fa19d1517d434e9ab7d10a4b4814601cf5973089c8c986a42cb26',
  'assets/connector-reliability.js': 'b68eeadef7500c474e453c33dfd55bfbf82216ba858aa1c44ba86936a288acd2',
  'assets/context-layer.js': '2b8168ea175eac3e30531419b772b2a0ffe5a29cb5a6906faf04b95820b8ebe1',
  'assets/icon-reliability.js': '8260592cdbedb5b1080a3863779490c5f71dff3e480850fb36622fd0f0a92c10',
  'assets/intent-layer.js': '953d07fe04d37ca118d3b8f9d948e69887e594c1360c696bd8e01f265db36d3a',
  'assets/layouts.js': '6d1218fd6ac406625cb33075fe5e3f3005d8bb73713f2bf631e14990ea39e11f',
  'assets/presentation-components.js': 'fb9546c4d6abfb366d823aa5537a68616e3e33ab51ba4955490d3c9be9cd1055',
  'assets/presets.js': 'e879029fc57dba70a33e405f7b669ca85de585efffb09c8ea4d976ac241d92a4',
  'assets/teaching.js': '6995467a4da49d6d6601601c2f160d78937deaaa270a1e373abf858a85046362',
  'assets/visual-bible.js': 'd8c86d5e983b8679ce38c172a20bdceba8a531d404ccdfbad2efd3280b262738',
  'assets/visual-intelligence.js': '01f4cb8b855af41f600a0fb5b7410918a4e0b87f9a38b1da53cd5a9e792c3d34',
  'assets/brands/epn-riviere-salee.js': '760675deabba3a8dca4e85c015d4bc0006cda922a243d993c8a8586f3a83a550',
  'assets/brands/index.js': '693a17dffae9e4866609a4be3bbd8d8c629c49836554046e4d2231419d3a20f9',
  'assets/contexts/epn-riviere-salee.js': '8dfc49ecb7ba17f5f5016ccf42c6404fdd9de8143e60bfeabb07e911dd6c0d8d',
  'assets/contexts/index.js': '909b813b3cfc30b39035eebb3cdc182c115a67c4e15209b61b081b9be799e07d',
  'assets/themes/index.js': '5a4ac46132cc5fdddef408d3f83205987e2fe9d27894c67703377c118da97cc4',
});

for (const [relativePath, expectedHash] of Object.entries(expected)) {
  const contents = fs.readFileSync(path.join(__dirname, '..', relativePath));
  const actualHash = crypto.createHash('sha256').update(contents).digest('hex');
  assert.strictEqual(actualHash, expectedHash, `${relativePath} must remain unchanged from V4.5`);
}

console.log('V4.5 engine integrity assertions passed');
