/**
 * Changes the status of the list and associated analyses
 * @list_id INT,
 * @status_id INT,
 */

export const setListStatus = `UPDATE Lists SET list_status_id = @status_id WHERE id = @list_id
UPDATE Analyses SET status_id = @status_id, analysis_success_count = 0, analysis_fail_count = 0 WHERE list_id = @list_id
UPDATE ListsAnalysisStatus SET Status = @status_id WHERE ListID = @list_id`;
