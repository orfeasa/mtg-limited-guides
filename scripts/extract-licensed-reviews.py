#!/usr/bin/env python3
"""Retain licensed review prose and full available caption exports for research.
Usage: python3 -B scripts/extract-licensed-reviews.py --captures /tmp --transcripts DIR
"""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import hashlib
import sys
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('passage_index', Path(__file__).with_name('index-review-passages.py'))
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)
ROOT = legacy.ROOT
DEST = legacy.RESEARCH/'extraction/licensed'
PERMISSION = 'user-reported-noncommercial-permissions-2026-09-22'


def write(name, value):
    (DEST/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')


def draftsim_context(raw):
    intro = raw[raw.index('<p>It’s all come down'):raw.index('<h2 class="wp-block-heading"><span id="Grading_Scale"')]
    # The generated table of contents is navigation, not another content block.
    intro = intro[:intro.index('<div class="lwptoc')]
    core = raw[raw.index('<h2 class="wp-block-heading"><span id="Grading_Scale"'):]
    end = re.search(r'<p>Until next time.*?</p>', core, re.S)
    assert end, 'Missing article end'
    material = intro + core[:end.end()]
    blocks = []
    for match in re.finditer(r'<(h[1-6]|p|li|tr)\b[^>]*>(.*?)</\1>', material, re.S):
        text = legacy.clean(match[2])
        if not text or 'Illustration by' in text:
            continue
        blocks.append({'kind': match[1], 'text': text})
    return blocks


def zone_context(raw):
    lines = {int(n): v.strip() for n, v in re.findall(r'L(\d+):\s*(.*?)(?=L\d+:|\n|$)', raw)}
    start = next(n for n,v in sorted(lines.items()) if v.startswith('# Reality Fracture'))
    end = next(n for n,v in sorted(lines.items()) if v == '## Popular on MTG Arena Zone')
    assert all(n in lines for n in range(start,end)), 'Missing indexed article lines'
    blocks = []
    for n in range(start, end):
        v = lines[n]
        if not v or v == '* * *' or '[Input]' in v or 'Buy on ' in v or 'Image:' in v:
            continue
        blocks.append({'kind': 'heading' if v.startswith('#') else 'list-item' if v.startswith('* ') else 'paragraph', 'indexedLine': n, 'text': legacy.clean(v)})
    return blocks


def extract(captures, transcript_dir):
    index = json.loads((legacy.RESEARCH/'extraction/review-index.json').read_text())
    manifest = []
    for entry in index['sources']:
        path = captures/entry['captureFilename']
        raw = path.read_text()
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['captureSha256']
        parsed = legacy.html_sections(raw) if entry['id']=='draftsim' else legacy.indexed_sections(raw)
        lookup = {legacy.normalize(s['heading']):s for s in parsed}
        reviews = []
        for section in entry['sections']:
            original = lookup[legacy.normalize(section['heading'])]
            records = []
            for p in section['paragraphs']:
                match = next(x for x in original['paragraphs'] if x['locator']==p['locator'])
                assert legacy.digest(match['text']) == p['textSha256'], p['id']
                records.append({**p, 'text':match['text']})
            reviews.append({**section, 'paragraphs':records, 'semanticAssessmentStatus':'full-source-prose-retained',
                            'interpretationStatus':'not-synthesized', 'evidenceType':'reviewer-opinion'})
        metadata = json.loads((legacy.RESEARCH/f"sources/{entry['id']}.json").read_text())
        document = {
            'id':entry['id'], 'sourceUrl':entry['url'], 'author':entry['author'],
            'dependencyGroup':entry['dependencyGroup'], 'capturedAt':entry['capturedAt'],
            'importedAt':'2026-09-22', 'permissionId':PERMISSION,
            'sourceCaptureSha256':entry['captureSha256'], 'kind':'written-review',
            'format':metadata['format'], 'scale':metadata['scale'],
            'normalization':'HTML/entities/citation wrappers and whitespace normalized; prose not summarized or corrected.',
            'articleBlocks':draftsim_context(raw) if entry['id']=='draftsim' else zone_context(raw),
            'cardReviews':reviews,
            'outsideMainSetReviews':[s for s in parsed if s['grade'] is not None and legacy.normalize(s['heading']) not in {legacy.normalize(r['heading']) for r in reviews}],
        }
        write(Path('articles')/(entry['id']+'.json'),document)
        manifest.append({'id':entry['id'], 'path':'articles/'+entry['id']+'.json','kind':'written-review'})
    video_sources = []
    for sid, vid in [('nicolai-guide','zNKov5PyYCg'),('llu261','I1PPajMb938'),('tcc110','3r3md8snmJo')]:
        video_sources.append({**json.loads((legacy.RESEARCH/f'sources/{sid}.json').read_text()), 'videoId':vid})
    video_sources += json.loads((DEST/'additional-sources.json').read_text())['transcripts']
    for source in video_sources:
        sid, vid = source['id'], source['videoId']
        files = sorted(transcript_dir.glob(f'youtube-{vid}-*.txt'), key=lambda f:f.stat().st_mtime)
        assert files, f'Missing transcript {vid}'
        path = files[-1]
        raw = path.read_text()
        segments = []
        for line in raw.splitlines():
            if not line.strip() or line.startswith(('YouTube transcript','Video ID:','Language:','Captions:')):
                continue
            match = re.fullmatch(r'\[(\d+:\d+(?::\d+)?)\]\s*(.*)',line)
            assert match, f'Unexpected transcript line: {line[:80]}'
            seconds = 0
            for part in match[1].split(':'): seconds=seconds*60+int(part)
            segments.append({'id':f'{sid}:caption:{len(segments)+1}', 'startSeconds':seconds,'text':match[2]})
        assert segments and all(a['startSeconds']<=b['startSeconds'] for a,b in zip(segments,segments[1:]))
        value = {'id':sid,'sourceUrl':source['url'],'author':source['author'],'dependencyGroup':source['dependencyGroup'],
                 'capturedAt':'2026-09-22','permissionId':PERMISSION,'kind':source['kind'],'format':source['format'],
                 'captions':'auto-generated','language':'en','sourceCaptureSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                 'scope':'All segments in the available caption export, including introductions and outros.',
                 'completeness':'caption-export-complete; video-duration comparison recorded separately',
                 'videoDurationSeconds':source.get('videoDurationSeconds', {'tcc110':6228,'nicolai-guide':2068,'llu261':1982}.get(sid)),
                 'framesVerified':False,'segments':segments,'lastCaptionStartSeconds':segments[-1]['startSeconds']}
        write(Path('transcripts')/(sid+'.json'),value)
        manifest.append({'id':sid,'path':'transcripts/'+sid+'.json','kind':source['kind']})
    write('manifest.json',{'schemaVersion':1,'set':'FRA','status':'research-only','permissionId':PERMISSION,'sources':manifest})
    print(f'Retained prose from {len(index["sources"])} written sources and all available captions from {len(video_sources)} videos.')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--captures',type=Path,required=True)
    parser.add_argument('--transcripts',type=Path,required=True)
    args=parser.parse_args()
    extract(args.captures,args.transcripts)
