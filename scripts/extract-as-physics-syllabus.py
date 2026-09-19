"""Extract AS theory objectives from the user-supplied 9702 2025-2027 PDF.

Run with the PDF path as the only argument. Output is reproducible; superscript
and stacked-fraction corrections below are transcriptions checked against the PDF.
Practical assessment is separate and is not claimed as covered by this engine.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
from pypdf import PdfReader

source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
reader = PdfReader(source)
topics = []
group = objective = None
for page_number in range(16, 26):
    lines = reader.pages[page_number - 1].extract_text().splitlines()[3:]
    for line in lines:
        line = line.strip()
        if not line or line.startswith(('www.', 'AS Level', 'Candidates should')):
            continue
        section = re.fullmatch(r'(\d+\.\d+) (.+)', line)
        if section:
            group = {'id': section[1], 'title': section[2], 'objectives': []}
            topics[-1]['groups'].append(group)
            objective = None
            continue
        heading = re.fullmatch(r'(\d+) ([A-Z].+)', line)
        if heading and int(heading[1]) == len(topics) + 1:
            topics.append({'id': heading[1], 'title': heading[2], 'groups': []})
            group = objective = None
            continue
        item = re.fullmatch(r'(\d+)\s+([a-z].*)', line)
        if item and group and int(item[1]) == len(group['objectives']) + 1:
            objective = {'id': f'{group["id"]}.{item[1]}', 'text': item[2], 'page': page_number}
            group['objectives'].append(objective)
        elif objective:
            objective['text'] += ' ' + line

# Layout-aware repairs of equations whose fractions/superscripts extract out of order.
repairs = {
    '7.1.7': 'recall and use intensity = power/area and intensity ∝ (amplitude)^2 for a progressive wave',
    '5.2.3': 'derive, using the equations of motion, the formula for kinetic energy E_K = (1/2) mv^2',
    '5.2.4': 'recall and use E_K = (1/2) mv^2',
    '6.2.4': 'recall and use E_P = (1/2) Fx = (1/2) kx^2 for a material deformed within its limit of proportionality',
    '7.3.2': 'use the expression f_o = f_s v / (v ± v_s) for the observed frequency when a source of sound waves moves relative to a stationary observer',
    '7.5.2': 'recall and use Malus’s law (I = I_0 cos^2 θ) to calculate the intensity of a plane-polarised electromagnetic wave after transmission through a polarising filter or a series of polarising filters (calculation of the effect of a polarising filter on the intensity of an unpolarised wave is not required)',
    '9.2.3': 'recall and use P = VI, P = I^2 R and P = V^2 / R',
    '11.1.5': 'understand and use the notation ^A_Z X for the representation of nuclides',
    '11.1.11': 'represent α- and β-decay by a radioactive decay equation of the form ^238_92 U → ^234_90 Th + ^4_2 α',
}
objectives = [o for t in topics for g in t['groups'] for o in g['objectives']]
for o in objectives:
    if o['id'] in repairs:
        o['text'] = repairs[o['id']]
assert len(topics) == 11
assert [len(g['objectives']) for t in topics for g in t['groups']] == [2,4,3,3,9,6,3,4,4,3,6,7,4,6,4,7,2,2,3,2,4,2,4,2,4,3,8,5,7,4,12,6]
assert len({o['id'] for o in objectives}) == len(objectives)
assert len({o['text'] for o in objectives}) == len(objectives)
result = {'provenance': {'filename': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'examYears': [2025, 2026, 2027], 'version': 1, 'pages': '16–25',
    'scope': 'AS theory topics 1–11; practical assessment is separate',
    'equationTranscriptions': list(repairs)}, 'topics': topics}
destination = root / 'lib/as-physics-syllabus.json'
destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'topics': len(topics), 'groups': sum(len(t['groups']) for t in topics),
    'objectives': len(objectives), 'duplicates': 0, 'countsByTopic': {t['id']: sum(len(g['objectives']) for g in t['groups']) for t in topics}}))
