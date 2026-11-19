#!/bin/bash
# usage: src/v2/run.sh [id ...]   resumable; one job at a time; paced for the Flow WAF.
# Outputs: src/v2/raw/<id>.<ext>; media ids appended to src/v2/media.tsv
set -u
cd "$(dirname "$0")"
export GFLOW_CLI_UPDATE_CHECK=0
PROJECT=$(cat PROJECT_ID)
want=" $* "
run_one(){ # id aspect ref kind subject
  local id=$1 asp=$2 ref=$3 kind=$4 subj=$5
  [ $# -gt 0 ] && [ "$want" != "  " ] && [[ "$want" != *" $id "* ]] && return
  ls raw/$id.* >/dev/null 2>&1 && { echo "skip $id"; return; }
  local prompt="$subj"
  [ "$kind" = dish ] && prompt="$subj $(cat style-dish.txt)"
  [ "$kind" = drink ] && prompt="$subj $(cat style-drink.txt)"
  echo "$prompt" > prompts/$id.txt
  local d=$(mktemp -d)
  for try in 1 2; do
    if [ -n "$ref" ]; then gflow image i2i "$prompt" --ref "$ref" --project "$PROJECT" --model nano2 --aspect "$asp" -n 2 --out "$d" --json >"$d/log" 2>"$d/err"
    else gflow image t2i "$prompt" --project "$PROJECT" --model nano2 --aspect "$asp" -n 2 --out "$d" --json >"$d/log" 2>"$d/err"; fi
    n=$(ls "$d"/*.png "$d"/*.jpg "$d"/*.jpeg "$d"/*.webp 2>/dev/null | wc -l | tr -d ' ')
    [ "$n" -gt 0 ] && break
    grep -qi -E "unusual activity|403" "$d/err" && { echo "BLOCKED at $id"; tail -2 "$d/err"; exit 3; }
    echo "retry $id"; sleep 60
  done
  [ "$n" -gt 0 ] || { echo "FAILED $id"; tail -3 "$d/err"; return; }
  i=0; for f in $(ls "$d"/*.png "$d"/*.jpg "$d"/*.jpeg "$d"/*.webp 2>/dev/null); do i=$((i+1)); cp "$f" "raw/$id-$i.${f##*.}"; done
  touch raw/$id.done
  python3 -c "import json,sys;d=json.load(open('$d/log'));print(json.dumps(d)[:2000])" > raw/$id.json 2>/dev/null || cp "$d/log" raw/$id.json
  echo "done $id ($n takes)"
  sleep 75
}
while IFS='|' read -r id asp rest; do [ -z "$id" ] && continue; run_one "$id" "$asp" "" scene "$rest"; done < scenes.txt
while IFS='|' read -r id asp ref kind subj; do [ -z "$id" ] && continue; run_one "$id" "$asp" "$ref" "$kind" "$subj"; done < jobs.txt
echo ALL-DONE
