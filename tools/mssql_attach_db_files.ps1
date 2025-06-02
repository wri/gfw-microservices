#import database Outputs
$msssqlDatabases = Import-Csv C:\Users\Administrator\Desktop\dbMigration\dbMigrationOutput_MSSQL.csv
$gfwproqaDatabases = Import-Csv C:\Users\Administrator\Desktop\dbMigration\dbMigrationOutput_GFWPROQA.csv
$gfwprodevDatabases = Import-Csv C:\Users\Administrator\Desktop\dbMigration\dbMigrationOutput_GFWPRODEV.csv


foreach($database in $gfwprodevDatabases | Select-Object -Property DatabaseName -Unique) {
    
    $logType = ($gfwprodevDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[0]
    $rowType = ($gfwprodevDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[1]


    #------------ FOLLOWUP-----------------------
    # Do we want to move the mdf and ldf files to a new folder location?
    # If so this needst to be done
    #->> HERE

    $mdfPath = $rowType.FilePath.Replace("C:\","D:\").Replace("'","''")
    $ldfPath = $logtype.FilePath.Replace("C:\","D:\").Replace("'","''")
    $dbName  = $rowtype.DatabaseName
    $connectionString = "Server=localhost,65300;Integrated Security=True;"

# Define SQL query to attach the database
$query = @"
CREATE DATABASE [$dbName] ON 
( FILENAME = N'$mdfPath' ),
( FILENAME = N'$ldfPath' )
FOR ATTACH
"@

    # Create SQL connection
    $connection = New-Object System.Data.SqlClient.SqlConnection $connectionString
    $command = $connection.CreateCommand()
    $command.CommandText = $query

    # Open connection and execute
    try {
        $connection.Open()
        $command.ExecuteNonQuery()
        Write-Output "Database '$dbName' attached successfully."
    }
    catch {
        Write-Error "Failed to attach database: $_"
    }
    finally {
        $connection.Close()
    }

}


foreach($database in $gfwproqaDatabases | Select-Object -Property DatabaseName -Unique) {
    
    $logType = ($gfwproqaDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[0]
    $rowType = ($gfwproqaDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[1]


    #------------ FOLLOWUP-----------------------
    # Do we want to move the mdf and ldf files to a new folder location?
    # If so this needst to be done
    #->> HERE

    $mdfPath = $rowType.FilePath.Replace("C:\","D:\").Replace("'","''")
    $ldfPath = $logtype.FilePath.Replace("C:\","D:\").Replace("'","''")
    $dbName  = $rowtype.DatabaseName
    $connectionString = "Server=localhost,65310;Integrated Security=True;"

# Define SQL query to attach the database
$query = @"
CREATE DATABASE [$dbName] ON 
( FILENAME = N'$mdfPath' ),
( FILENAME = N'$ldfPath' )
FOR ATTACH
"@

    # Create SQL connection
    $connection = New-Object System.Data.SqlClient.SqlConnection $connectionString
    $command = $connection.CreateCommand()
    $command.CommandText = $query

    # Open connection and execute
    try {
        $connection.Open()
        $command.ExecuteNonQuery()
        Write-Output "Database '$dbName' attached successfully."
    }
    catch {
        Write-Error "Failed to attach database: $_"
    }
    finally {
        $connection.Close()
    }

}


foreach($database in $msssqlDatabases | Select-Object -Property DatabaseName -Unique) {
    
    $logType = ($msssqlDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[0]
    $rowType = ($msssqlDatabases | Where-Object { $_.Databasename -eq $database.DatabaseName})[1]


    #------------ FOLLOWUP-----------------------
    # Do we want to move the mdf and ldf files to a new folder location?
    # If so this needst to be done
    #->> HERE

    $mdfPath = $rowType.FilePath.Replace("C:\","D:\").Replace("'","''")
    $ldfPath = $logtype.FilePath.Replace("C:\","D:\").Replace("'","''")
    $dbName  = $rowtype.DatabaseName
    $connectionString = "Server=localhost,1433;Integrated Security=True;"

# Define SQL query to attach the database
$query = @"
CREATE DATABASE [$dbName] ON 
( FILENAME = N'$mdfPath' ),
( FILENAME = N'$ldfPath' )
FOR ATTACH
"@

    # Create SQL connection
    $connection = New-Object System.Data.SqlClient.SqlConnection $connectionString
    $command = $connection.CreateCommand()
    $command.CommandText = $query

    # Open connection and execute
    try {
        $connection.Open()
        $command.ExecuteNonQuery()
        Write-Output "Database '$dbName' attached successfully."
    }
    catch {
        Write-Error "Failed to attach database: $_"
    }
    finally {
        $connection.Close()
    }

}
