#!/bin/bash
# CHAMELO RC18 = RC17 (intacta) + patch_rc18.py (correcciones de la auditoría) + rc18.js. Hoja del protagonista en work/player_rc18
# (se rehace con: tools/build_player_rc18.py <dir con k216 k222 k223 = fotogramas de los clips 1000700216/222/223 con croma de G11/tools/key_player.py> work/player_rc18).
set -e; cd "$(dirname "$0")/../.."
python3 production/CHAMELO/patch_rc18.py builds/1248_CHAMELO_RC17.html builds/1248_CHAMELO_RC18.html production/CHAMELO/work/player_rc18
