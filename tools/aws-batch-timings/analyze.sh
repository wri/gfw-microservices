#!/bin/bash

# parse arguments
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -s|--startTime)
      start_time_arg="$2"
      shift # past argument
      shift # past value
      ;;
    -e|--endTime)
      end_time_arg="$2"
      shift # past argument
      shift # past value
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

# default values for start and end time
if [ -z "$start_time_arg" ]; then
  start_time=0
else
  start_time=$(date -d $start_time_arg +%s)
fi
if [ -z "$end_time_arg" ]; then
  end_time=90900900900
else
  end_time=$(date -d $end_time_arg +%s)
fi

# print human readable start and end times
echo "Start time: " $(date -d "@${start_time}")
echo "End time: " $(date -d "@${end_time}")

# Get the timings of the batch jobs and write them to a file
get_timings() {
  local timings_file=$1
  aws batch list-jobs --job-queue gfwpro-scheduler-job-queue-production --job-status SUCCEEDED --query "jobSummaryList[].{desc:join(',', [to_string(createdAt),to_string(startedAt),to_string(stoppedAt)])}"|grep desc|cut '-d"' -f4 > $timings_file
  echo "Created file: " $timings_file
}

process_timings() {
  local timings_file=$1
  local output_file=$2
  while read line; do
    IFS=',' read -r -a timings <<< "$line"
    created_at_sec=${timings[0]::-3}
    started_at_sec=${timings[1]::-3}
    stopped_at_sec=${timings[2]::-3}
    wait_secs=$((started_at_sec - created_at_sec))
    run_secs=$((stopped_at_sec - started_at_sec))
    if [ $created_at_sec -lt $start_time ] || [ $created_at_sec -gt $end_time ]; then
      continue
    fi
    # echo "Job created at: $(date -d "@${created_at_sec}"), " "Wait: $wait_secs seconds, " "Duration: $run_secs seconds"
    echo $created_at_sec $wait_secs $run_secs >> $output_file
  done < $timings_file
}

insert_into_db() {
  local timings_file=$1
  local db_file=$2
  sqlite3 $db_file "CREATE TABLE timings (created_at INTEGER, wait INTEGER, duration INTEGER);"
  while read line; do
    IFS=' ' read -r -a timings <<< "$line"
    created_at=${timings[0]}
    wait=${timings[1]}
    duration=${timings[2]}
    # echo "Inserting into DB: " $created_at $wait $duration
    # Insert into DB
    sqlite3 $db_file "INSERT INTO timings (created_at, wait, duration) VALUES ($created_at, $wait, $duration);"
  done < $timings_file
}

get_stats () {
  local db_file=$1
  local column=$2
  local reg_stats_db=`sqlite3 $db_file "SELECT min($column), avg($column), max($column), count(*) FROM timings;"`
  # echo $reg_stats_db
  IFS='|' read -r -a reg_stats <<< "$reg_stats_db"
  local median=`sqlite3 $db_file "select avg($column) from (select $column, NTILE(100) over (order by $column) as perc from timings) where perc=50;"`
  local pct90=`sqlite3 $db_file "select avg($column) from (select $column, NTILE(100) over (order by $column) as perc from timings) where perc=90;"`
  local pct95=`sqlite3 $db_file "select avg($column) from (select $column, NTILE(100) over (order by $column) as perc from timings) where perc=95;"`
  echo; echo "Stat for: " $column
  echo "Number of jobs: " ${reg_stats[3]}
  echo "Min: " ${reg_stats[0]}
  echo "Median: " $median
  echo "Avg: " ${reg_stats[1]}
  echo "90 percentile: " $pct90
  echo "95 percentile: " $pct95
  echo "Max: " ${reg_stats[2]}
}

temp_dir=`mktemp -d`
raw_aws_timings_file=$temp_dir/aws-timings.txt
durations_text=$temp_dir/durations.txt
durations_db=$temp_dir/durations.db
echo "Temp dir: " $temp_dir
echo "Raw timings file: " $raw_aws_timings_file
echo "Durations text file: " $durations_text
echo "Durations db file: " $durations_db

get_timings $raw_aws_timings_file
process_timings $raw_aws_timings_file $durations_text
insert_into_db $durations_text $durations_db
get_stats $durations_db wait
get_stats $durations_db duration

# Cleanup
# echo; echo To cleanup files; echo rm -rf $temp_dir
rm -rf $temp_dir
