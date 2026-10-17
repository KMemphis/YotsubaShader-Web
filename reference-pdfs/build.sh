#!/bin/sh
# Builds the two reference PDFs (syntax reference and backend compatibility), in English and Spanish, and copies
# them to src/static/downloads so the site publishes them.
#   ./build.sh
# Needs Typst and Node. The compatibility tables come from ../tools/compat/compat.json (see tools/compat/README.md).
set -e
cd "$(dirname "$0")"

node tools/gen-data.mjs

mkdir -p out
for doc in syntax-reference backend-compatibility; do
  for lang in en es; do
    typst compile --root .. "$doc-$lang.typ" "out/yotsuba-shader-$doc-$lang.pdf"
  done
done

mkdir -p ../src/static/downloads
cp out/*.pdf ../src/static/downloads/
echo "Copied to ../src/static/downloads/"
ls -la out
