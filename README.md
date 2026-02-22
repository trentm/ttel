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

[notes](./docs/1.x-using-otel-node-sdk.md)

```
% du -sh node_modules
 54M	node_modules
```

