#!/bin/bash

if [ "$TRACE" != "" ]; then
    export PS4='${BASH_SOURCE}:${LINENO}: ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
    set -o xtrace
fi
set -o errexit
set -o pipefail

TOP=$(cd $(dirname $0)/../ >/dev/null; pwd)
OJ_SRC_DIR=/Users/trentm/tm/opentelemetry-js13
OJC_SRC_DIR=/Users/trentm/tm/opentelemetry-js-contrib13

function reup {
  local src=$1
  local dst=$2
  echo "reup $src $dst"
  rm -rf node_modules/$dst/build
  mkdir -p node_modules/$dst/build
  cp -PR $OJ_SRC_DIR/$src/build/src node_modules/$dst/build/src
}
function reup-bundle {
  local src=$1
  local dst=$2
  echo "reup-bundle $src $dst"
  rm -rf node_modules/$dst/build
  (cd $OJ_SRC_DIR/$src &&
    $TOP/scripts/node_modules/.bin/esbuild build/src/index.js --bundle \
      --outfile=./bundle.js --platform=node --packages=external)
  mkdir -p node_modules/$dst/build/src
  cp -PR $OJ_SRC_DIR/$src/bundle.js node_modules/$dst/build/src/index.js
}

reup-bundle api @opentelemetry/api
reup-bundle packages/opentelemetry-context-async-hooks @opentelemetry/context-async-hooks
reup-bundle packages/opentelemetry-core @opentelemetry/core
reup-bundle experimental/packages/exporter-trace-otlp-http @opentelemetry/exporter-trace-otlp-http
reup-bundle experimental/packages/opentelemetry-instrumentation-http @opentelemetry/instrumentation-http
reup-bundle experimental/packages/opentelemetry-instrumentation @opentelemetry/instrumentation
reup-bundle packages/opentelemetry-resources @opentelemetry/resources
reup-bundle packages/opentelemetry-sdk-trace-base @opentelemetry/sdk-trace-base
reup-bundle packages/opentelemetry-sdk-trace-node @opentelemetry/sdk-trace-node

reup-bundle semantic-conventions @opentelemetry/semantic-conventions
reup-bundle experimental/packages/otlp-transformer @opentelemetry/otlp-transformer
# Note: Hacked otlp-exporter-base to just have the single entry point.
reup-bundle experimental/packages/otlp-exporter-base @opentelemetry/otlp-exporter-base

find node_modules/@opentelemetry -name "*.map" | xargs rm
find node_modules/@opentelemetry -name "*.d.ts" | xargs rm

rm -rf node_modules/@opentelemetry/sdk-logs
rm -rf node_modules/@opentelemetry/api-logs
rm -rf node_modules/@opentelemetry/sdk-metrics

find node_modules/@opentelemetry -name "README.md" | xargs rm
find node_modules/@opentelemetry -name "LICENSE" | xargs rm

rm -rf node_modules/protobufjs
rm -rf node_modules/@protobufjs

rm -rf node_modules/@types/node
rm -rf node_modules/undici-types

rm -rf node_modules/long

rm -rf node_modules/import-in-the-middle
rm -rf node_modules/acorn
rm -rf node_modules/acorn-import-attributes
rm -rf node_modules/cjs-module-lexer


