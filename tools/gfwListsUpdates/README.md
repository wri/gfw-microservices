Process Overview


As of December 2023 the GFW Pro application began relying on the commercial version of the World Database on Protected Areas (WDPA) dataset. This dataset is the source of locations in the Protected Areas GFW List, which is stored in the database in the list-protectedAreasand analysis-protectedAreas tables.

This process is similar to the one describe in the ​
 documentation, with some key modifications that were required as a result of the transition to the commercial dataset.

At a very high level, the steps to taken to update these tables were as follows:

    Receive the latest WDPA data from Kinshuk Govil.

        The data arrives as a zipped file containing a File Geodatabase and PDF documentation.

    Use transform_gdb_to_tsv.py to preprocess the data.

         Enrich the data with Geostore ID data.

        Rename and create the columns required to match the schema established in list-protectedAreas.

        Generate data for Longitude, Latitude, and Geometry.

        Save the data in CSV format. Each CSV contained 10,000 rows.

    Save the CSV’s to S3.

    Share with the Geotrellis team to process.

    Receive processed data as a single CSV file in a S3 bucket. ​Emoji :question_mark::question_mark:

    Use save_to_database.py to save the data to a temp table in the development environment database.

        This re-adds any locations with null or default data that were removed in the Geotrellis process.

            Geotrellis will remove data from specific areas in Greenland, and small islands in oceans.

        It requires a prexisting list table for the data with the required location_ids named list-protectedAreas_import.

        Handles any conversion of name and column datatype.

        Converts invalid datatypes to the appropriate format.

        Saves the data to dbo.analysis-protectedAreas_import.

Setup

    This script should be run on a machine with access to the Staging Database EC2 instancei-0d47062d149ffecd5 ([STAGING] MSSQL Two) in vpc-840c02fd (GFWPRO-PROD).

    Dependencies can be found in requirements.txt:

​Emoji :blue_book::blue_book: Instructions
Steps for extracting the data from the database and preprocessing for Geotrellis ingestion:

The extraction and preprocessing portion of this project will require several hours, when ran locally on a Blue Raster machine it took approximately 2 hours fully execute.

    Receive the new Commercial WDPA data from Kinshuk Govil.

    Execute the transform_gdb_to_tsv.py script below. This script takes the unmodified File Geodatabase containing WDPA data and processes it. The output is several CSV files each containing 10,000 rows, ready for processing by Geotrellis.

The script may need to be modified to point to the correct location of the input File Geodatabase.

The output .csv files were then manually uploaded to a mutually accessible bucket in S3.

At this point, the Geotrellis team… (Have Dan take a look)

Steps for the database upload process are listed in the following section.



Steps for receiving the processed data and reintegrating it to the database:

The data cleaning and database update portion of this project will require several hours. When ran locally on a Blue Raster machine it took approximately 1 hours to fully execute.

Received the processed results from a mutually accessible bucket in S3.

The processed results were downloaded locally.

Created a config.ini file using the following template:

[DEFAULT]
CONN_STRING=mssql://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}?driver={DRIVER}
PROT_FILE_PATH=C:\<path to the protectedAreas output>\protAreas.csv

Execute the save_to_database.py script below. This script connects to the Development database then performs a variety of data cleaning operations before creating or overwriting analysis-protectedAreas_import.

See the notes about this script in step 5 before executing it.
Notes about save_to_databse.py:

The script will create a new table in the database named analysis-protectedAreas_import. It will overwrite it if it already exists.

It requires name_conversion_dict.py to be in the same directory.

Compared the new data to the previous version of the analysis table. After validating the new data, rename analysis-protectedAreas_import to analysis-protectedAreas.



Steps for using Redgate SQL Data Compare to copy new data to other environments:

The process of copying data from one environment to another will take approximately 20 minutes, and does not require downtime for either of the affected environments.

From Microsoft SQL Server Management Studio, right click the gfwpro database in Development and select “Set as Source” from under the “Data Compare/Deploy” menu item.

From Microsoft SQL Server Management Studio, right click the gfwpro database in QA and select “Set as Target” from under the “Data Compare/Deploy” menu item.

Select “Compare/Deploy with SQL Data Compare and allow the program to begin.

The tables new tables were found under the “that could not be compared” header.

Right the table name, then select “Set comparison key…”

Unselect all tables in the menu, then find the required tables.

To the left of the table name, under the “Comparison Key” column, press the “[Not set]” button.

Set “location_id” as the Comparison Key. Leave all other boxes unchecked.

Close the window, repeat for other tables as needed.

Press “OK” and wait for reanalysis.

Select the tables to be updated, ensure data is displaying as expected, then press the “Deploy” button at the top center of the window. The dialog box will allow for a backup to be created prior to altering the data.

After testing, repeat as needed for other environments.