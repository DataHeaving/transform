# Data Heaving - Data Transformation to CSV rows
This folder contains source code for `@data-heaving/transform-csv` NPM package.
The exported entities include:
- A method to be used as simple transformation from `ReadonlyArray<unknown>|undefined` to CSV row `string`s in [Data Heaving Orchestration API](https://github.com/DataHeaving/orchestration/pipelines).

Notice that this transformations does not require whole dataset to be loaded into memory, instead operating on stream of single datums.

# Usage
Include `@data-heaving/transform-csv` dependency in your `package.json` file.

# More information
To learn more what Data Heaving project is all about, see here.
