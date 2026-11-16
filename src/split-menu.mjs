// Moves the full menu out of the home page onto its own page (menu.html), reached from the Menu drop-down in the top rail.
// Runs on the built index.html (src/build.mjs calls it last; safe to run again: a page without the menu is left alone).
// usage: node src/split-menu.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('<!-- THE MENU -->'), end = html.indexOf('<!-- FIND US -->');
if (start < 0 || end < start) { console.log('split-menu: no menu section in index.html, nothing to do'); process.exit(0); }
const menu = html.slice(start, end);
// links: the rail drop-down lists the pages; every "see the menu" link goes to the menu page
const relink = s => s
  .replace(/<a role="menuitem" href="(?:#menu|menu\.html)">[^<]*<\/a>/, '<a role="menuitem" href="menu.html">Full menu</a>')
  .replace(/href="#menu"/g, 'href="menu.html"');
let home = relink(html.slice(0, start) + html.slice(end));
home = home.replace('<a class="skip" href="menu.html">Skip to the menu</a>', '<a class="skip" href="#top">Skip to the content</a>');
// the menu page: same head, rail, footer and scripts; rail section links point back to the home page
let page = relink(html.slice(0, html.indexOf('<main id="top">'))) + '<main id="top" class="menu-page">\n' + menu + '\n' + html.slice(html.indexOf('</main>'));
page = page
  .replace(/<title>[^<]*<\/title>/, '<title>Menu · Konso · Pan Asian Kitchen &amp; Pub</title>')
  .replace(/(<meta name="description" content=")[^"]*/, '$1The full Konso menu with prices: dim sum, bao, wok, mains, curries, desserts, beer, spirits, cocktails and zero-proof drinks')
  .replace('<a class="skip" href="menu.html">Skip to the menu</a>', '<a class="skip" href="#menu">Skip to the menu</a>')
  .replace('<a class="rail-logo" href="#top" aria-label="Konso, back to top"', '<a class="rail-logo" href="./" aria-label="Konso, home page"')
  .replace(/(<nav class="rail-nav"[\s\S]*?<\/nav>)/, n => n.replace(/href="#(\w+)"/g, 'href="./#$1"'))
  .replace('<a role="menuitem" href="menu.html">Full menu</a>', '<a role="menuitem" href="menu.html" aria-current="page">Full menu</a>')
  .replace(/<script src="assets\/lenis\.min\.js" defer><\/script>\n/, '');
fs.writeFileSync(file, home);
fs.writeFileSync(path.join(ROOT, 'menu.html'), page);
console.log('split-menu: menu.html written, menu removed from index.html');
