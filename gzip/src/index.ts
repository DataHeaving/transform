import * as common from "@data-heaving/common";
import * as zlib from "zlib";

export type GZIPTransformOptions = Partial<zlib.ZlibOptions>;

function gzipTransform(
  opts?: GZIPTransformOptions,
): common.ComplexDatumTransformerFactory<unknown, Buffer | string, Buffer> {
  return () => ({ processor, end }) => {
    const gzip = zlib.createGzip(opts);
    let shouldEnd = false;
    let isPaused = false;
    let seenControlFlow: common.ControlFlow | undefined = undefined;
    gzip.on("drain", () => {
      seenControlFlow?.resume();
      isPaused = false;
      if (shouldEnd) {
        gzip.end();
      }
    });
    gzip.on("end", () => {
      end();
    });
    gzip.on("data", (data: Buffer) => {
      processor(data, seenControlFlow);
    });
    return {
      transformer: (datum, controlFlow) => {
        seenControlFlow = controlFlow;
        const buffer = datum instanceof Buffer ? datum : Buffer.from(datum);
        if (!gzip.write(buffer)) {
          controlFlow?.pause();
          isPaused = true;
        }
      },
      end: () => {
        if (isPaused) {
          shouldEnd = true;
        } else {
          gzip.end();
        }
      },
    };
  };
}

export default gzipTransform;
