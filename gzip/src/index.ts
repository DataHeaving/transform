import * as common from "@data-heaving/common";
import * as zlib from "zlib";

export type GZIPTransformOptions = Partial<zlib.ZlibOptions>;
export type GZIPTransformDatum =
  | Uint8Array
  | WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>
  | ReadonlyArray<number>
  | WithImplicitCoercion<Uint8Array | ReadonlyArray<number> | string>
  | WithImplicitCoercion<string>
  | { [Symbol.toPrimitive](hint: "string"): string }; // The "Parameters<typeof Buffer.from>[0]" doesn't seem to work here very well

function gzipTransform(
  opts?: GZIPTransformOptions,
): common.ComplexDatumTransformerFactory<unknown, GZIPTransformDatum, Buffer> {
  return {
    transformer: "complex",
    factory: () => ({ processor, end }) => {
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
          const buffer =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            datum instanceof Buffer ? datum : Buffer.from(datum as any); // We have to do 'any' because of how Buffer.from is defined in TS libs.
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
    },
  };
}

export default gzipTransform;
