2026-02-21

A (quick?) stab at stripping OTel JS down to just parts comparable to:
https://github.com/nodejs/node/pull/61907
to see if the result *is* compelling and/or comparable. That is:

- just tracing
- just http+json exporter
- just node, no browser compat
- hardcode propagator to w3c trace-context; just traceparent, no tracestate
- no baggage
- hardcoded AsyncLocalStorage for context manager
- just 'http' and 'undici' instrumentations
- no R/IITM support, or at least that's fully up to instrs
- no resource detectors
- no API, sampling, processors
- no config (other than OTLP endpoint, no auth)

# Usage

```
# export NODE_OTEL_ENDPOINT=https://collector.example.com:4318
# export NODE_OTEL_FILTER=node:http

export NODE_OTEL=1
node app.js
```

vs.

```
npm install [-g] ttel     # A benefit of being built-in is no separate install.

# export OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.example.com:4318
# export OTEL_EXPORTER_OTLP_HEADERS="Authorization=..."
# export OTEL_SERVICE_NAME=myapp
# ...

export NODE_OPTIONS="--import=ttel"
node app.js
```

# Attempts

Each subsection here is an attempt at instrumenting `app.js` with OTel JS,
progressively trying to simplify and strip it down. One of the goals is to
see how much "bloat" we are talking about currently and in the limit.

(Note that I have not included an attempt using `@opentelemetry/auto-instrumentations-node`
because it includes 41 instrumentations and 5 cloud-related resource detectors
that aren't relevant for comparison with #61907.)

## 1.x: using `@opentelemetry/sdk-node`

Let's start with using the `NodeSDK` class that is an (experimental, i.e. 0.x)
convenience for setting up providers et al for all signals, exporters, resource detectors, etc.

The main bit is: https://github.com/trentm/ttel/blob/1.x/lib/sdk.js#L5-L21

```
% du -sh node_modules
 54M	node_modules
```

[Details.](./docs/1.x-using-otel-node-sdk.md)


## 2.x: using lower-level OTel JS SDK primitives

The `sdk-node` package includes all the signals, all the exporter flavours, etc.
If we use the lower-level primitives (mostly from stable `1.x` SDK packages),
and limit to tracing and the "http+json" flavour of OTLP, then we can reduce
a little bit, though not spectacularly.

```
% du -sh node_modules
 41M	node_modules
```

- https://github.com/trentm/ttel/blob/2.x/lib/sdk.js
- The main diff to 1.x: https://github.com/trentm/ttel/compare/1.x...2.x#diff-e8375fb7b08ee24ea1262c07ab1fd6eefdeadd2625c47e2219f34ae7699f4475
- [Details.](./docs/1.x-using-otel-node-sdk.md)

## 3.x: manually stripping down OTel JS SDK packages

In this attempt, I stripped out some parts of `@opentelemetry/*` package
installs to approach a closer apples-to-apples comparison to the vanilla
JS, included-in-core https://github.com/nodejs/node/pull/61907 code. This
got me down from 41M to **~700K**, while requiring no usage changes for the
HTTP tracing example we've been using.

```
% du -sh node_modules
696K	node_modules
```

- The main changes are:
    1. Tweaks to opentelemetry-js.git packages to strip out things like metrics, logs, protobuf: https://github.com/open-telemetry/opentelemetry-js/compare/main...trentm:opentelemetry-js:trentm-strip-for-parts
    2. A script that (a) removes cruft from `node_modules/@opentelemetry/...` and (b) bundles each package with esbuild to reduce each to a single file: https://github.com/trentm/ttel/blob/main/scripts/reup.sh
- Full changes to 2.x: https://github.com/trentm/ttel/compare/2.x...3.x

For comparison, the bundled undici in node is ~690K.

<details>
    <summary>The set of changes I made:</summary>

- drop `*/build/{esm,esnext}` (for most packages) -> 29M
- drop `.map` and `.d.ts` files -> 23M
- drop deprecated bits of semconv package -> 22M
- tree-shake otlp-transformer (just trace, no protobuf) -> 11M
- tree-shake instrumentation (can now drop api-logs dep) -> 10M
- apply first two "drop" bullets to otlp-exporter-base, as well -> 9M
- drop meta files (READMEs, etc)
- drop lingering protobufjs deps (missed above) -> 5.4M
- drop @types/node (unused) -> 3.1M
- drop IITM and some other deps -> 1.9M
  (because we are comparing to #61907 which only has diagchan-based instrumentations)
- drop a few other small things -> 1.6M
- esbuild to bundle each dep to a single file -> 696K
  (reduces size due to many small files each taking the min filesystem block size, 4k on my system).

</details>

With my changes this gets *closer* to an apples-to-apples comparison to #61907,
but it is still covering a lot more of the OTel spec that #61907: resource detectors,
propagator API, context API, still has the metrics parts of the "api" package,
baggage, tracestate, SDK configurability, still has RITM for hooking, etc.

<details>
    <summary>The remaining size contributions by package</summary>

```
% du -sk node_modules/[a-z]* node_modules/@*/* | sort -n
8	node_modules/@opentelemetry/exporter-trace-otlp-http
12	node_modules/@opentelemetry/sdk-trace-node
16	node_modules/@opentelemetry/context-async-hooks
16	node_modules/module-details-from-path
16	node_modules/ms
20	node_modules/@opentelemetry/otlp-transformer
28	node_modules/@opentelemetry/semantic-conventions
32	node_modules/forwarded-parse
32	node_modules/require-in-the-middle
40	node_modules/@opentelemetry/instrumentation-undici
40	node_modules/@opentelemetry/resources
48	node_modules/@opentelemetry/otlp-exporter-base
56	node_modules/@opentelemetry/instrumentation
60	node_modules/@opentelemetry/core
60	node_modules/@opentelemetry/sdk-trace-base
60	node_modules/debug
64	node_modules/@opentelemetry/api
68	node_modules/@opentelemetry/instrumentation-http
```

</details>
