#### Cmd for analyzing the output
#### egrep '(Date|analysis|EMR|Duration|Failed|Area|Feature)' rep-prod.txt |sed 's/^Date/:TK\nDate/g'|cut -d: -f2-|head -20|tr '\n' ','

$stopwatch =  [system.diagnostics.stopwatch]::StartNew()
######Configuration######

#Select Enviornment
#$environment = "production"
$environment = "staging"
#$environment = "qa"
#$environment = "latest"
#$environment = "develop"

#Date Range
$numDays = 7
$numMonths = 0


#Region
$region = "us-east-1"

#Profile
$profile = "gfwpro"

#########################

#construct utc date ranges
$nowDate = get-date
$startDate = $nowDate.AddMonths(-$numMonths).AddDays(-$numDays).GetDateTimeFormats()[101]
$stopDate = $nowDate.GetDateTimeFormats()[101]

#construct State machine ARN
$stateMachineARN = "arn:aws:states:us-east-1:617001639586:stateMachine:gfwpro-scheduler--$environment"

#Get list of all step functions in date range
$executionList = aws stepfunctions list-executions `
    --query "executions[?startDate>'$startDate'&&startDate<'$stopDate']" `
    --state-machine-arn $stateMachineARN `
    --profile $profile `
    --region $region `
    | ConvertFrom-Json

#Create empty report
$report = @()

foreach($execution in $executionList )
{

    #get input json for execution
    $inputJSON = (
        aws stepfunctions describe-execution `
        --execution-arn $execution.executionArn `
        --profile $profile `
        --region $region `
        | ConvertFrom-Json).input `
        | ConvertFrom-Json 

    #GetEventDetails
    $eventDetails = (
        aws stepfunctions get-execution-history `
        --execution-arn $execution.executionArn `
        --profile $profile `
        --region $region `
        | ConvertFrom-Json).events.stateEnteredEventDetails.name
    if($eventDetails -contains "EMR")
    {
        $platform = "EMR"
    }
    else
    {
        $platform = "Batch Job"
    }

    #Build execution Item for report
    $executionItem = New-Object -TypeName psobject
    
    $executionItem | Add-Member -MemberType NoteProperty -Name Date -Value (get-date $execution.startDate).GetDateTimeFormats()[6]     
    $executionItem | Add-Member -MemberType NoteProperty -Name "Function ID" -Value $execution.name
    $executionItem | Add-Member -MemberType NoteProperty -Name "Dashboard vs Diagnostic analysis" -Value $inputJSON.Analysis
    $executionItem | Add-Member -MemberType NoteProperty -Name "Batch or EMR" -Value $platform
    $executionItem | Add-Member -MemberType NoteProperty -Name "Start Time" -Value $execution.startDate
    $executionItem | Add-Member -MemberType NoteProperty -Name "End Time" -Value $execution.stopDate
    $executionItem | Add-Member -MemberType NoteProperty -Name "Duration (Minutes)" -Value  ([datetime]$execution.stopDate - [datetime]$execution.startDate).TotalMinutes     
    $executionItem | Add-Member -MemberType NoteProperty -Name "Failed or Succeeded" -Value $execution.status
    $executionItem | Add-Member -MemberType NoteProperty -Name "Area Dissolved Dif" -Value $inputJSON.Area.'Dissolved Difference'
    $executionItem | Add-Member -MemberType NoteProperty -Name "Area Dif" -Value $inputJSON.Area.difference
    $executionItem | Add-Member -MemberType NoteProperty -Name "Area List" -Value $inputJSON.Area.list
    $executionItem | Add-Member -MemberType NoteProperty -Name "Area Location" -Value $inputJSON.Area.location

    if($inputJSON.Analysis -eq "GFW Pro Dashboard Batch")
    {
        $enumeratedList = ""
        foreach($id in $inputJSON.ListId)
        {
            $enumeratedList += $id
            $enumeratedList += ","
        }
        $enumeratedList = $enumeratedList.Substring(0,$enumeratedList.Length-1)
        $executionItem | Add-Member -MemberType NoteProperty -Name "List ID" -Value $enumeratedList
        $executionItem | Add-Member -MemberType NoteProperty -Name "List ID Count" -Value $inputJSON.ListId.count
    }
    else
    {
        $executionItem | Add-Member -MemberType NoteProperty -Name "List ID" -Value $inputJSON.ListId
        $executionItem | Add-Member -MemberType NoteProperty -Name "List ID Count" -Value $inputJSON.ListId.count
    }

    $executionItem | Add-Member -MemberType NoteProperty -Name "List Feature Count" -Value $inputJSON.ListFeatureCount
    $executionItem | Add-Member -MemberType NoteProperty -Name "ORG ID" -Value $inputJSON.OrganizationId

    #Add Item to report
    $report += $executionItem
}
$stopwatch
$stopwatch.stop()

$report | Out-File c:\temp\rep.txt
