#!/usr/bin/env python3
"""Import public episode decklists from previously downloaded Archidekt JSON."""
import argparse
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'data/research/fra/extraction/licensed'

def extract(captures):
    canonical=json.loads((ROOT/'data/fra_preview.json').read_text())['cards']
    names={c['name']:c['id'] for c in canonical}
    names.update({c['name'].split(' // ')[0]:c['id'] for c in canonical})
    decks=[]
    for who,number in [('jim',26640427),('kenji',26640645),('marshall',26640835)]:
        p=captures/f'fra-{who}-deck.json'
        raw=json.loads(p.read_text()); rows=[]
        for entry in raw['cards']:
            name=entry['card']['oracleCard']['name']
            categories=entry['categories']
            zone='sideboard' if 'Sideboard' in categories else 'maybeboard' if 'Maybeboard' in categories else 'main'
            rows.append({'name':name,'cardId':names.get(name), 'sourceOracleId':entry['card']['oracleCard']['uid'],
                         'quantity':entry['quantity'],'zone':zone,'categories':categories,'notes':entry.get('notes')})
        assert sum(r['quantity'] for r in rows if r['zone']=='main')==40,who
        decks.append({'id':f'{who}-deck','sourceUrl':f'https://archidekt.com/decks/{number}',
            'sourceApiUrl':f'https://archidekt.com/api/decks/{number}/',
            'name':raw['name'],'description':raw.get('description'),'capturedAt':'2026-09-22',
            'sourceCaptureSha256':hashlib.sha256(p.read_bytes()).hexdigest(),
            'dependencyGroup':'tcc110','permissionId':'user-reported-noncommercial-permissions-2026-09-22',
            'interpretation':'Published main decks and unused pools; not proof of every in-game configuration or a judgement on cut cards.',
            'cards':rows,
            'totals':{z:sum(r['quantity'] for r in rows if r['zone']==z) for z in ['main','sideboard','maybeboard']}})
    (DEST/'decklists.json').write_text(json.dumps({'status':'research-only','decks':decks},indent=2,ensure_ascii=False)+'\n')
    print([(d['id'],d['totals']) for d in decks])

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--captures',type=Path,required=True)
    extract(parser.parse_args().captures)
