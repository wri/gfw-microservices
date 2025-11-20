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
    $output_folder = Join-Path $sql_output_root $query.Name.Replace(".sql","")
    $output_filename = Join-Path $output_folder ($query.Name.Replace(".sql",".txt"))

    if(-not (Test-Path $output_folder)) {
        New-Item -Path $output_folder -ItemType Directory | Out-Null
    }

    try {
        $data = Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.FullName -QueryTimeout 0
    }
    catch {
        Write-Warning "Failed to run query $($query.Name): $_"
        continue
    }

    if ($null -eq $data) {
        Write-Warning "No data returned for $($query.Name). Skipping export."
        continue
    }

    # Check if activity_description column exists
    $hasActivityDesc = $data | Get-Member -Name "activity_description" -MemberType Properties

    if ($hasActivityDesc) {
        $data | ForEach-Object {
            $_.activity_description = $_.activity_description -replace "`t", " "
            $_
        } | Export-Csv -Path $output_filename -NoTypeInformation -Encoding UTF8 -Delimiter "`t"
    }
    else { 
        # Export as is, no sanitization needed 
        $data | Export-Csv -Path $output_filename -NoTypeInformation -Encoding UTF8 -Delimiter "`t" 
    }
}

"Uploading to S3" | Write-Host
aws s3 sync $sql_output_root $s3_bucket

# Stop Logging
Stop-Transcript