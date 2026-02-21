const {NodeSDK} = require('@opentelemetry/sdk-node');
const {HttpInstrumentation} = require('@opentelemetry/instrumentation-http'); // XXX diagch
const {UndiciInstrumentation} = require('@opentelemetry/instrumentation-undici');

function startNodeSDK() {
  const instrumentations = [
    new HttpInstrumentation(),
    new UndiciInstrumentation(),
  ];

  const sdk = new NodeSDK({
    instrumentations,
  });
  sdk.start();

  process.once('beforeExit', async () => {
    await sdk.shutdown();
  });

  return sdk; // has a `sdk.shutdown()`
}

module.exports = {
  startNodeSDK,
};
