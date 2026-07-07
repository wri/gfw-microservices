# Database Schema For Lists

## User Lists

User lists are stored in `clientstore-xxx` databases. Inside each database, the main tables and their use cases are:

- `Lists`: One row per user list. Contains information such as list name, tables for per-location information, commodity, number of locations, error file link, and related metadata.
- `list-xxx`: One row per location in the user list. Contains latitude, longitude, analysis radius, area, full geometry in WKB, values from GADM (country, state, sub-state, `gadm_id`), and optional attributes.
- `ListsAnalysisStatus`: One row per `list_id` and `analysis_id`. Records which analyses have been requested for each list and the status of each.
- `Analyses`: Used by FCD (also called Post-2000) analysis. Stores list-level metrics returned by FCD analysis for the aggregate dissolved union of all locations.
- `analysis-xxx`: Used by FCD (also called Post-2000) analysis. Stores per-location metrics returned by FCD analysis.
- `Analyses-Dashboard`: Used by Alerts analysis. Stores both list-level aggregate results and per-location results.
- `AFIAnalysis`: Used by AFI (also called DefReport, Post-2020, and EUDR) analysis. Stores both list-level aggregate and per-location results.
- `GHGAnalyses`: Used by GHG (Green House Gas) analysis. Stores both list-level aggregate and per-location results.
- `ListsProcessing`: Tracks account usage, including number of locations and area, per analysis.
- `ListsUploadStatus`: Used by the new upload flow (`version=2`) to track progress and record errors across chains.
- `LargeLists`: Records the S3 filename for lists uploaded using LLP-insert.
- `ExternalUploads`: Records the `uploadId` used by EAPI.
- `Folders`: Stores folder names and the users who created them.
- `FolderItems`: Stores the `folder_id` and `list_id` inside each folder.
- `ListAttributes`: Tracks columns and the type of value from user-uploaded files.

### Result Granularity (for Analyses-Dashboard, AFIAnalysis, and GHGAnalyses tables)

- List-level information is recorded as `location_id = -1`. These results are further broken down per GADM2 region.
- Location-level information is recorded with `location_id > 0`.

## GFW Lists

GFW lists are special because they are visible to all organizations and have a single shared set of results. These are stored in the `gfwpro` database.

- `GFWLists`: Equivalent of `Lists`.
- `list-xxx`: Equivalent of user list `list-xxx` tables for each of the five GFW lists:
  - AdministrativeAreas (`1`)
  - OilPalmConcessions (`2`)
  - PalmOilMills (`3`)
  - ProtectedAreas (`4`)
  - RSPOOilPalmConcessions (`5`)
- `GFWAnalyses`: Equivalent of `Analyses`.
- `analysis-xxx`: Equivalent of user list `analysis-xxx` tables for each of the five GFW lists:
  - AdministrativeAreas (`1`)
  - OilPalmConcessions (`2`)
  - PalmOilMills (`3`)
  - ProtectedAreas (`4`)
  - RSPOOilPalmConcessions (`5`)
- `Analyses-Dashboard`: Equivalent of user list `Analyses-Dashboard`, but only for these lists:
  - OilPalmConcessions (`2`)
  - PalmOilMills (`3`)
  - RSPOOilPalmConcessions (`5`)
    - AdministrativeAreas and ProtectedAreas are not included in `Analyses-Dashboard` because they are too large.
