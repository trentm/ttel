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
