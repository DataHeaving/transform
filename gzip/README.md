# Data Heaving - Data Transformation to GZIP
[![Code Coverage](https://codecov.io/gh/DataHeaving/transform/branch/develop/graph/badge.svg?flag=gzip)](https://codecov.io/gh/DataHeaving/transform)

This folder contains source code for `@data-heaving/transform-gzip` NPM package.
The exported entities include:
- A method to be used as complex transformation from `Buffer|string` to GZIPped data `Buffer`s in [Data Heaving Orchestration API](https://github.com/DataHeaving/orchestration/pipelines).

Notice that this transformations does not require whole dataset to be loaded into memory, instead operating on stream of single datums.

# Usage
Include `@data-heaving/transform-gzip` dependency in your `package.json` file.

# More information
To learn more what Data Heaving project is all about, [see here](https://github.com/DataHeaving/orchestration).
