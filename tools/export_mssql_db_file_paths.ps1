#------------------------------------------------------
###################MSSQL###############################

#Empty Output Object Array
$output = @()

# Define connection string
$connectionString = "Server=localhost;Integrated Security=True;"

# Define SQL query
$query = @"
SELECT 
    d.name AS DatabaseName,
    mf.name AS LogicalFileName,
    mf.type_desc AS FileType,
    mf.physical_name AS FilePath
FROM 
    sys.databases d
JOIN 
    sys.master_files mf ON d.database_id = mf.database_id
ORDER BY 
    d.name, mf.type_desc
"@

# Create and open the SQL connection
$connection = New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString = $connectionString
$connection.Open()

# Create SQL command
$command = $connection.CreateCommand()
$command.CommandText = $query

# Execute command
$reader = $command.ExecuteReader()


# Output results
while ($reader.Read()) {
    if(($reader["DatabaseName"] -ne "master") -and ($reader["DatabaseName"] -ne "model") -and ($reader["DatabaseName"] -ne "msdb") -and  ($reader["DatabaseName"] -ne "tempdb"))
    {
        $database = New-Object -TypeName PSObject -Property @{
            DatabaseName = [string]$reader["DatabaseName"]
            LogicalFileName = [string]$reader["LogicalFileName"]
            FileType = [string]$reader["FileType"]
            FilePath = [string]$reader["FilePath"]
        }
        $output += $database
    }
}

# Clean up
$reader.Close()
$connection.Close()

$output | Export-Csv C:\Users\Administrator\Desktop\dbMigrationOutput_MSSQL.csv -Encoding UTF8 -NoTypeInformation


#----------------------------------------------------------
###################GFWPRODEV###############################

#Empty Output Object Array
$output = @()

# Define connection string
$connectionString = "Server=localhost,65300;Integrated Security=True;"

# Define SQL query
$query = @"
SELECT 
    d.name AS DatabaseName,
    mf.name AS LogicalFileName,
    mf.type_desc AS FileType,
    mf.physical_name AS FilePath
FROM 
    sys.databases d
JOIN 
    sys.master_files mf ON d.database_id = mf.database_id
ORDER BY 
    d.name, mf.type_desc
"@

# Create and open the SQL connection
$connection = New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString = $connectionString
$connection.Open()

# Create SQL command
$command = $connection.CreateCommand()
$command.CommandText = $query

# Execute command
$reader = $command.ExecuteReader()


# Output results
while ($reader.Read()) {
    if(($reader["DatabaseName"] -ne "master") -and ($reader["DatabaseName"] -ne "model") -and ($reader["DatabaseName"] -ne "msdb") -and  ($reader["DatabaseName"] -ne "tempdb"))
    {
        $database = New-Object -TypeName PSObject -Property @{
            DatabaseName = [string]$reader["DatabaseName"]
            LogicalFileName = [string]$reader["LogicalFileName"]
            FileType = [string]$reader["FileType"]
            FilePath = [string]$reader["FilePath"]
        }
        $output += $database
    }
}

# Clean up
$reader.Close()
$connection.Close()

$output | Export-Csv C:\Users\Administrator\Desktop\dbMigrationOutput_GFWPRODEV.csv -Encoding UTF8 -NoTypeInformation


#----------------------------------------------------------
###################GFWPROQA###############################

#Empty Output Object Array
$output = @()

# Define connection string
$connectionString = "Server=localhost,65310;Integrated Security=True;"

# Define SQL query
$query = @"
SELECT 
    d.name AS DatabaseName,
    mf.name AS LogicalFileName,
    mf.type_desc AS FileType,
    mf.physical_name AS FilePath
FROM 
    sys.databases d
JOIN 
    sys.master_files mf ON d.database_id = mf.database_id
ORDER BY 
    d.name, mf.type_desc
"@

# Create and open the SQL connection
$connection = New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString = $connectionString
$connection.Open()

# Create SQL command
$command = $connection.CreateCommand()
$command.CommandText = $query

# Execute command
$reader = $command.ExecuteReader()


# Output results
while ($reader.Read()) {
    if(($reader["DatabaseName"] -ne "master") -and ($reader["DatabaseName"] -ne "model") -and ($reader["DatabaseName"] -ne "msdb") -and  ($reader["DatabaseName"] -ne "tempdb"))
    {
        $database = New-Object -TypeName PSObject -Property @{
            DatabaseName = [string]$reader["DatabaseName"]
            LogicalFileName = [string]$reader["LogicalFileName"]
            FileType = [string]$reader["FileType"]
            FilePath = [string]$reader["FilePath"]
        }
        $output += $database
    }
}

# Clean up
$reader.Close()
$connection.Close()

$output | Export-Csv C:\Users\Administrator\Desktop\dbMigrationOutput_GFWPROQA.csv -Encoding UTF8 -NoTypeInformation
