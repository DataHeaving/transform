import * as csv from "csv-stringify";
import * as source from "@data-heaving/source-sql";
import * as common from "@data-heaving/common";

// For some reason 'stringify' method is not exposed by csv-stringify typings, but we can add it here.
declare module "csv-stringify" {
  interface Stringifier {
    stringify(data: ReadonlyArray<unknown>): string;
  }
}

export type CSVTransformOptions = Partial<{
  emitHeader: boolean;
  castDate?: (date: Date) => string;
  eol: string;
}>;

function sql2CSV(
  opts?: CSVTransformOptions,
): common.SimpleDatumTransformerFactory<
  source.DatumProcessorFactoryArg<unknown>,
  source.TSQLRow,
  string
> {
  const stringifier = new csv.Stringifier({
    bom: false,
    cast: {
      date: opts?.castDate || common.dateToISOUTCString,
    },
  });
  const emitHeader = opts?.emitHeader === true;
  const eol = opts?.eol || "\n";
  return (arg) => {
    let headerEmitted = false;
    return (row) => {
      let retVal = "";
      if (row) {
        if (emitHeader && !headerEmitted) {
          const header = getHeader(arg);
          retVal = stringifier.stringify(header) + eol;
          headerEmitted = true;
        }
        retVal += stringifier.stringify(row) + eol;
      }
      return retVal;
    };
  };
}

const getHeader = ({
  tableMD,
  additionalColumns,
}: source.DatumProcessorFactoryArg<unknown>) => {
  const header = tableMD.columnNames.map((columnName) => columnName);
  header.push(...additionalColumns);
  return header;
};

export default sql2CSV;
