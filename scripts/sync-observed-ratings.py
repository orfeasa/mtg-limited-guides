#!/usr/bin/env python3
"""Capture published Untapped tiers and matching statistics; never infer missing tiers."""
import datetime
import html
import json
import math
from pathlib import Path
import re
import sys
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'data/sets.json').read_text())
set_id = sys.argv[1] if len(sys.argv) > 1 else 'fra'
config = next(s for s in manifest['sets'] if s['id'] == set_id)
url = config['observedRatingsUrl']
if len(sys.argv) > 2:
    page = Path(sys.argv[2]).read_text()
else:
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Limited Field Guides data refresh'})) as response:
        page = response.read().decode()
assert 'Tiering by In Hand WR' in page, 'Unexpected tier metric'
ssr = json.loads(re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', page, re.S)[1])['props']['pageProps']['ssrProps']
payload = ssr['limitedCardStatsResp']['data']
fields = payload['metadata']['fields']
def stat(title_id, field):
    i, j = next((i, group.index(field)) for i, group in enumerate(fields) if field in group)
    result = 0
    for rank in ['b', 's', 'g', 'p']:
        groups = payload['data'].get(title_id, {}).get('ALL', {}).get(rank, [])
        values = groups[i] if len(groups) > i else None
        result += (values[j] or 0) if values and len(values) > j else 0
    return result
cards = json.loads((ROOT / 'data' / config['dataFile']).read_text())['cards']
by_front = {c['name'].split(' // ')[0]: c for c in cards if not c['typeLine'].startswith('Basic Land')}
assert len(by_front) == len([c for c in cards if not c['typeLine'].startswith('Basic Land')])
rows = {}
rank = 0
for chunk in re.split(r'<span[^>]*>Tier</span>', page)[1:]:
    heading = chunk.split('includingCards')[0]
    tier = ''.join(re.findall(r'>([SABCDF?+−-])<', heading)).replace('−', '-')
    assert tier in ['S','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F','?'], tier
    for title_id, body in re.findall(r'<a href="[^" ]*/card-data\?includingCards=(\d+)"[^>]*>(.*?)</a>', chunk, re.S):
        name = html.unescape(re.search(r'<img alt="([^"]+)"', body)[1])
        if name not in by_front:
            continue  # Bonus-sheet cards are outside this guide's imported card file.
        card = by_front[name]
        assert card['id'] not in rows, f'Duplicate source card: {name}'
        games, wins = stat(title_id, 'available_games'), stat(title_id, 'available_wins')
        opening, opening_wins = stat(title_id, 'in_opening_hands'), stat(title_id, 'in_opening_hand_wins')
        assert 0 <= wins <= games and 0 <= opening_wins <= opening
        if tier != '?':
            assert games > 0, f'Rated card without games: {name}'
            rank += 1
        rows[card['id']] = dict(name=card['name'], sourceTitleId=title_id, tier=None if tier == '?' else tier,
            rank=None if tier == '?' else rank, stats=dict(inHandGames=games, inHandWins=wins,
            inHandWinRate=math.floor(wins/games*1000 + 0.5)/10 if games else None,
            openingHandGames=opening, openingHandWinRate=math.floor(opening_wins/opening*1000 + 0.5)/10 if opening else None))
assert set(rows) == {c['id'] for c in by_front.values()}, 'Incomplete source coverage; retain previous snapshot'
result = dict(source='Untapped.gg', url=url, format='Premier Draft', rankRange='Bronze–Platinum',
    metric='In Hand WR', capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    sourceUpdatedAt=ssr['limitedCardStatsResp']['lastModified'],
    matches=sum(payload['metadata']['games']['ALL'].values()), ratedCards=rank, cards=rows)
output = ROOT / 'data' / config['observedRatingsFile']
if output.exists():
    previous = json.loads(output.read_text())
    comparable = lambda d: {k:v for k,v in d.items() if k not in ['capturedAt','sourceUpdatedAt']}
    if comparable(previous) == comparable(result):
        print('No material observed-rating changes.'); sys.exit(0)
output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
print(f'Captured {rank}/{len(rows)} tiers from {result["matches"]:,} matches; {len(rows)-rank} remain unrated.')
