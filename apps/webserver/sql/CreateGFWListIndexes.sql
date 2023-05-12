-- Indexes for Administrative Areas
CREATE NONCLUSTERED INDEX IX_list_administrativeAreas_1
ON [list-administrativeAreas] ([location_id]);

CREATE NONCLUSTERED INDEX IX_list_administrativeAreas_2
ON [list-administrativeAreas] ([Country], [State], [Sub State]);

CREATE NONCLUSTERED INDEX IX_analysis_administrativeAreas_1
ON [analysis-administrativeAreas] ([location_id]);

-- Indexes for Protected Areas
CREATE NONCLUSTERED INDEX IX_list_protectedAreas_1
ON [list-protectedAreas] ([location_id]);

CREATE NONCLUSTERED INDEX IX_list_protectedAreas_2
ON [list-protectedAreas] ([Country], [State], [Sub State],[Designation])

CREATE NONCLUSTERED INDEX IX_analysis_protectedAreas_1
ON [analysis-protectedAreas] ([location_id]);

-- Indexes for Oil Palm Concessions
CREATE NONCLUSTERED INDEX IX_list_oilPalmConcessions_1
ON [list-oilPalmConcessions] ([location_id]);

CREATE NONCLUSTERED INDEX IX_analysis_oilPalmConcessions_1
ON [analysis-oilPalmConcessions] ([location_id]);

-- Indexes for Palm Oil Mills
CREATE NONCLUSTERED INDEX IX_list_palmOilMills_1
ON [list-palmOilMills] ([location_id]);

CREATE NONCLUSTERED INDEX IX_analysis_palmOilMills_1
ON [analysis-palmOilMills] ([location_id]);

-- Indexes for RSPO Oil Palm Concessions
CREATE NONCLUSTERED INDEX IX_list_rspoOilPalmConcessions_1
ON [list-rspoOilPalmConcessions] ([location_id]);

CREATE NONCLUSTERED INDEX IX_analysis_rspoOilPalmConcessions_1
ON [analysis-rspoOilPalmConcessions] ([location_id]);
