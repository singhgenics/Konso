#!/bin/bash
# usage: src/v2/vid.sh <id> <start-image-file>   Veo Lite i2v, same start and end frame = seamless loop; ~10 credits.
set -u; cd "$(dirname "$0")"; export GFLOW_CLI_UPDATE_CHECK=0
id=$1; img=$2; PROJECT=$(cat PROJECT_ID)
prompt=$(grep "^$id|" vprompts.txt | cut -d'|' -f2-)
[ -f vraw/$id.mp4 ] && { echo "skip $id"; exit 0; }
gflow video i2v --initial-frame "$img" --end-frame "$img" "$prompt" --aspect 16:9 --model veo-lite --project "$PROJECT" --out-file vraw/$id.mp4 --json > vraw/$id.json 2> vraw/$id.err
[ -f vraw/$id.mp4 ] && echo "video $id ok" || { echo "FAILED $id"; tail -c 600 vraw/$id.err; }
