# db_to_s3_for_athena
# Please update the github repository https://github.com/wri/gfw-microservices/blob/devops_automations/tools/devops_automations/ when  making changes to this script.

$base_directory = "D:\DevOps\Automations\Git\gfw-microservices\tools\devops_automations"
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
foreach($query in $sql_queries)
{
    Write-Host "Processing $query"
    $output_filename = Join-Path $sql_output_root ($query.Name.Replace(".sql",""))
    if (-not (Test-Path $output_filename)) {
        New-Item -Path $output_filename -ItemType Directory | Out-Null
    }
    $output_file = Join-Path $output_filename ($query.Name.Replace(".sql",".txt"))

    Write-Host "Running invoke-sql command and creating temp file"
    $data = Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.FullName -QueryTimeout 0

    if ($null -eq $data) {
        Write-Warning "No data returned for $($query.Name), skipping export."
        continue
    }
    $data = @(Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.FullName -QueryTimeout 0)

    # If activity_description exists, sanitize tabs in it
    if ($data.Count -gt 0 -and $data[0].PSObject.Properties.Name -contains 'activity_description') {
        Write-Host "Applying tab sanitization on activity_description column"

        $data | ForEach-Object {
            if ($_.activity_description) {
                # Replace all whitespace characters (tabs, spaces, newlines, carriage returns, non-breaking spaces, etc.) with a single space
                $_.activity_description = ($_.activity_description -replace "\s+", " ")
            }
            $_
        } | Export-Csv -NoTypeInformation -Path $sql_temp_file -Encoding UTF8 -Delimiter "`t"
    }
    else {
        $data | Export-Csv -NoTypeInformation -Path $sql_temp_file -Encoding UTF8 -Delimiter "`t"
    }   

    Write-Host "Creating subfolder if it does not exist"
    if (-not (Test-Path $output_filename)) {
        New-Item -Path $output_filename -Force -ItemType Directory | Out-Null
    }

    Write-Host "Stripping quotes out of temp file and creating txt file"
    (Get-Content $sql_temp_file -Raw).Replace('"',"").Replace("`r`n","`n") | Out-File $output_file -Encoding utf8 -NoNewline

    Write-Host "Removing temp file"
    Remove-Item $sql_temp_file -Force
}

"Uploading to S3" | Write-Host
aws s3 sync $sql_output_root $s3_bucket

# Stop Logging
Stop-Transcript