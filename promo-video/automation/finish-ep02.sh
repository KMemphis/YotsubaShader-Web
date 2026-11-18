#!/bin/sh
# subtitles -> thumbnail -> render -> publish for video 2, English then Spanish
cd "$(dirname "$0")/.." || exit 1
set -e
for L in en es; do
  if [ "$L" = en ]; then SUF=""; TITLE="How a shader is built"; COMP=Ep02-en; THUMB=Ep02_thumbnail.png; else SUF="--lang es"; TITLE="Cómo se construye un shader"; COMP=Ep02-es; THUMB=Ep02_thumbnail_es.png; fi
  node automation/ep01-export.mjs --ep ep02 $SUF
  END=$(node -e "const t=require('./remotion/src/ep01/timing.ep02$( [ $L = en ] || echo .es ).json');console.log(Math.round((t.scenes.find(s=>s.id==='v2-s01-hook').end-3)*60))")
  npx remotion still remotion/index.ts $COMP ../.local/promo-video/out/ep02/$THUMB --frame=$END --public-dir=remotion/public
  npx remotion render remotion/index.ts $COMP ../.local/promo-video/out/ep02/Ep02_${L}_1080p60.mp4 --public-dir=remotion/public --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k --timeout=120000
  node automation/publish-video.mjs ep02 "$TITLE" $L
done
echo FINISHED-EP02
