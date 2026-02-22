const {
  context,
  propagation,
  trace,
} = require('@opentelemetry/api');
const {AsyncLocalStorageContextManager} = require('@opentelemetry/context-async-hooks');
const {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} = require('@opentelemetry/core');
const {
  defaultResource,
  envDetector,
  processDetector,
  hostDetector,
  detectResources
} = require('@opentelemetry/resources');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http');
const {registerInstrumentations} = require('@opentelemetry/instrumentation');
const {BatchSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');

const {HttpInstrumentation} = require('@opentelemetry/instrumentation-http');
const {UndiciInstrumentation} = require('@opentelemetry/instrumentation-undici');

function startNodeSDK() {
  const instrumentations = [
    new HttpInstrumentation(),
    new UndiciInstrumentation(),
  ];

  registerInstrumentations({instrumentations});

  const contextManager = new AsyncLocalStorageContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  const propagator = new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  });
  propagation.setGlobalPropagator(propagator);

  let resource = defaultResource();
  const detectors = [envDetector, processDetector, hostDetector];
  resource = resource.merge(detectResources({detectors}));

  const exporter = new OTLPTraceExporter();
  const spanProcessors = [new BatchSpanProcessor(exporter)];
  const tracerProvider = new NodeTracerProvider({resource, spanProcessors});
  trace.setGlobalTracerProvider(tracerProvider);

  const shutdownFn = () => {
    return tracerProvider.shutdown();
  };

  process.once('beforeExit', async () => {
    await shutdownFn();
  });

  return {
    shutdown: shutdownFn
  };
}

module.exports = {
  startNodeSDK,
};
