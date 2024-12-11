-- feature [GPV-3911] new table for all clientstores

CREATE TABLE GHGAnalyses (
  [list_id] INT NOT NULL,
  [location_id] INT NOT NULL,
  [total_area_ha] FLOAT,
  [status_code] SMALLINT,
  [location_error] NVARCHAR (MAX),
  [emissions_factor_by_year] NVARCHAR (MAX),
  PRIMARY KEY ([list_id], [location_id]),

  INDEX IDX_GHGAnalyses_ListID NONCLUSTERED ([list_id] ASC)
);