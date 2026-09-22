import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const storage = new Map(), listeners = {};
const context = {
  window: { dispatchEvent(){} }, CustomEvent: class { constructor(type, options){this.type=type;this.detail=options?.detail;} },
  document: { querySelectorAll:()=>[], addEventListener:(type,fn)=>{listeners[type]=fn;} },
  localStorage: { getItem:k=>storage.get(k)||null, setItem:(k,v)=>storage.set(k,v) },
};
vm.runInNewContext(fs.readFileSync('public/data.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('public/review-queue.js','utf8'),context);
const api = context.window.PREP_REVIEW;
const set = context.window.LIMITED_PREP_DATA.sets.find(s=>s.id==='fra');
const card = set.cards.find(c=>set.earlyEvidence.byCard[c.id]);
const combo = set.earlyEvidence.lessonIds[0];
const question = set.prep.decisions[0].id;
api.add(set,'card',card.id);api.add(set,'card',card.id);api.add(set,'combination',combo);api.add(set,'question',question);
assert.equal(api.list(set).length,3,'duplicate marks must not duplicate queue entries');
assert.equal(JSON.parse(storage.get('limited-prep:review:fra:v1')).length,3);
assert(api.button(set,'card',card.id).includes('aria-pressed="true"'));
const toggle = (kind,id)=>listeners.click({target:{closest:()=>({dataset:{reviewSet:set.id,reviewKind:kind,reviewId:id}})}});
toggle('card',card.id);assert(!api.has(set,'card',card.id));assert(api.has(set,'question',question));
assert.equal(api.clean(set,[null,{kind:'card',id:'missing'},{kind:'question',id:question},{kind:'question',id:question},{kind:'__proto__',id:'constructor'}]).length,1);
api.add(set,'question','missing');assert.equal(api.list(set).length,2);
// A fresh controller must recover the same reminders from storage.
vm.runInNewContext(fs.readFileSync('public/review-queue.js','utf8'),context);
assert.equal(context.window.PREP_REVIEW.list(set).length,2);
const separate={...set,id:'separate-test'};assert.equal(context.window.PREP_REVIEW.list(separate).length,0);
const corrupt={...set,id:'corrupt-test'};storage.set('limited-prep:review:corrupt-test:v1','{');assert.equal(context.window.PREP_REVIEW.list(corrupt).length,0);
context.localStorage.setItem=()=>{throw new Error('storage blocked');};
context.window.PREP_REVIEW.add(set,'card',card.id);assert(context.window.PREP_REVIEW.has(set,'card',card.id),'keep session state after write failure');
context.localStorage.getItem=()=>{throw new Error('storage blocked');};
const blocked={...set,id:'blocked-test'};context.window.PREP_REVIEW.add(blocked,'question',question);assert(context.window.PREP_REVIEW.has(blocked,'question',question));
console.log('Verified review reminders: persistence, reload, deduplication, explicit removal, set isolation, invalid/corrupt data and blocked storage.');
