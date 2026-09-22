import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { attachTeaching, compileEarlyEvidence } from './early-evidence.mjs';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const cards = read('data/fra_preview.json').cards;
const corpus = read('data/research/fra/extraction/licensed/card-evidence.json');
const teaching = read('data/research/fra/teaching/cards.json');
const result = compileEarlyEvidence('data/research/fra', cards, read('data/fra_archetypes.json').archetypes.map(a=>a.id));
assert.equal(Object.values(result.byCard).filter(c=>c.reviews.length===2).length,280);
assert.equal(Object.values(result.byCard).filter(c=>c.teaching).length,280);
for (const item of read('data/fra_prep.json').keyCards) assert(teaching.cards.some(c=>c.name===item.card));
const invalid = mutate => {
  const next = structuredClone(teaching); const nextCorpus = structuredClone(corpus);
  mutate(next,nextCorpus);
  assert.throws(()=>attachTeaching(structuredClone(result),nextCorpus,next,cards));
};
invalid(t=>{t.cards[0].reviewSectionIds[0]='unrelated-source';});
invalid(t=>{t.cards[0].watch='';});
invalid(t=>{t.cards.pop();});
invalid(t=>{t.cards.push(t.cards[0]);});
invalid((t,c)=>{c.cards.pop();});
invalid((t,c)=>{c.cards.find(c=>c.cardId===t.cards[0].cardId).reviewAssessments[0].assessmentText+=' Changed source.';});
const ctx={window:{},console,URL};
vm.runInNewContext(fs.readFileSync('public/data.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('public/rules-text.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('public/early-evidence.js','utf8'),ctx);
const set=ctx.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='fra');
for(const c of corpus.cards) {
 const html=ctx.window.EARLY_EVIDENCE.card(set,c.cardId);
 assert(html.includes('Read the reviews'));
 assert(!html.includes('no card-specific explanation'));
 for (const a of c.reviewAssessments) assert(html.includes(a.author));
}
const example=corpus.cards[0];
set.earlyEvidence.byCard[example.cardId].reviews[0].text='<img src=x onerror=alert(1)>';
assert(ctx.window.EARLY_EVIDENCE.card(set,example.cardId).includes('&lt;img'));
assert(!ctx.window.EARLY_EVIDENCE.card(set,example.cardId).includes('<img src=x'));
assert.equal(ctx.window.EARLY_EVIDENCE.card(ctx.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='hob'),'hob-1'),'');
console.log('Verified 280 full-review presentations, 280 grounded teaching records, missing/stale-source rejection and safe source-text rendering.');

// Exercise the actual journey controller against its small DOM contract.
class Node {
  constructor(){this.innerHTML='';this.hidden=false;this.nodes=new Map();}
  querySelector(s){if(!this.nodes.has(s))this.nodes.set(s,new Node());return this.nodes.get(s);}
  focus(){} scrollIntoView(){} insertAdjacentHTML(_,s){this.innerHTML+=s;}
}
const storage=new Map();const root=new Node();
const browser={window:{},location:{hash:'',pathname:'/',search:'?view=prep'},history:{replaceState(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
vm.runInNewContext(fs.readFileSync('public/prep-journey.js','utf8'),browser);
const api=browser.window.PREP_JOURNEY;
const host=root.querySelector('#prep-journey'),footer=root.querySelector('#prep-journey-actions');
const click=(node,dataset)=>node.onclick({target:{closest:()=>({dataset})}});
const mount=(format='sealed')=>api.mount(root,set,format);
const key='limited-prep:journey:fra:v1:sealed';
storage.set(key,'corrupt json'); mount();assert(host.innerHTML.includes('0 of 5'));
click(host,{journey:'continue'});click(footer,{journey:'complete'});click(footer,{journey:'review'});
mount();assert(host.innerHTML.includes('1 of 5 lessons completed · 1 marked for review'));
assert(root.querySelector('#prep-mechanics').hidden);assert(!root.querySelector('#prep-cards').hidden);
click(footer,{journey:'complete'});assert(host.innerHTML.includes('2 of 5 lessons completed · 1 marked for review'));
mount('draft');assert(host.innerHTML.includes('0 of 5'));mount();assert(host.innerHTML.includes('2 of 5'));
click(footer,{journey:'complete'});click(footer,{journey:'complete'});click(footer,{journey:'complete'});
assert(host.innerHTML.includes('5 of 5'));click(footer,{journey:'complete'});assert(host.innerHTML.includes('4 of 5'));
browser.location.hash='#prep-play-around';mount();assert(!root.querySelector('#prep-play-around').hidden);
assert(root.querySelector('#prep-practice').hidden);
browser.localStorage.setItem=()=>{throw new Error('quota');};click(footer,{journey:'review'});mount();assert(host.innerHTML.includes('Storage unavailable'));
const clean=JSON.parse(JSON.stringify(api.clean({current:'unknown',completed:['cards','cards','bad'],review:'cards'})));
assert.deepEqual(clean,{current:'mechanics',started:false,completed:['cards'],review:[]});
console.log('Verified journey completion, review retention, reload, format isolation, corrupt/blocked storage, and incoming guide anchors.');
