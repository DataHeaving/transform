import * as csv from "csv-stringify";
import * as common from "@data-heaving/common";

// For some reason 'stringify' method is not exposed by csv-stringify typings, but we can add it here.
declare module "csv-stringify" {
  interface Stringifier {
    stringify(data: ReadonlyArray<unknown>): string;
  }
}

function sql2Csv<TContext>(
  opts?: Partial<
    Omit<csv.Options, "header" | "columns" | "record_delimiter"> & {
      eol: string;
      headerRow: common.ItemOrFactory<ReadonlyArray<string>, [TContext]>;
    }
  >,
): common.SimpleDatumTransformerFactory<
  TContext,
  ReadonlyArray<unknown> | undefined,
  string
> {
  const stringifier = new csv.Stringifier({
    ...opts,
    bom: opts?.bom ?? false,
    cast: {
      ...(opts?.cast || {}),
      date: opts?.cast?.date || common.dateToISOUTCString,
    },
  });
  const emitHeader = opts?.headerRow;
  const eol = opts?.eol || "\n";
  return {
    transformer: "simple",
    factory: (context) => {
      let headerEmitted = false;
      return (row) => {
        let retVal = "";
        if (row) {
          if (!headerEmitted && emitHeader) {
            retVal =
              stringifier.stringify(
                typeof emitHeader === "function"
                  ? emitHeader(context)
                  : emitHeader,
              ) + eol;
            headerEmitted = true;
          }
          retVal += stringifier.stringify(row) + eol;
        }
        return retVal;
      };
    },
  };
}

export default sql2Csv;
