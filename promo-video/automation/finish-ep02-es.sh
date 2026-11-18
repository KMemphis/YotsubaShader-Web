#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
set -e
npx remotion render remotion/index.ts Ep02-es ../.local/promo-video/out/ep02/Ep02_es_1080p60.mp4 --public-dir=remotion/public --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k --timeout=120000 --concurrency=4
node automation/publish-video.mjs ep02 "Cómo se construye un shader" es
echo FINISHED-ES
