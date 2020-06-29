"use strict";

const opentelemetry = require('@opentelemetry/api');

class TraceBridge {
  constructor() {
    this.spans_ = {};
    this.tracer_ = opentelemetry.trace.getTracer("mirakc")
  }

  process(trace, trans) {
    if (!trace.sc) {
      return;
    }

    if (!(trace.sc.id in this.spans_)) {
      let opts = {
        attributes: trace.sc.kv,
        startTime: trace.ts,
      };
      if (trace.sc.pi in this.spans_) {
        opts.parent = this.spans_[trace.sc.pi];
      }
      this.spans_[trace.sc.id] = this.tracer_.startSpan(trace.sc.nm, opts);
    }

    const span = this.spans_[trace.sc.id];
    switch (trace.nm) {
    case 'start':
      break;
    case 'end':
      span.end(trace.ts);
      delete this.spans_[trace.sc.id];
      break;
    default:
      if (trans) {
        trace = trans(trace);
      }
      span.addEvent(trace.nm, trace.kv, trace.ts)
      break;
    }
  }
}

module.exports = { TraceBridge };
