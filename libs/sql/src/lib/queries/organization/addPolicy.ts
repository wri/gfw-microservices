/**
 * @param document_name NVARCHAR(250)
 */
export const addPolicy = `
IF NOT EXISTS (SELECT * FROM Policies WHERE document_name = @document_name)
    INSERT INTO Policies
    VALUES (@document_name)`;
