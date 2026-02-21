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
npm install [-g] ttel     # The big benefit of being built-in.

# export OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.example.com:4318
# export OTEL_EXPORTER_OTLP_HEADERS="Authorization=..."
# export OTEL_SERVICE_NAME=my-app
# ...

export NODE_OPTIONS="--import=ttel"
node app.js
```

or, theoretically (though really an `npx`-based thing is only useful for dev and demo):

```
npx -y ttel node app.js
# Or even:
#   npx -y ttel app.js
```

