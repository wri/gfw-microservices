# db_to_s3_for_athena
# Please update the github repository https://github.com/wri/gfw-microservices/blob/devops_automations/tools/devops_automations/ when  making changes to this script.

$base_directory = "D:\DevOps\Automations"
$sql_query_root_folder = Join-Path -Path $base_directory -ChildPath "sql"
$log_file_name = Join-Path -Path $base_directory -ChildPath "logs\activity_log_workflow.txt"
$sql_output_root = Join-Path -Path $base_directory -ChildPath "output"
$sql_temp_file = Join-Path -Path $base_directory -ChildPath "output\temp.csv"
$s3_bucket = "s3://gfwpro-analytics/tables"

# Start Logging
Start-Transcript -Path $log_file_name -Append -NoClobber

# Get all sql queries to run
Set-Location $sql_query_root_folder
$sql_queries = Get-ChildItem

# Process each query
foreach ($query in $sql_queries) {
    Write-Host "Processing $($query.Name)"

    $output_folder = Join-Path $sql_output_root ($query.Name.Replace(".sql",""))
    $output_filename = Join-Path $output_folder ($query.Name.Replace(".sql",".txt"))

    # Ensure output folder exists before writing files
    if (-not (Test-Path $output_folder)) {
        Write-Host "Creating output folder: $output_folder"
        New-Item -Path $output_folder -Force -ItemType Directory | Out-Null
    }

    Write-Host "Running Invoke-Sqlcmd"
    try {
        $data = Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.FullName -QueryTimeout 0
    }
    catch {
        Write-Warning "Failed to run query $($query.Name): $_"
        continue
    }

    if ($null -eq $data -or $data.Count -eq 0) {
        Write-Host "No data returned for $($query.Name), skipping export."
        continue
    }

    if ($data[0].PSObject.Properties.Name -contains 'activity_time') {
        Write-Host "Converting activity_time to formatted string"
        $data = $data | ForEach-Object {
            $_.activity_time = $_.activity_time.ToString('yyyy-MM-dd HH:mm:ss')
            $_
        }
    }

    Write-Host "Exporting CSV to temp file"
    $data | Export-Csv -NoTypeInformation -Path $sql_temp_file -Encoding UTF8 -Delimiter "`t"

    Write-Host "Stripping quotes and normalizing line endings in output file"
    (Get-Content $sql_temp_file -Raw).Replace('"',"").Replace("`r`n","`n") | Out-File $output_filename -Encoding utf8 -NoNewline

    Write-Host "Removing temp file"
    Remove-Item $sql_temp_file -Force
}

"Uploading to S3" | Write-Host
aws s3 sync $sql_output_root $s3_bucket

# Stop Logging
Stop-Transcript