#!/bin/bash
# 2K upscales of the picks, then the three Veo loops and their 1080p upscales. Sequential (profile lock), resumable.
set -u; cd "$(dirname "$0")"; export GFLOW_CLI_UPDATE_CHECK=0; P=$(cat PROJECT_ID); mkdir -p up vraw
pick(){ python3 -c "import json;print(json.load(open('media-map.json'))['$1'][$2-1])"; }
for it in hero:1 wokstudio:1 kokumpour:2 steamer:1 baodown:1 fever:1 kpop:1 kokumsour:2 gose:1 lychee:2 margarita2:2; do
  id=${it%:*}; t=${it#*:}; ls up/$id.* >/dev/null 2>&1 && { echo "skip up $id"; continue; }
  mid=$(pick $id $t); d=$(mktemp -d)
  for try in 1 2 3; do gflow image upscale "$mid" --scale 2k --project "$P" --out "$d" >"$d/log" 2>&1; f=$(ls "$d"/*.{png,jpg,jpeg,webp} 2>/dev/null | head -1); [ -n "$f" ] && break; echo "retry up $id"; sleep 40; done
  [ -n "$f" ] && { cp "$f" "up/$id.${f##*.}"; echo "up $id"; } || { echo "FAILED up $id"; tail -2 "$d/log"; }
  sleep 30
done
for it in hero:1 wokstudio:1 kokumpour:2; do
  id=${it%:*}; t=${it#*:}; mid=$(pick $id $t); ./vid.sh $id $mid; sleep 30
done
echo FINISH-DONE
