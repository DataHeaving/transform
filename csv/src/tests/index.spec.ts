import test from "ava";
import spec from "..";

test("Test that transformer transforms CSV as expected without extra options", (t) => {
  const row = [1, 2, 3];
  t.deepEqual(spec().factory("Context")(row), `${row.join(",")}\n`);
});

test("Test that transformer transforms CSV as expected with static header", (t) => {
  const staticHeader = ["One", "Two", "Three"];
  const transformer = spec({
    headerRow: staticHeader,
  }).factory("Context");
  const row = [1, 2, 3];
  t.deepEqual(
    transformer(row),
    `${staticHeader.join(",")}\n${row.join(",")}\n`,
  );
});

test("Test that transformer transforms CSV as expected with dynamic header", (t) => {
  const staticHeader = ["One", "Two", "Three"];
  const context = "Context";
  let dynamicHeaderCalled = false;
  const transformer = spec({
    headerRow: (seenContext) => {
      dynamicHeaderCalled = true;
      t.deepEqual(seenContext, context);
      return staticHeader;
    },
  }).factory(context);
  const row = [1, 2, 3];
  t.deepEqual(
    transformer(row),
    `${staticHeader.join(",")}\n${row.join(",")}\n`,
  );
  t.true(dynamicHeaderCalled);
});

test("Test that transformer transforms multiple CSV as expected with header", (t) => {
  const staticHeader = ["One", "Two", "Three"];
  const transformer = spec({
    headerRow: staticHeader,
  }).factory("Context");
  const row = [1, 2, 3];
  t.deepEqual(
    transformer(row),
    `${staticHeader.join(",")}\n${row.join(",")}\n`,
  );
  const row2 = ["This", "time", 4];
  t.deepEqual(transformer(row2), `${row2.join(",")}\n`);
});

test("Test that transformer transforms undefined as empty string", (t) => {
  t.deepEqual(spec().factory("Context")(undefined), "");
});
