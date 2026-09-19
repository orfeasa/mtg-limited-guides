import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Node {
  constructor(tag) { this.tag=tag; this.children=[]; this.dataset={}; }
  append(...nodes) { this.children.push(...nodes); }
  prepend(node) { this.children.unshift(node); }
  replaceChildren(...nodes) { this.children=nodes; }
  setAttribute() {}
  focus() {}
  querySelector() { return {focus(){}}; }
}
const storage=new Map();
const ctx={window:{confirm:()=>true}, document:{createElement:t=>new Node(t)},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
vm.runInNewContext(fs.readFileSync('public/data.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync('public/memory.js','utf8'),ctx);
const game=ctx.window.CARD_MEMORY, set=ctx.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='fra');
const cards=set.cards.filter(c=>!c.isBasicLand);
for(const card of cards) { const options=game.choices(card,cards); assert.equal(new Set(options).size,3); assert(options.includes(game.effect(card))); }
const root=new Node('root');
const nodes=()=>{const all=[]; const walk=n=>{all.push(n);n.children?.forEach(walk)};walk(root);return all};
const click=text=>{const b=nodes().find(n=>n.tag==='button'&&n.textContent===text);assert(b, text);b.onclick()};
const state=()=>JSON.parse([...storage.values()][0]);
game.mount(root,set);
const first=state().current;
click('Don’t know — show me'); assert.equal(state().cleared.length,0);assert.equal(state().queue[3],first);
game.mount(root,set); assert.equal(state().current,first);assert.equal(state().revealed,true);
click('Next card');
let attempts=0;
while(state().current) {
 const before=state();const card=cards.find(c=>c.id===before.current);
 click(game.effect(card));assert.equal(state().cleared.length,before.cleared.length+1);
 // Re-mounting a revealed answer must not count it twice.
 game.mount(root,set);assert.equal(state().cleared.length,before.cleared.length+1);
 click(state().queue.length?'Next card':'Finish run');
 assert(++attempts<=cards.length);
}
assert.equal(state().cleared.length,cards.length);assert(nodes().some(n=>n.textContent==='Set cleared!'));
game.mount(root,set);assert.equal(state().current,null);assert.equal(state().queue.length,0);
ctx.localStorage.getItem=()=>{throw Error('blocked')};ctx.localStorage.setItem=()=>{throw Error('blocked')};game.mount(root,set);assert(nodes().some(n=>n.textContent?.startsWith('Storage unavailable')));
console.log(`Verified ${cards.length} unique three-answer questions, retry spacing, resume, full-run completion, no double counting, and blocked storage.`);

// Derived membership, rarity and multicolour intersections must match source data.
const names=items=>new Set(items.map(c=>c.name));
const essentials=new Set([...set.prep.keyCards.map(i=>i.card),...set.prep.interactions.map(i=>i.card),...set.archetypes.archetypes.flatMap(a=>a.signposts.map(c=>c.name))]);
assert.deepEqual(names(game.filterCards(set,'essentials')),essentials);
assert.deepEqual(names(game.filterCards(set,'interactions')),new Set(set.prep.interactions.map(i=>i.card)));
assert.equal(game.filterCards(set,'interactions').length,11);
assert.deepEqual(names(game.filterCards(set,'common')),names(cards.filter(c=>['common','uncommon'].includes(c.rarity))));
const green=game.filterCards(set,'interactions','G');
assert(green.some(c=>c.name==='Vigorbloom Charm'));assert(green.every(c=>c.colors.includes('G')));
assert(game.filterCards(set,'all').every(c=>!c.isBasicLand));
assert.equal(game.filterCards(set,'weak').length,0);
assert.equal(game.filterCards(set,'weak','all',{[cards[0].id]:{attempts:3,misses:2}}).length,1);
assert.equal(game.filterCards(set,'weak','all',{[cards[0].id]:{attempts:3,misses:1}}).length,0);
const jace=set.archetypes.archetypes.find(a=>a.id==='GU').signposts[0];
assert(game.metadata(set,cards.find(c=>c.name===jace.name)).labels.some(l=>l.includes('GU · Jace')));
const gasp=cards.find(c=>c.name==='Last Gasp');
assert(game.metadata(set,gasp).labels.includes('Removal'));assert(game.metadata(set,gasp).labels.includes('Play-around'));
// Real reloads re-evaluate the module; no in-memory session fallback may mask persistence bugs.
ctx.localStorage.getItem=k=>storage.get(k)||null;ctx.localStorage.setItem=(k,v)=>storage.set(k,v);
const reload=()=>{vm.runInNewContext(fs.readFileSync('public/memory.js','utf8'),ctx);return ctx.window.CARD_MEMORY};
reload().mount(root,set,{studySet:'interactions'});
const interactionKey=[...storage.keys()].find(k=>k.endsWith(':interactions:all'));
const interactionState=()=>JSON.parse(storage.get(interactionKey));
const missed=interactionState().current;
assert(!nodes().some(n=>n.className==='memory-context'));
click('Don’t know — show me');
assert(nodes().some(n=>n.className==='memory-context'));assert(nodes().some(n=>n.className==='memory-interaction'));
const attemptKey='card-memory:attempts:v1:fra';
const beforeAttempts=JSON.parse(storage.get(attemptKey))[missed];
reload().mount(root,set,{studySet:'interactions'});
assert.equal(interactionState().current,missed);assert(interactionState().revealed);
assert.deepEqual(JSON.parse(storage.get(attemptKey))[missed],beforeAttempts);
for(let i=0;i<4;i++) {click('Next card');if(i<3) click(game.effect(cards.find(c=>c.id===interactionState().current)));}
assert.equal(interactionState().current,missed);click('Don’t know — show me');
assert.equal(JSON.parse(storage.get(attemptKey))[missed].misses,beforeAttempts.misses+1);
reload().mount(root,set,{studySet:'weak'});
assert(nodes().some(n=>n.textContent===cards.find(c=>c.id===missed).name));
reload().mount(root,{...set,id:'other'},{studySet:'weak'});
assert(nodes().some(n=>n.textContent==='No cards in this study set'));
reload().mount(root,set,{studySet:'interactions',colour:'G'});
const greenState=JSON.parse(storage.get([...storage.keys()].find(k=>k.endsWith(':interactions:G'))));
assert(greenState.pool.every(id=>green.some(c=>c.id===id)));
assert.equal(JSON.parse(storage.get(interactionKey)).current,missed);
console.log(`Verified ${essentials.size} derived essentials, 11 interactions, rarity/colour intersections, answer-only context, attempt persistence, Weak cards and set/filter isolation.`);
