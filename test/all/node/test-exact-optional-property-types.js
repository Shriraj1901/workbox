/*
  Copyright 2026 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

const {expect} = require('chai');
const path = require('path');
const ts = require('typescript');

// Every plugin class that implements `WorkboxPlugin` in its public typings.
const pluginDeclarations = [
  'workbox-background-sync/BackgroundSyncPlugin.d.ts',
  'workbox-broadcast-update/BroadcastUpdatePlugin.d.ts',
  'workbox-cacheable-response/CacheableResponsePlugin.d.ts',
  'workbox-expiration/ExpirationPlugin.d.ts',
  'workbox-precaching/PrecacheFallbackPlugin.d.ts',
  'workbox-range-requests/RangeRequestsPlugin.d.ts',
];

describe(`[all] Plugin typings and exactOptionalPropertyTypes`, function () {
  // Creating a TypeScript program can be slow.
  this.timeout(60 * 1000);

  it(`should type check when a consumer enables exactOptionalPropertyTypes`, function () {
    const packagesDir = path.join(__dirname, '..', '..', '..', 'packages');
    const rootNames = pluginDeclarations.map((file) =>
      path.join(packagesDir, file),
    );

    const program = ts.createProgram(rootNames, {
      exactOptionalPropertyTypes: true,
      lib: ['lib.es2020.d.ts', 'lib.webworker.d.ts'],
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      types: [],
    });

    const messages = [];
    for (const sourceFile of program.getSourceFiles()) {
      // Only report on the plugin typings, not on anything they pull in.
      if (!rootNames.includes(path.normalize(sourceFile.fileName))) {
        continue;
      }
      for (const diagnostic of program.getSemanticDiagnostics(sourceFile)) {
        messages.push(
          `${path.basename(sourceFile.fileName)}: ` +
            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        );
      }
    }

    expect(messages).to.deep.equal([]);
  });
});
