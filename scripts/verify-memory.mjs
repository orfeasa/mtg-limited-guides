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
