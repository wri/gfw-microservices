# db_to_s3_for_athena
# Please update the github repository https://github.com/wri/gfw-microservices/blob/devops_automations/tools/devops_automations/ when making changes to this script.

# Configuration
$base_directory = "D:\DevOps\Automations\Git\gfw-microservices\tools\devops_automations"
$sql_query_root_folder = Join-Path -Path $base_directory -ChildPath "sql"
$log_file_name = Join-Path -Path $base_directory -ChildPath "logs\activity_log_workflow.txt"
$sql_output_root = Join-Path -Path $base_directory -ChildPath "output"
$sql_temp_file = Join-Path -Path $base_directory -ChildPath "output\temp.csv"
$s3_bucket = "s3://gfwpro-analytics/tables"
$sql_server_instance = "localhost"

# Start Logging
Start-Transcript -Path $log_file_name -Append -NoClobber

# Get all SQL queries to run
$sql_queries = Get-ChildItem -Path $sql_query_root_folder -Filter "*.sql"

# Process each query
foreach($query in $sql_queries)
{
    Write-Host "Processing $query"
    
    # Prepare output paths - extract base name once to avoid repetition
    $query_base_name = $query.Name.Replace(".sql","")
    $query_output_folder = Join-Path -Path $sql_output_root -ChildPath $query_base_name
    $output_filename = Join-Path -Path $query_output_folder -ChildPath "$query_base_name.txt"

    # Execute SQL query and export to temporary CSV file
    Write-Host "Running invoke-sql command and creating temp file"
    Invoke-Sqlcmd -ServerInstance $sql_server_instance -InputFile $query.Fullname -QueryTimeout 0 | 
        Export-Csv -NoTypeInformation $sql_temp_file -Encoding UTF8 -Delimiter "`t"

    # Ensure output directory exists
    Write-Host "Creating subfolder if it does not exist"
    New-Item -Path $query_output_folder -Force -ItemType Directory | Out-Null

    # Clean up CSV formatting: remove quotes and normalize line endings
    Write-Host "Stripping quotes out of temp file and creating txt file"
    (Get-Content $sql_temp_file -Raw).Replace('"',"").Replace("`r`n","`n") | 
        Out-File $output_filename -Encoding utf8 -NoNewline

    # Clean up temporary file
    Write-Host "Removing temp file"
    Remove-Item $sql_temp_file -Force
    
    # Add blank line for readability in logs
    Write-Host ""
}

# Upload results to S3
Write-Host "Uploading to S3"
aws s3 sync $sql_output_root $s3_bucket

# Stop Logging
Stop-Transcript