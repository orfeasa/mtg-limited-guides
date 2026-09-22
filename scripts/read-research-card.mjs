import fs from 'node:fs';
const dir=new URL('../data/research/fra/extraction/licensed/',import.meta.url);
const corpus=JSON.parse(fs.readFileSync(new URL('card-evidence.json',dir),'utf8'));
const query=process.argv.slice(2).join(' ').toLocaleLowerCase();
if (!query) { console.error('Usage: node scripts/read-research-card.mjs "Card name"'); process.exit(1); }
const exact=corpus.cards.filter(c=>c.name.toLocaleLowerCase()===query||c.cardId===query);
const matches=exact.length?exact:corpus.cards.filter(c=>c.name.toLocaleLowerCase().includes(query));
if (matches.length!==1) { console.error(matches.length?matches.map(c=>c.name).join('\n'):'No matching card'); process.exit(1); }
const card=matches[0];
console.log(`# ${card.name}\n\nLicensed research material — noncommercial use only. Original reviewer opinions, not our consensus.\n`);
for (const a of card.reviewAssessments) console.log(`## ${a.author} — ${a.grade}/${a.scale.max}\n${a.sourceUrl}\nHeading: ${a.heading} · ${a.scope} scope · captured ${a.capturedAt}\n\n${a.assessmentText}\n`);
if (card.transcriptMentions.length) {
  console.log('## Transcript name mentions (unclassified; automatic captions)\n');
  for (const m of card.transcriptMentions) {
    const transcript=JSON.parse(fs.readFileSync(new URL(`transcripts/${m.sourceId}.json`,dir),'utf8'));
    const index=transcript.segments.findIndex(s=>s.id===m.segmentIds[0]);
    const context=transcript.segments.slice(Math.max(0,index-3),index+6).map(s=>s.text).join(' ');
    console.log(`${transcript.author} · ${transcript.sourceUrl}&t=${m.startSeconds}s\n${context}\n`);
  }
}
