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
    $output_filename = $sql_output_root +"\" + $query.Name.Replace(".sql","") + "\"+ $query.Name.Replace(".sql",".txt")

    "Running invoke-sql command and creating temp file" | Write-Host
    Invoke-Sqlcmd -ServerInstance localhost -InputFile $query.Fullname -QueryTimeout 0 | Export-Csv -NoTypeInformation $sql_temp_file -Encoding UTF8 -Delimiter "`t"

    "Creating subfolder if it does not exsist" | Write-Host
    if(test-path($sql_output_root +"\" + $query.Name.Replace(".sql","")))
    {
        #Exists. Do nothing
    }
    else
    {
        New-Item -Path ($sql_output_root +"\" + $query.Name.Replace(".sql","")) -Force -ItemType Directory
    }

    "Striping quotes out of temp file and creating txt file" | Write-Host
    (Get-Content $sql_temp_file -Raw).Replace('"',"").Replace("`r`n","`n") | Out-File $output_filename -Encoding utf8 -NoNewline

    "Removing Temp file" | Write-Host
    Remove-Item $sql_temp_file -Force
}

"Uploading to S3" | Write-Host
aws s3 sync $sql_output_root $s3_bucket

#Stop Logging
Stop-Transcript