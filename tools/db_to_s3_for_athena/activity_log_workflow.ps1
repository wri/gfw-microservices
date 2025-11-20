#db_to_s3_for_athena
# Please update the github repository https://github.com/wri/gfw-microservices/blob/devops_automations/tools/devops_automations/ when  making changes to this script.

$base_directory = "D:\DevOps\Automations\Git\gfw-microservices\tools\devops_automations"
$sql_query_root_folder = Join-Path -Path $base_directory -ChildPath "sql"
$log_file_name = Join-Path -Path $base_directory -ChildPath "logs\activity_log_workflow.txt"
$sql_output_root = Join-Path -Path $base_directory -ChildPath "output"
$sql_temp_file = Join-Path -Path $base_directory -ChildPath "output\temp.csv"
$s3_bucket = "s3://gfwpro-analytics/tables"

#Start Logging
Start-Transcript -Path $log_file_name -Append -NoClobber

#Get all sql queries to run
Set-Location $sql_query_root_folder
$sql_queries = Get-ChildItem

#Process each query
foreach($query in $sql_queries)
{
    "Processing $query" | Write-Host
    $output_folder = Join-Path $sql_output_root $query.Name.Replace(".sql","")
    $output_filename = Join-Path $output_folder ($query.Name.Replace(".sql",".txt"))

    if(-not (Test-Path $output_folder)) {
        New-Item -Path $output_folder -ItemType Directory | Out-Null
    }

    "Running SQL query and exporting to TSV with quotes" | Write-Host
    Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.Fullname -QueryTimeout 0 |
        Export-Csv -Path $output_filename -NoTypeInformation -Encoding UTF8 -Delimiter "`t" -QuoteFields Always
}


"Uploading to S3" | Write-Host
aws s3 sync $sql_output_root $s3_bucket

#Stop Logging
Stop-Transcript