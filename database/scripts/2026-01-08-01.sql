-- GPV-5225: DB Create ChargeRate table

/*
ChargeRate table stores token pricing by analysis_type with effective start dates.
- analysis_type: category of analysis (e.g., AFI, GHG).
- effective_date: start date when the pricing becomes effective.
- location_rate: tokens charged per analyzed location.
- list_rate: flat tokens charged per list update.
Supports evolving prices over time without changing past data.
*/

USE [gfwpro];
GO

CREATE TABLE [dbo].[ChargeRate] (
    id INT IDENTITY(1,1) NOT NULL,
    analysis_type NVARCHAR(50) NOT NULL,
    effective_date DATETIME NOT NULL,
    list_rate DECIMAL(10, 4) NOT NULL,
    location_rate DECIMAL(10, 4) NOT NULL,
    CONSTRAINT PK_ChargeRate PRIMARY KEY (id),
    CONSTRAINT UO_ChargeRate_AnalysisType_StartDate UNIQUE (analysis_type, effective_date)
);

/*
Table uses only effective_date (no end_date) because:
- Each rate is effective from effective_date until the next rate’s effective_date (implicit end).
- Avoids overlapping intervals and redundant data.
- Simplifies inserts and maintenance—no need to update previous rows.
- Allows easy querying by selecting the latest effective_date <= target date.
*/
