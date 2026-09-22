#!/usr/bin/env python3
"""Index review passages from local captures, without redistributing article prose.

This is a mechanical discovery index, not a semantic assessment extractor.
Usage: python3 scripts/index-review-passages.py --captures /tmp
"""
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'data/research/fra'

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

def clean(value):
    value = re.sub(r'<(script|style)\b.*?</\1>', '', value, flags=re.S | re.I)
    value = re.sub(r'<[^>]+>', ' ', value)
    value = re.sub(r'cite[^†]*†(.*?)', r'\1', value)
    return re.sub(r'\s+', ' ', html.unescape(value)).strip()

def normalize(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).lower())

# These are topic mentions, not endorsements or inferred roles. Negated mentions
# are deliberately retained; the index must never be consumed as recommendations.
TOPICS = {
    'mana-ramp': r'\bramp\w*\b|\bHeartwoods?\b',
    'mana-fixing': r'\bfixing\b|\bsplash\w*\b|\bcolor fixing\b|\bcolour fixing\b',
    'card-draw': r'\bdraw\w*\b',
    'selection': r'\bscry\w*\b|\bsurveil\w*\b|\bfilter\w*\b',
    'graveyard': r'\bgraveyard\w*\b|\bmill\w*\b|\bthreshold\b',
    'flashback': r'\bflashback\b',
    'recursion': r'\brecur\w*\b|\breanimat\w*\b',
    'lifegain': r'\blife\s*gain\b|\bgain\w*\s+life\b|\blifelink\b',
    'counters': r'\+1/\+1|\bloyalty\b',
    'empower': r'\bempower\b|\bJace tokens?\b',
    'prepared': r'\bprepar\w*\b',
    'removal': r'\bremoval\b|\bkill\w*\b|\bdestroy\w*\b|\bexil\w*\b',
    'combat': r'\bcombat\b|\battack\w*\b|\bblock\w*\b',
    'evasion': r'\bflying\b|\bevasion\b|\bevasive\b|\bmenace\b|\bunblockable\b',
    'sacrifice': r'\bsacrific\w*\b',
    'equipment': r'\bequip\w*\b',
    'artifacts': r'\bartifact\w*\b',
    'tokens': r'\btokens?\b',
    'tempo': r'\btempo\b',
    'aggro': r'\baggro\b|\baggress\w*\b',
    'control': r'\bcontrolling\b|\bcontrol decks?\b',
    'sealed': r'\bsealed\b',
    'draft': r'\bdraft\w*\b',
    'sideboard': r'\bsideboard\w*\b',
}


def html_sections(raw):
    sections = []
    pattern = r'<h([23])\b[^>]*>(.*?)</h\1>(.*?)(?=<h[23]\b|$)'
    for match in re.finditer(pattern, raw, flags=re.S | re.I):
        heading = clean(match[2])
        body = match[3]
        rating = re.search(r'Rating:\s*([\d.]+)\s*/10', clean(body))
        paragraphs = []
        for p in re.finditer(r'<p\b[^>]*>(.*?)</p>', body, flags=re.S | re.I):
            value = clean(p[1])
            if not value or re.search(r'^Rating:', value) or 'Illustration by' in value:
                continue
            paragraphs.append({'text': value, 'locator': {'paragraph': len(paragraphs)+1}, 'links': re.findall(r'<a\b[^>]*href=["\']([^"\']+)', p[1])})
        sections.append({'heading': heading, 'grade': float(rating[1]) if rating else None, 'paragraphs': paragraphs})
    return sections


def indexed_sections(raw):
    lines = {int(n): v.strip() for n, v in re.findall(r'L(\d+):\s*(.*?)(?=L\d+:|\n|$)', raw)}
    sections = []
    for number, value in sorted(lines.items()):
        if re.match(r'#{2,3} (?!Rating:)', value):
            sections.append({'heading': clean(re.sub(r'^#+ ', '', value)), 'grade': None, 'paragraphs': [], 'startLine': number})
        elif sections:
            rating = re.search(r'Rating:\s*([\d.]+)\s*/5', value)
            if rating:
                sections[-1]['grade'] = float(rating[1])
            elif sections[-1]['grade'] is not None and value and value != '* * *' and not re.search(r'Image:|^Rating:|^\*\*Rating', value):
                sections[-1]['paragraphs'].append({'text': clean(value), 'locator': {'indexedLine': number}, 'links': []})
    return sections


def build(captures):
    cards = json.loads((ROOT/'data/fra_preview.json').read_text())['cards']
    by_id = {c['id']: c for c in cards}
    mentions = [(c['id'], re.compile(r'(?<!\w)'+re.escape(c['name'].split(' // ')[0]).replace("'", "['’]")+r'(?!\w)', re.I)) for c in cards]
    all_sources = []
    for source_path in sorted((RESEARCH/'sources').glob('*.json')):
        source = json.loads(source_path.read_text())
        if source['kind'] != 'review':
            continue
        sid = source['id']
        filename = 'fra-draftsim.html' if sid == 'draftsim' else f"fra-{sid.replace('zone-blue', 'zone-blue-full')}.txt"
        path = captures/filename
        raw = path.read_text()
        assert hashlib.sha256(path.read_bytes()).hexdigest() == source['captureSha256'], f'Unexpected capture version: {sid}'
        sections = html_sections(raw) if sid == 'draftsim' else indexed_sections(raw)
        grouped = {}
        for row in source['assessments']:
            grouped.setdefault(normalize(row['locator']['heading']), []).append(row)
        selected = []
        for section in sections:
            group = grouped.get(normalize(section['heading']))
            if not group:
                continue
            assert all(r['grade'] == section['grade'] for r in group), f'Grade mismatch: {sid}/{section["heading"]}'
            paragraphs = []
            for p in section['paragraphs']:
                # MTGAZone footer/summary is not part of the final card's review.
                if re.match(r'^(?:##|Share|Related|Subscribe|Leave a|J2SJosh|Previous|Next|Tags:)', p['text']):
                    break
                ids = [cid for cid, pattern in mentions if pattern.search(p['text'])]
                topics = [name for name, pattern in TOPICS.items() if re.search(pattern, p['text'], re.I)]
                paragraphs.append({
                    'id': f"{sid}:{len(selected)+1}:p{len(paragraphs)+1}",
                    'locator': p['locator'], 'textSha256': digest(p['text']),
                    'wordCount': len(p['text'].split()), 'mentionedCardIds': ids,
                    'relatedCardIds': [cid for cid in ids if cid not in {r['cardId'] for r in group} and not by_id[cid]['typeLine'].startswith('Basic Land')],
                    'topicMentions': topics,
                })
            assert paragraphs, f'Missing prose: {sid}/{section["heading"]}'
            selected.append({
                'id': f'{sid}:{len(selected)+1}', 'heading': section['heading'],
                'cardIds': [r['cardId'] for r in group], 'scope': group[0]['scope'],
                'grade': section['grade'], 'paragraphs': paragraphs,
                'semanticAssessmentStatus': 'not-extracted',
            })
        indexed_ids = [cid for s in selected for cid in s['cardIds']]
        assert len(indexed_ids) == len(set(indexed_ids)) == len(source['assessments']), sid
        all_sources.append({
            'id': sid, 'url': source['url'], 'author': source['author'],
            'dependencyGroup': source['dependencyGroup'], 'capturedAt': source['capturedAt'],
            'captureSha256': source['captureSha256'], 'captureFilename': filename,
            'method': 'mechanical-passage-index', 'sections': selected,
        })
    rows = []
    for card in cards:
        if card['typeLine'].startswith('Basic Land'):
            continue
        refs = [{'sourceId': source['id'], 'dependencyGroup': source['dependencyGroup'], 'sectionId': section['id'], 'scope': section['scope'], 'paragraphCount': len(section['paragraphs'])}
                for source in all_sources for section in source['sections'] if card['id'] in section['cardIds']]
        assert len(set(r['dependencyGroup'] for r in refs)) == 2, card['name']
        rows.append({'cardId': card['id'], 'name': card['name'], 'passageReferences': refs})
    result = {'schemaVersion': 1, 'set': 'FRA', 'status': 'research-only',
              'warning': 'Passage presence and lexical mentions are not substantive assessments, endorsements, or confirmed synergies.',
              'sources': all_sources, 'cards': rows}
    output = RESEARCH/'extraction/review-index.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    report = {
        'cardsWithTwoReviewPassages': len(rows),
        'reviewerGroups': sorted(set(s['dependencyGroup'] for s in all_sources)),
        'sourceDocuments': len(all_sources),
        'sections': sum(len(s['sections']) for s in all_sources),
        'paragraphs': sum(len(section['paragraphs']) for s in all_sources for section in s['sections']),
        'paragraphsWithCardReferences': sum(bool(p['mentionedCardIds']) for s in all_sources for section in s['sections'] for p in section['paragraphs']),
        'substantiveAssessmentCoverage': 'Not established by this index; existing prose extraction remains selective.',
    }
    (RESEARCH/'extraction/index-coverage.json').write_text(json.dumps(report, indent=2)+'\n')
    references = [
        {'sourceId': source['id'], 'passageId': paragraph['id'],
         'subjectCardId': subject, 'mentionedCardId': related,
         'relationshipType': 'unclassified-mention'}
        for source in all_sources for section in source['sections']
        for paragraph in section['paragraphs'] for subject in section['cardIds']
        for related in paragraph['relatedCardIds']
    ]
    (RESEARCH/'extraction/card-mentions.json').write_text(json.dumps({
        'status': 'research-only',
        'warning': 'These are literal card references, not inferred synergies, matchups, or recommendations.',
        'records': references,
    }, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--captures', type=Path, required=True)
    build(parser.parse_args().captures)
