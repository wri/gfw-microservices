/**
 * Changes the status of the list and associated analyses, as well as update associated_gfwlist
 * @list_id INT,
 * @status_id INT,
 * @associated_gfwlist TINYINT
 */

export const resetListStatus = `UPDATE Lists SET list_status_id = @status_id, associated_gfwlist = @associated_gfwlist WHERE id = @list_id
UPDATE Analyses SET status_id = @status_id, analysis_success_count = 0, analysis_fail_count = 0 WHERE list_id = @list_id
UPDATE ListsAnalysisStatus SET Status = @status_id WHERE ListID = @list_id`;
