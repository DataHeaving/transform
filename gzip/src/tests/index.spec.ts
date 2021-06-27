import test from "ava";
import spec from "..";
import * as common from "@data-heaving/common";
import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

test("Test that transformer gzips as expected in simple usecase", async (t) => {
  const { zippedBuffers, getInvokableTransformer } = createGZipTransformer();

  const inputBuffer = Buffer.from("This is data to be gzipped.");
  getInvokableTransformer().transformer(
    inputBuffer,
    controlFlowOperationsNotSupported,
  );
  getInvokableTransformer().end();
  t.deepEqual(await gzipAsync(inputBuffer), Buffer.concat(zippedBuffers));
});

test("Test that transformer gzips as expected in comlex usecase with control flow manipulation", async (t) => {
  const { zippedBuffers, getInvokableTransformer } = createGZipTransformer();

  const data1 = new Array<number>(50000);
  data1.fill(1); // Fill array with 1's
  const inputBuffer1 = Buffer.from(data1);
  let pauseCalled = false;
  let resumeCalled = false;
  getInvokableTransformer().transformer(inputBuffer1, {
    pause: () => {
      pauseCalled = true;
    },
    resume: () => {
      resumeCalled = true;
    },
  });
  t.true(pauseCalled); // Ensure that pause has been called (the input buffer was too large to be handled right away)
  while (!resumeCalled) {
    await common.sleep(100);
  }

  const inputBuffer2 = Buffer.from("This is additional data");
  getInvokableTransformer().transformer(
    inputBuffer2,
    controlFlowOperationsNotSupported,
  );
  getInvokableTransformer().end();
  t.deepEqual(
    await gzipAsync(Buffer.concat([inputBuffer1, inputBuffer2])),
    Buffer.concat(zippedBuffers),
  );
});

test("Test that transformer gzips as expected also when end is called while paused", async (t) => {
  const { zippedBuffers, getInvokableTransformer } = createGZipTransformer();

  const data1 = new Array<number>(50000);
  data1.fill(1); // Fill array with 1's
  const inputBuffer1 = Buffer.from(data1);
  let pauseCalled = false;
  let resumeCalled = false;
  getInvokableTransformer().transformer(inputBuffer1, {
    pause: () => {
      pauseCalled = true;
    },
    resume: () => {
      resumeCalled = true;
    },
  });
  t.true(pauseCalled); // Ensure that pause has been called (the input buffer was too large to be handled right away)
  getInvokableTransformer().end();
  while (!resumeCalled) {
    await common.sleep(100);
  }
  t.deepEqual(await gzipAsync(inputBuffer1), Buffer.concat(zippedBuffers));
});

test("Test that transformer gzips also non-buffer values", async (t) => {
  const { zippedBuffers, getInvokableTransformer } = createGZipTransformer();

  const inputs = ["This is data to be gzipped.", [1, 2, 3] as const];
  inputs.forEach((input) =>
    getInvokableTransformer().transformer(
      input,
      controlFlowOperationsNotSupported,
    ),
  );
  getInvokableTransformer().end();
  t.deepEqual(
    await gzipAsync(Buffer.concat(inputs.map((i) => Buffer.from(i)))),
    Buffer.concat(zippedBuffers),
  );
});

// TODO this is copypasted from orchestration. Instead, we want to add orchestration as _dev_ dependency and use this method there
function arrayDataSink<TContext, TDatum>(
  array: Array<TDatum>,
  end?: () => void,
  getEndPromise?: () => Promise<unknown>,
): () => common.DatumStoringFactory<TContext, TDatum, Array<TDatum>> {
  return () => {
    return () => ({
      storing: {
        processor: (datum) => {
          array.push(datum);
        },
        end: end ?? (() => {}),
      },
      promise: getEndPromise
        ? (async () => {
            await getEndPromise();
            return array;
          })()
        : undefined,
    });
  };
}

const createGZipTransformer = () => {
  const zippedBuffers: Array<Buffer> = [];
  const arraySinkFactory = arrayDataSink(zippedBuffers)();
  const recrecreatableTransformer = spec().factory();
  let invokableTransformer:
    | ReturnType<typeof recrecreatableTransformer>
    | undefined = undefined;
  const getInvokableTransformer = () => {
    if (!invokableTransformer) {
      invokableTransformer = recrecreatableTransformer(
        arraySinkFactory(null, () => {
          throw new Error("This should not be called by array data sink");
        }).storing,
        null,
        () => {
          throw new Error("This should not be called by gzip transform");
        },
      );
    }
    return invokableTransformer;
  };

  return {
    zippedBuffers,
    getInvokableTransformer,
  };
};

const controlFlowOperationsNotSupported: common.ControlFlow = {
  pause: () => {
    throw new Error("This should not be called");
  },
  resume: () => {
    throw new Error("This should not be called");
  },
};
