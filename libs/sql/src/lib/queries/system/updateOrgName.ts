/**
 * Update the name of an organization
 * @OrganizationId INT
 * @OrganizationName NVARCHAR(200)
 * Returns the updated organization record
 */
export const updateOrgName = `
DECLARE @ClientDB NVARCHAR(200);

-- Get the client database name
SELECT @ClientDB = organization_db
FROM dbo.Organizations
WHERE id = @OrganizationId;

IF @ClientDB IS NULL
BEGIN
    THROW 50001, 'Organization not found or missing client DB.', 1;
END

-- Update the central Organizations table
UPDATE dbo.Organizations
SET organization_name = @OrganizationName
WHERE id = @OrganizationId;

-- Update the AccountProfile in client DB (single row, no WHERE needed)
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'UPDATE [' + @ClientDB + '].[dbo].[AccountProfile] ' +
           N'SET organization_name = @OrgName;';

EXEC sp_executesql
    @SQL,
    N'@OrgName NVARCHAR(200)',
    @OrgName = @OrganizationName;

-- Return updated organization info
SELECT id AS organization_id, organization_name
FROM dbo.Organizations
WHERE id = @OrganizationId;
`;
