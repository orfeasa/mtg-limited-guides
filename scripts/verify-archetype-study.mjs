import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Node {
  constructor(tag) { this.tag=tag;this.children=[]; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children=nodes; }
  setAttribute() {}
  focus() {}
  querySelector() { return {focus(){}}; }
}
const storage=new Map();
const ctx={window:{confirm:()=>true},document:{createElement:t=>new Node(t)},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
vm.runInNewContext(fs.readFileSync('public/data.js','utf8'),ctx);
const set=ctx.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='fra');
const hob=ctx.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='hob');
const root=new Node('root');
const nodes=()=>{const result=[];const walk=n=>{result.push(n);n.children?.forEach(walk)};walk(root);return result};
const click=text=>{const b=nodes().find(n=>n.tag==='button'&&n.textContent===text);assert(b,text);b.onclick()};
const reload=()=>{vm.runInNewContext(fs.readFileSync('public/archetype-study.js','utf8'),ctx);return ctx.window.ARCHETYPE_STUDY};
let game=reload();
const key=game.storageKey(set,'pair');const state=()=>JSON.parse(storage.get(key));
game.mount(root,set);
const first=state().current;
assert.equal(state().queue.length,9);assert(!nodes().some(n=>n.className==='study-answer'));
click('Reveal archetype');assert.equal(nodes().filter(n=>n.className==='archetype-signpost').length,2);
game=reload();game.mount(root,set);assert.equal(state().current,first);assert(state().revealed);
click('Again');assert.equal(state().queue[2],first); // next prompt is already shifted off the queue
for(let i=0;i<3;i++){click('Reveal archetype');click('Got it');}
assert.equal(state().current,first);
while(state().current){click('Reveal archetype');click('Got it');}
assert.equal(new Set(state().recalled).size,10);assert.equal(state().queue.length,0);
reload().mount(root,set);assert(nodes().some(n=>n.textContent==='All plans recalled'));
const direction=nodes().find(n=>n.tag==='select');direction.value='theme';direction.onchange();
const reverseKey=game.storageKey(set,'theme');
assert.notEqual(key,reverseKey);assert.equal(JSON.parse(storage.get(reverseKey)).recalled.length,0);
assert(nodes().some(n=>n.className==='study-prompt'&&n.textContent.includes(' / ')));
click('Reveal archetype');reload().mount(root,set);assert(JSON.parse(storage.get(reverseKey)).revealed);
assert.equal(state().recalled.length,10);
assert.notEqual(game.storageKey(hob,'pair'),key);game.mount(root,hob);
assert.equal(JSON.parse(storage.get(game.storageKey(hob,'pair'))).queue.length,4);
const ids=set.archetypes.archetypes.map(a=>a.id);
assert(!game.valid({queue:ids,recalled:[ids[0]],current:null,revealed:false},ids));
storage.set(reverseKey,'{bad');reload().mount(root,set);assert.equal(JSON.parse(storage.get(reverseKey)).queue.length,9);
ctx.localStorage.getItem=()=>{throw Error('blocked')};ctx.localStorage.setItem=()=>{throw Error('blocked')};
reload().mount(root,set);assert(nodes().some(n=>n.textContent?.startsWith('Storage unavailable')));
console.log('Verified all ten pairs, reveal/reload, three-question requeue, completion, reverse recall, direction/set isolation, corrupt and blocked storage.');
