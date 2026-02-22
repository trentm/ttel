/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export { W3CBaggagePropagator } from './baggage/propagation/W3CBaggagePropagator.mjs';
export { AnchoredClock } from './common/anchored-clock.mjs';

export { isAttributeValue, sanitizeAttributes } from './common/attributes.mjs';
export {
  globalErrorHandler,
  setGlobalErrorHandler,
} from './common/global-error-handler.mjs';
export { loggingErrorHandler } from './common/logging-error-handler.mjs';
export {
  addHrTimes,
  getTimeOrigin,
  hrTime,
  hrTimeDuration,
  hrTimeToMicroseconds,
  hrTimeToMilliseconds,
  hrTimeToNanoseconds,
  hrTimeToTimeStamp,
  isTimeInput,
  isTimeInputHrTime,
  millisToHrTime,
  timeInputToHrTime,
} from './common/time.mjs';
export { unrefTimer } from './common/timer-util.mjs';

export { ExportResultCode } from './ExportResult.mjs';

export { parseKeyPairsIntoRecord } from './baggage/utils.mjs';
export {
  SDK_INFO,
  _globalThis,
  getStringFromEnv,
  getBooleanFromEnv,
  getNumberFromEnv,
  getStringListFromEnv,
  otperformance,
} from './platform/index.mjs';
export { CompositePropagator } from './propagation/composite.mjs';

export {
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
  W3CTraceContextPropagator,
  parseTraceParent,
} from './trace/W3CTraceContextPropagator.mjs';
export {
  RPCType,
  deleteRPCMetadata,
  getRPCMetadata,
  setRPCMetadata,
} from './trace/rpc-metadata.mjs';

export {
  isTracingSuppressed,
  suppressTracing,
  unsuppressTracing,
} from './trace/suppress-tracing.mjs';
export { TraceState } from './trace/TraceState.mjs';
export { merge } from './utils/merge.mjs';
export { TimeoutError, callWithTimeout } from './utils/timeout.mjs';
export { isUrlIgnored, urlMatches } from './utils/url.mjs';
export { BindOnceFuture } from './utils/callback.mjs';
export { diagLogLevelFromString } from './utils/configuration.mjs';
import { _export } from './internal/exporter.mjs';
export const internal = {
  _export,
};
