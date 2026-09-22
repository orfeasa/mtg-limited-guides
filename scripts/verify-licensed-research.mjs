import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base = new URL('../data/research/fra/extraction/licensed/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,base),'utf8'));
const digest=text=>crypto.createHash('sha256').update(text).digest('hex');
const permission=read('permissions.json');
assert.equal(permission.repositoryStorageAllowed,true);
assert.equal(permission.commercialUseAllowed,false);
assert.equal(permission.licenseDocumentsReceived,false,'Do not upgrade user-reported permission to reviewed documentation');
const manifest=read('manifest.json');
const sources=manifest.sources.map(s=>read(s.path));
const old=read('../review-index.json');
const bySource=new Map(sources.map(s=>[s.id,s]));
const sections=new Map();
let count=0;
for (const source of sources) {
  assert.equal(source.permissionId,permission.id);
  assert.equal(new URL(source.sourceUrl).protocol,'https:');
  assert(/^[a-f0-9]{64}$/.test(source.sourceCaptureSha256));
  for (const section of source.cardReviews||[]) {
    assert(!sections.has(section.id));
    sections.set(section.id,{...section,sourceId:source.id});
    const baseline=old.sources.find(s=>s.id===source.id).sections.find(s=>s.id===section.id);
    assert.deepEqual(section.cardIds,baseline.cardIds);
    assert.equal(section.grade,baseline.grade);
    assert.equal(section.paragraphs.length,baseline.paragraphs.length,`Dropped paragraph: ${section.id}`);
    for (const [i,p] of section.paragraphs.entries()) {
      assert(p.text && p.text.trim()===p.text);
      assert.equal(digest(p.text),baseline.paragraphs[i].textSha256,`Changed source text: ${p.id}`);
      assert.equal(p.id,baseline.paragraphs[i].id);
      assert.equal(p.text.split(/\s+/).length,p.wordCount);
      assert(source.articleBlocks.some(b=>b.text===p.text),`Review detached from article: ${p.id}`);
      count++;
    }
  }
  if (source.segments) {
    assert.equal(source.segments[0].startSeconds,0);
    assert.equal(source.lastCaptionStartSeconds,source.segments.at(-1).startSeconds);
    assert(source.videoDurationSeconds>=source.lastCaptionStartSeconds);
    assert(source.videoDurationSeconds-source.lastCaptionStartSeconds<=10,'Caption export ends early');
    assert.equal(new Set(source.segments.map(s=>s.id)).size,source.segments.length);
    source.segments.forEach((s,i)=>{
      assert(Number.isInteger(s.startSeconds)&&s.text.trim());
      if (i) assert(source.segments[i-1].startSeconds<=s.startSeconds);
    });
  }
}
const corpus=read('card-evidence.json');
const canonical=JSON.parse(fs.readFileSync(new URL('../data/fra_preview.json',import.meta.url))).cards;
const known=new Map(canonical.map(c=>[c.id,c]));
assert.equal(corpus.cards.length,280);
assert.equal(new Set(corpus.cards.map(c=>c.cardId)).size,280);
for (const card of corpus.cards) {
  assert.equal(card.name,known.get(card.cardId)?.name);
  assert.equal(card.reviewAssessments.length,2);
  assert.equal(new Set(card.reviewAssessments.map(a=>a.dependencyGroup)).size,2);
  for (const a of card.reviewAssessments) {
    const section=sections.get(a.sectionId);
    assert(section.cardIds.includes(card.cardId));
    assert.equal(a.sourceId,section.sourceId);
    assert.equal(a.assessmentText,section.paragraphs.map(p=>p.text).join('\n\n'));
    assert.deepEqual(a.paragraphIds,section.paragraphs.map(p=>p.id));
    assert.equal(a.scope,section.scope);
  }
  for (const mention of card.transcriptMentions) {
    const source=bySource.get(mention.sourceId);
    const segments=mention.segmentIds.map(id=>source.segments.find(s=>s.id===id));
    assert(segments.every(Boolean));
    assert.equal(segments[0].startSeconds,mention.startSeconds);
    assert(segments.map(s=>s.text).join(' ').includes(mention.matchedText));
    assert.equal(mention.interpretation,'unclassified-mention');
  }
}
const decklists=read('decklists.json');
for (const deck of decklists.decks) {
  assert.equal(deck.permissionId,permission.id);
  assert.equal(deck.totals.main,40);
  for (const zone of ['main','sideboard','maybeboard']) assert.equal(deck.totals[zone],deck.cards.filter(c=>c.zone===zone).reduce((n,c)=>n+c.quantity,0));
  for (const card of deck.cards) {
    assert(known.has(card.cardId));
    assert(known.get(card.cardId).name===card.name || known.get(card.cardId).name.split(' // ')[0]===card.name);
    assert(Number.isInteger(card.quantity)&&card.quantity>0);
  }
}
const coverage=read('coverage.json');
assert.equal(coverage.reviewParagraphs,count);
assert.equal(coverage.cardsWithTwoFullReviewTexts,corpus.cards.length);
assert.equal(coverage.captionSegments,sources.reduce((n,s)=>n+(s.segments?.length||0),0));
assert.equal(coverage.additionalSpecialGuestReviews,10);
console.log(`Verified 560 complete review-text joins, ${count} immutable paragraphs, ${coverage.captionSegments} timestamped captions and three 40-card main decks.`);
