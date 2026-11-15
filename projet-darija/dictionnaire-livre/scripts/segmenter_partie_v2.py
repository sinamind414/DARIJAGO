#!/usr/bin/env python3
"""Draft lexical segmentation for OCR dictionary pages.

This is NOT a validated linguistic parser. It keeps raw OCR blocks and page
provenance, and flags uncertainty for human review.
"""
import argparse, json, pathlib, re, unicodedata

BIDI = dict.fromkeys(map(ord, '\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069'), None)
HEAD_FIRST_STOP = {
    'je', "j'", 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
    'ce', 'ceci', 'cela', "c'", 'le', 'la', 'les', 'un', 'une', 'des', 'du',
    'de', "d'", "l'", 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
    'par', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'vers', 'chez',
    'comme', 'quand', 'si', 'mais', 'ou', 'et', 'donc', 'or', 'ni', 'car',
    'que', 'qui', 'quoi', 'dont', 'où', 'quel', 'quelle', 'quels', 'quelles',
    'comment', 'combien', 'pourquoi', 'faites', 'faisons', 'font', 'sont',
    'est', 'suis', 'es', 'sommes', 'êtes', 'ai', 'as', 'avons', 'avez', 'ont',
    'ex', 'aor', 'pl', 'f', 'm', 'voy', 'voir', 'note', 'remarque',
}
# Two-letter strings that are plausible dictionary headwords, not only function words.
SHORT_ALLOW = {'a', 'an', 'as', 'au', 'ça', 'ci', 'du', 'en', 'eu', 'os', 'or', 'ou', 'nu', 'pu', 'ru', 'us', 'vu'}

HEAD_RE = re.compile(
    r"(?P<head>[A-ZÀ-ÖØ-ÞŒÆ][A-Za-zÀ-ÖØ-öø-ÿœæ'’\- ]{0,58}?)"
    r"(?P<qual>\s*\([^)\n]{1,90}\))?"
    r"\s*(?P<punct>[,.])(?=\s|$)"
)
AR_RE = re.compile(r'[\u0600-\u06FF]')
CONJ_RE = re.compile(r"\b(?:Je|J'|Il|Elle|Nous|Vous|Ils|Elles|aor\.|pl\.|f\.|m\.)\b")

def clean(s):
    s = unicodedata.normalize('NFKC', s).translate(BIDI)
    s = s.replace('’', "'").replace('‘', "'").replace('`', "'")
    return re.sub(r'[ \t]+', ' ', s).strip()

def is_header(line):
    l = line.strip(' .,;:')
    if not l:
        return True
    if re.fullmatch(r'\d{1,3}', l):
        return True
    if re.fullmatch(r'[A-ZÀ-ÖØ-Þ]{2,}\s+\d{1,3}', l):
        return True
    if re.fullmatch(r'\d{1,3}\s+[A-ZÀ-ÖØ-Þ]{2,}', l):
        return True
    if re.fullmatch(r'[|\s\d.,;:—–-]+', l):
        return True
    return False

def printed_page(lines):
    for line in lines[:4]:
        l = clean(line).strip(' .,;:')
        m = re.fullmatch(r'([A-ZÀ-ÖØ-Þ]{2,})\s+(\d{1,3})', l)
        if m:
            return int(m.group(2))
        m = re.fullmatch(r'(\d{1,3})\s+([A-ZÀ-ÖØ-Þ]{2,})', l)
        if m:
            return int(m.group(1))
    return None

def plausible_head(head):
    h = clean(head)
    if not h or len(h) > 65:
        return False, 'empty_or_too_long'
    if re.search(r'\d', h):
        return False, 'digit_in_headword'
    first = re.split(r"[\s']+", h.lower())[0]
    if first in HEAD_FIRST_STOP:
        return False, 'sentence_or_function_word_start'
    if h.isupper() and len(h) > 3:
        return False, 'uppercase_noise'
    if re.search(r'\b[A-ZÀ-ÖØ-Þ]{2,}\b', h):
        return False, 'uppercase_cluster_noise'
    if re.match(r"^C'", h, re.I):
        return False, 'sentence_start'
    if len(h) <= 2 and h.lower() not in SHORT_ALLOW:
        return False, 'short_fragment'
    if h.count('(') != h.count(')'):
        return False, 'unbalanced_parenthesis'
    return True, ''

def candidates_in_line(line):
    """Yield candidate starts at line start or after a | / || separator."""
    l = clean(line)
    # Keep separators for boundary detection, but allow leading noise to be stripped.
    for m in HEAD_RE.finditer(l):
        start = m.start()
        prefix = l[:start].rstrip()
        at_line_start = start == 0 or re.fullmatch(r'[|\s—–\-•]*', prefix) is not None
        after_sep = bool(re.search(r'[|—–]\s*$', prefix))
        if not (at_line_start or after_sep):
            continue
        head = clean(m.group('head'))
        ok, reason = plausible_head(head)
        if not ok:
            continue
        qual = clean(m.group('qual') or '')
        tail = l[m.end():].strip()
        yield {
            'headword_fr': head,
            'headword_qualifier': qual,
            'tail': tail,
            'boundary': 'line_start' if at_line_start else 'separator',
        }

def segment(ocr_dir, start, end):
    ocr = pathlib.Path(ocr_dir)
    pages = {}
    for n in range(start, end + 1):
        f = ocr / f'page-{n:03d}.txt'
        if not f.exists():
            continue
        raw_lines = f.read_text(encoding='utf-8', errors='replace').splitlines()
        pages[n] = {
            'printed': printed_page(raw_lines),
            'lines': [clean(x) for x in raw_lines],
        }
    entries = []
    current = None
    for n, page in pages.items():
        lines = page['lines']
        for idx, line in enumerate(lines):
            if is_header(line):
                continue
            found = list(candidates_in_line(line))
            if not found:
                if current is not None:
                    current['raw_lines'].append(line)
                    current['page_end'] = n
                    current['printed_page_end'] = page['printed'] or current.get('printed_page_end')
                continue
            # If multiple candidates on one line, split the line at their positions.
            # Re-find positions to slice raw text accurately.
            positions = []
            for c in found:
                # Find the first occurrence of this headword + punctuation after previous position.
                pat = re.escape(c['headword_fr']) + r"(?:\s*\([^)\n]{1,90}\))?\s*[,.]"
                mm = re.search(pat, line)
                if mm:
                    positions.append((mm.start(), mm.end(), c))
            positions.sort(key=lambda x: x[0])
            for j, (s, e, c) in enumerate(positions):
                if current is not None:
                    # Append text before this candidate to previous entry.
                    before = line[:s].strip(' |—–-')
                    if before:
                        current['raw_lines'].append(before)
                    entries.append(current)
                block_end = positions[j + 1][0] if j + 1 < len(positions) else len(line)
                block = line[s:block_end].strip()
                current = {
                    'headword_fr': c['headword_fr'],
                    'headword_qualifier': c['headword_qualifier'],
                    'page_start': n,
                    'page_end': n,
                    'printed_page_start': page['printed'],
                    'printed_page_end': page['printed'],
                    'raw_lines': [block],
                    'detection': c['boundary'],
                    'flags': [],
                }
                # Look ahead for evidence when the candidate line has only the headword.
                if not AR_RE.search(c['tail']) and not CONJ_RE.search(c['tail']):
                    nxt = ''
                    for k in range(idx + 1, min(idx + 4, len(lines))):
                        if lines[k].strip():
                            nxt = lines[k]
                            break
                    if not AR_RE.search(nxt) and not CONJ_RE.search(nxt):
                        current['flags'].append('weak_entry_evidence')
        # Continue current entry across pages; page_end updated as lines append.
    if current is not None:
        entries.append(current)
    # Finalize blocks and flags.
    for e in entries:
        raw = clean(' '.join(e.pop('raw_lines')))
        e['raw_block'] = raw
        e['arabic_char_count'] = len(AR_RE.findall(raw))
        if e['arabic_char_count'] == 0:
            e['flags'].append('no_arabic_detected')
        if e['page_end'] > e['page_start']:
            e['flags'].append('cross_page_block')
        if re.search(r'\b(?:Je|J\')\b', raw):
            e['pos_guess'] = 'verb_candidate'
        elif re.search(r'\bpl\.', raw):
            e['pos_guess'] = 'noun_or_adj_candidate'
        else:
            e['pos_guess'] = None
        e['parser_version'] = 'lexical-2.1-draft'
        e['status'] = 'needs_review'
        e['confidence'] = 'unverified'
    return entries, pages

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ocr-dir', required=True)
    ap.add_argument('--dict-start', type=int, required=True)
    ap.add_argument('--dict-end', type=int, required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()
    entries, pages = segment(args.ocr_dir, args.dict_start, args.dict_end)
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'pages': len(pages),
        'candidates': len(entries),
        'with_arabic': sum(1 for e in entries if e['arabic_char_count'] > 0),
        'weak_evidence': sum(1 for e in entries if 'weak_entry_evidence' in e['flags']),
        'cross_page': sum(1 for e in entries if 'cross_page_block' in e['flags']),
    }, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
