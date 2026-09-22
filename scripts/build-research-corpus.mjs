import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data/research/fra/extraction/licensed');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, data) => fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2)+'\n');
const manifest = read(path.join(dir,'manifest.json'));
const sources = manifest.sources.map(s => read(path.join(dir,s.path)));
const cards = read(path.join(root,'data/fra_preview.json')).cards.filter(c => !c.typeLine.startsWith('Basic Land'));
const entities = cards.map(card => ({cardId:card.id,name:card.name,reviewAssessments:[],transcriptMentions:[],reviewedVideoClaimIds:[],relationshipIds:[]}));
const byId = new Map(entities.map(c => [c.cardId,c]));
const relationships = read(path.join(dir,'../review-relationships.json')).records;
for (const row of relationships) row.cardIds.forEach(id => byId.get(id).relationshipIds.push(row.id));
let paragraphCount=0;
for (const source of sources.filter(s=>s.kind==='written-review')) {
  for (const review of source.cardReviews) {
    paragraphCount+=review.paragraphs.length;
    for (const id of review.cardIds) {
      byId.get(id).reviewAssessments.push({
        sourceId:source.id,author:source.author,dependencyGroup:source.dependencyGroup,
        sourceUrl:source.sourceUrl,capturedAt:source.capturedAt,sectionId:review.id,
        heading:review.heading,scope:review.scope,grade:review.grade,scale:source.scale,
        evidenceType:'reviewer-opinion',extraction:'full-source-prose',
        paragraphIds:review.paragraphs.map(p=>p.id),
        assessmentText:review.paragraphs.map(p=>p.text).join('\n\n'),
      });
    }
  }
}
// Exact canonical front names can span caption boundaries. This deliberately
// does not guess misspelled ASR names or infer an opinion from a name mention.
const regexEscape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for (const source of sources.filter(s=>s.segments)) {
  let offset=0;
  const offsets=source.segments.map(s=>{const start=offset;offset+=s.text.length+1;return start;});
  const joined=source.segments.map(s=>s.text).join(' ');
  for (const card of cards) {
    const name=card.name.split(' // ')[0];
    const pattern=new RegExp(`(?<!\\w)${regexEscape(name).replaceAll("'","['’]")}(?!\\w)`,'gi');
    for (const match of joined.matchAll(pattern)) {
      let first=offsets.findLastIndex(o=>o<=match.index);
      let last=offsets.findLastIndex(o=>o<match.index+match[0].length);
      byId.get(card.id).transcriptMentions.push({sourceId:source.id,startSeconds:source.segments[first].startSeconds,
        segmentIds:source.segments.slice(first,last+1).map(s=>s.id),matchedText:match[0],
        method:'exact-name-across-caption-boundaries',interpretation:'unclassified-mention'});
    }
  }
  const legacyPath=path.join(root,`data/research/fra/sources/${source.id}.json`);
  if (fs.existsSync(legacyPath)) {
    const legacy=read(legacyPath);
    for (const row of [...(legacy.claims||[]),...(legacy.observations||[])]) {
      for (const id of row.cardIds) byId.get(id)?.reviewedVideoClaimIds.push({sourceId:source.id,claimId:row.id,startSeconds:row.startSeconds});
    }
  }
}
for (const row of entities) {
  assert.equal(row.reviewAssessments.length,2,row.name);
  assert.equal(new Set(row.reviewAssessments.map(a=>a.dependencyGroup)).size,2,row.name);
  assert(row.reviewAssessments.every(a=>a.assessmentText.trim().length>0),row.name);
}
write('card-evidence.json',{schemaVersion:1,set:'FRA',status:'research-only',permissionId:manifest.permissionId,
  scope:'280 main-set nonbasic cards. Full original prose, no blended rating or generated consensus.',cards:entities});
const videos=sources.filter(s=>s.segments);
const coverage={
  set:'FRA',capturedAt:'2026-09-22',cards:entities.length,cardsWithTwoFullReviewTexts:entities.length,
  cardsWithTwoIndividualPassages:entities.filter(c=>c.reviewAssessments.every(a=>a.scope==='card')).length,
  cardsUsingCyclePassages:entities.filter(c=>c.reviewAssessments.some(a=>a.scope==='cycle')).length,
  cardReviewerAssessments:entities.reduce((n,c)=>n+c.reviewAssessments.length,0),
  uniqueReviewSections:sources.reduce((n,s)=>n+(s.cardReviews?.length||0),0),reviewParagraphs:paragraphCount,
  writtenDocuments:sources.filter(s=>s.kind==='written-review').length,
  writtenReviewerGroups:[...new Set(sources.filter(s=>s.kind==='written-review').map(s=>s.dependencyGroup))],
  articleTextBlocks:sources.reduce((n,s)=>n+(s.articleBlocks?.length||0),0),
  additionalSpecialGuestReviews:sources.reduce((n,s)=>n+(s.outsideMainSetReviews?.length||0),0),
  transcriptSources:videos.length,captionSegments:videos.reduce((n,s)=>n+s.segments.length,0),
  exactTranscriptMentions:entities.reduce((n,c)=>n+c.transcriptMentions.length,0),
  cardsWithExactTranscriptMentions:entities.filter(c=>c.transcriptMentions.length).length,
  videos:videos.map(s=>({sourceId:s.id,segments:s.segments.length,firstCaptionStartSeconds:s.segments[0].startSeconds,lastCaptionStartSeconds:s.lastCaptionStartSeconds,videoDurationSeconds:s.videoDurationSeconds,tailSeconds:s.videoDurationSeconds-s.lastCaptionStartSeconds})),
  limitations:['Original reviewer prose retained; our cross-source synthesis is deferred.','Land-cycle paragraphs shared across their members; not separate per-card essays.','Automatic captions retain errors; exact-name matching undercounts misspelled references.','Limited Resources 872 has no available captions; LRR PrePreRelease archive not located.','Only the historical two-game sample is manually annotated; transcript retention is not game-by-game analysis.'],
};
write('coverage.json',coverage);
console.log(JSON.stringify(coverage,null,2));
