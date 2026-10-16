#!/bin/sh
# Renders the two final videos in 4K / 60 fps: English and Spanish, 58 seconds each, without the recorded intro.
cd "$(dirname "$0")/.."
OPTS="--public-dir=remotion/public --codec=h264 --crf=15 --pixel-format=yuv420p --scale=2"
npx remotion render remotion/index.ts PromoA-en YotsubaShader_Promo_en_4K60.mp4 $OPTS
npx remotion render remotion/index.ts PromoA-es YotsubaShader_Promo_es_4K60.mp4 $OPTS
