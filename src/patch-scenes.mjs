// Rewrites only the scroll scenes ({{#explode:...}}) inside the already-built index.html.
// Use this while src/build.mjs cannot run (its menu source, Garden/web/menu/src/menu-data.mjs, was removed: the website menu is frozen).
// usage: node src/patch-scenes.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'src/build.mjs'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const block = src.slice(src.indexOf('const XV = {'), src.indexOf('html = html.replace(/\\{\\{#explode'));
const explode = new Function('fs', 'path', 'ROOT', 'esc', block + '\nreturn explode;')(fs, path, ROOT, esc);
const tpl = fs.readFileSync(path.join(ROOT, 'src/template.html'), 'utf8');
const order = [...tpl.matchAll(/\{\{#explode:(\w+)\}\}/g)].map(m => m[1]);
const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const found = [...html.matchAll(/<section class="xv xv-\w+"[\s\S]*?<\/section>/g)];
if (found.length !== order.length) throw new Error(`index.html has ${found.length} scenes, template has ${order.length}`);
let i = 0;
html = html.replace(/<section class="xv xv-\w+"[\s\S]*?<\/section>/g, () => explode(order[i++]));
fs.writeFileSync(file, html);
console.log('scenes patched:', order.join(', '));
