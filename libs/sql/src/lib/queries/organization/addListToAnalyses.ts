/**
 * @param list_id INT
 */
export const addListToAnalyses = `
-- Insert list_id into Analyses Table
INSERT INTO Analyses (list_id) VALUES (@list_id)
`;
