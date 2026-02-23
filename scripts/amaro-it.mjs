#!/usr/bin/env node

// Use amaro to type-script .ts files to .mjs files.
// ".mjs" because I'm using this on OTel TS files using (mostly) ESM syntax.

import assert from 'assert';
import fs from 'fs';
import {transformSync} from 'amaro';

let tsfiles = [];
for (let arg of process.argv.slice(2)) {
    tsfiles = tsfiles.concat(fs.globSync(arg));
}
tsfiles.map(tsfile => {
    assert.ok(tsfile.endsWith('.ts'), `"${tsfile}" is a .ts file`);
});

for (let tsfile of tsfiles) {
    const ts = fs.readFileSync(tsfile, 'utf-8');
    let mode = 'strip-only'
    let result
    try {
        result = transformSync(ts, {mode, filename: tsfile})
    } catch (err) {
        console.log(`amaro-it: warn: ${tsfile}:${err.startLine}: ${err.message}${err.snippet}`);
        mode = 'transform'
        result = transformSync(ts, {mode, filename: tsfile})
    }
    const mjsfile = tsfile.replace(/\.ts$/, '.mjs');
    fs.writeFileSync(mjsfile, result.code, { encoding: 'utf8' });
    console.log(`amaro-it: wrote "${mjsfile}" (${mode})`);
}
