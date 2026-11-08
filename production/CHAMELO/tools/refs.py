import sys, json, re
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
P = Play(sys.argv[1])
refs = P.ev('''(()=>{const out=new Set();const seen=new Set();
function walk(o){if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);for(const k in o){const v=o[k];if(typeof v==='string'&&v.startsWith('assets/'))out.add(v);else walk(v);}}
walk(LAB1248.E.DATA);return [...out]})()''')
P.close()
code = open('/tmp/claude-0/-home-claude/f4712dc8-8b9f-5103-a819-27050e2d19ad/scratchpad/ch6/all_code.html').read()
lits = set(re.findall(r"""['"](assets/[^'"]+)['"]\s*[,}\]);]""", code))
print('DATA refs', len(refs)); print('code literals', len(lits))
s = open(sys.argv[1], encoding='utf-8').read()
keys = [(m.start(), m.group(1), len(m.group(2))) for m in re.finditer(r'"([^"]{3,120})": ?"data:[a-z/+]+;base64,([A-Za-z0-9+/=]+)"', s)]
last = {}
for pos, k, n in keys: last[k] = pos
used = set(refs) | set(r for r in lits if not r.startswith('assets/scenes/') or r in refs) | {'assets/ui/portada_reparto.webp'}
tot = 0
for pos, k, n in keys:
    why = 'dup' if last[k] != pos else ('unused' if k not in set(refs) else '')
    if why: tot += n; print(why, k, n // 1024, 'KB b64')
print('removable', tot // 1024 // 1024, 'MB')
print(sorted(set(refs) - set(k for _, k, _ in keys)))
