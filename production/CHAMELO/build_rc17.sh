#!/bin/bash
# CHAMELO RC17 (guion definitivo, revisión 2): RC06 → rc07 → rc09 → rc10 → rc13 → rc14 → rc15 → rc17 (sin rc16).
# Uso: bash production/CHAMELO/build_rc17.sh
set -e; cd "$(dirname "$0")/../.."; T=${TMPDIR:-/tmp}/b17; mkdir -p $T; RC=RC17
python3 production/CHAMELO/patch_rc07.py referencias/1248_CHAMELO_RC06.html $T/b0.html $RC
python3 production/CHAMELO/patch_rc09.py $T/b0.html $T/b1.html $RC rc09.js
python3 production/CHAMELO/patch_rc09.py $T/b1.html $T/b2.html $RC rc10.js
python3 production/CHAMELO/patch_rc09.py $T/b2.html $T/b3.html $RC rc13.js
python3 production/CHAMELO/patch_rc09.py $T/b3.html $T/b4.html $RC rc14.js
python3 production/CHAMELO/patch_rc09.py $T/b4.html $T/b5.html $RC rc15.js
python3 production/CHAMELO/patch_rc17.py $T/b5.html builds/1248_CHAMELO_$RC.html $RC
