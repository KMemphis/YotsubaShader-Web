#!/bin/sh
# Builds both PDFs, the editable source package and, when this folder lives inside the website,
# copies them to src/static/downloads so the site publishes them.
#   ./build.sh           PDFs and package
#   CHECK=1 ./build.sh   also compiles the C# listings (needs the .NET 8 SDK and the YotsubaShader repository)
set -e
cd "$(dirname "$0")"
NAME=yotsuba-shader-engine-guide

node tools/translate-code.mjs
[ -f ../src/reference.mjs ] && node tools/gen-reference.mjs
[ -n "$CHECK" ] && ./tools/check/check.sh

mkdir -p out
typst compile --root . guide-en.typ "out/$NAME-en.pdf"
typst compile --root . guide-es.typ "out/$NAME-es.pdf"

rm -f "out/$NAME-source.zip"
zip -qr "out/$NAME-source.zip" README.md build.sh template.typ guide-en.typ guide-es.typ code generated assets tools \
  -x '*/bin/*' '*/obj/*' '*.DS_Store'

if [ -d ../src/static ]; then
  mkdir -p ../src/static/downloads
  cp "out/$NAME-en.pdf" "out/$NAME-es.pdf" "out/$NAME-source.zip" ../src/static/downloads/
  echo "Copied to ../src/static/downloads/"
fi
ls -la out
