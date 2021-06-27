# Data Heaving - Data Transformations
[![Code Coverage](https://codecov.io/gh/DataHeaving/transform/branch/develop/graph/badge.svg)](https://codecov.io/gh/DataHeaving/transform)

This repository is part of [Data Heaving project](https://github.com/DataHeaving).
There are multiple packages in the repository, all of which are related to transforming data [Data Heaving Orchestration API](https://github.com/DataHeaving/orchestration/pipelines):
- [CSV package](csv) for transforming arrays into CSV rows (`string`s), and
- [GZIP package](gzip) for transforming `string`s or `Buffer`s into GZIPped `Buffer`s.

The common aspect for these transformations is that they do not require whole dataset to be loaded into memory, instead operating on a stream of data.

# Usage
All packages of Data Heaving project are published as NPM packages to public NPM repository under `@data-heaving` organization.

# More information
To learn more what Data Heaving project is all about, [see here](https://github.com/DataHeaving/orchestration).