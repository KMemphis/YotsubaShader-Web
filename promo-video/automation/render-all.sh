#!/bin/sh
# Renders both versions in 4K / 60 fps. B = recorded intro + animated video, A = animated video alone.
cd "$(dirname "$0")/.."
OPTS="--public-dir=remotion/public --codec=h264 --crf=15 --pixel-format=yuv420p --scale=2"
npx remotion render remotion/index.ts PromoB-es YotsubaShader_Promo_B_fusionado_es_4K60.mp4 $OPTS
npx remotion render remotion/index.ts PromoA-es YotsubaShader_Promo_A_sin_intro_es_4K60.mp4 $OPTS
npx remotion render remotion/index.ts PromoA-en YotsubaShader_Promo_A_sin_intro_en_4K60.mp4 $OPTS
