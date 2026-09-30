import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => readFileSync(path.join(root, file), 'utf8');
const context = { window: {} }; vm.createContext(context);
for (const file of ['data/site.js', 'data/publications.js']) vm.runInContext(read(file), context, { filename: file });
new vm.Script(read('js/main.js'));
const html = read('index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
let checked = 0;
function asset(value) {
  if (!value || /YOUR_|TODO|^(https?:|mailto:)/.test(value)) return;
  if (value.startsWith('#')) { assert(ids.includes(value.slice(1)), `Missing anchor ${value}`); return; }
  assert(!value.startsWith('/'), `Root-relative path breaks project Pages: ${value}`);
  const parts = value.split('/'); let directory = root;
  for (const part of parts) { assert(readdirSync(directory).includes(part), `Missing asset or wrong case: ${value}`); directory = path.join(directory, part); }
  assert(existsSync(directory), `Missing asset ${value}`); checked++;
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) asset(match[1]);
const site = context.window.SITE;
asset(site.portrait); Object.values(site.links).forEach(asset);
site.research.forEach(item => { asset(item.image); assert(item.alt); });
const papers = context.window.PUBLICATIONS;
const paperIDs = new Set();
const citationKeys = new Set();
const doiKeys = new Set();
for (const paper of papers) {
  assert(paper.id && !paperIDs.has(paper.id), 'Publication IDs must be unique'); paperIDs.add(paper.id);
  for (const field of ['title', 'venue', 'year', 'image']) assert(paper[field], `${paper.id}: missing ${field}`);
  assert(Number.isInteger(paper.year), `${paper.id}: year must be an integer`);
  if (paper.published_date) {
    assert(/^\d{4}-\d{2}-\d{2}$/.test(paper.published_date) && !Number.isNaN(Date.parse(paper.published_date)), `${paper.id}: invalid publication date`);
    assert(paper.published_date_source?.startsWith('https://'), `${paper.id}: publication date source missing`);
  }
  assert(['journal', 'conference', 'poster'].includes(paper.type), `${paper.id}: invalid type`);
  assert(paper.authors.includes(site.name), `${paper.id}: site author missing`);
  assert(paper.sources?.length, `${paper.id}: source provenance missing`);
  const key = [paper.title.toLowerCase().replace(/[^a-z0-9]/g, ''), paper.year, paper.type, paper.venue_detail || paper.venue].join('|');
  assert(!citationKeys.has(key), `${paper.id}: duplicate citation`); citationKeys.add(key);
  if (paper.doi_url) {
    assert(/^https:\/\/doi\.org\/10\.\d{4,9}\/.+/.test(paper.doi_url), `${paper.id}: invalid DOI URL`);
    const doi = paper.doi_url.toLowerCase();
    assert(!doiKeys.has(doi), `${paper.id}: duplicate DOI`); doiKeys.add(doi);
  }
  if (paper.image_is_placeholder) assert(paper.image_todo, `${paper.id}: missing image TODO`);
  for (const field of ['authors', 'equal_contribution', 'corresponding_author', 'categories']) assert(Array.isArray(paper[field]), `${paper.id}: ${field} must be an array`);
  assert(paper.authors.length); assert(paper.image_alt);
  for (const author of [...paper.equal_contribution, ...paper.corresponding_author]) assert(paper.authors.includes(author), `${paper.id}: contribution name absent from authors`);
  assert(['', 'Published', 'Accepted', 'Under Review', 'In Preparation'].includes(paper.status));
  ['image', 'paper_url', 'doi_url', 'abstract_url', 'code_url', 'project_url', 'data_url'].forEach(field => asset(paper[field]));
}
function totalBytes(dir) { return readdirSync(dir).reduce((sum, name) => { if (name.startsWith('.')) return sum; const file = path.join(dir, name); return sum + (statSync(file).isDirectory() ? totalBytes(file) : statSync(file).size); }, 0); }
console.log(`PASS: JavaScript syntax, ${ids.length} unique HTML anchors, ${papers.length} publication records, ${checked} local asset references (case-sensitive), relative GitHub Pages paths.\nSource size: ${(totalBytes(root) / 1024).toFixed(1)} KB including documentation and development scripts.`);
