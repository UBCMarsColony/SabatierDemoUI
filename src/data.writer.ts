
/**
 * TODO: - alter the script to check if the .csv will exceed MAX_CSV_LEN
 *         and create a new .csv file to fill up with the format:
 *         "reactordata-X.csv" where x is the file number
 *       - make csv append and clear all written data from reactor_data
 *
 *       
 */

import reactor_data from "./reactor.data";
import { Datapoint, Dataseries, Dataset } from "./models/data.model";

type Datapacket = {
  setname: string,
  seriesname: string,
  value: number,
  units: string,
  time: number,
  checksum: number,
}
const DEFAULT_PATH = 'data.csv';
var data_to_write: Array<Datapacket> = [];
var csvdata: Array<any> = [];
var backupdata: Array<Datapacket> = [];
var filecount = 1;

export function writeCSV() {
  const MAX_CSV_LEN = 100;
  const MAX_DATASERIES_LEN = 10;

  //prompting the user for file name and path name; current implementation does not work
  //var pathname = window.alert("Enter a file path: ");
  //var filename = window.alert("Enter a file name: "); 
  do {
    var endloop = false;
    var filepath = 'data' + filecount + '.csv';

    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
      path: filepath,
      header: [
        { id: 'setname', title: 'Set Name' }, //take from dataset
        { id: 'seriesname', title: 'Series Name' },  //take from dataseries
        { id: 'value', title: 'Value' }, //take from datapoint
        { id: 'units', title: 'Units' }, //take from dataset
        { id: 'time', title: 'Time' }, //take from datapoint
        { id: 'checksum', title: 'Checksum' }  //checksum = value + time
      ]
    });

    var datasets = reactor_data.datasets //.map((dataset: Dataset) => dataset); //creating a dataset array from reactor_data

    //iterating through each dataset
    for (var i = 0; i < datasets.length; i++) {
      var datasetname = datasets[i].name; //determining the dataset name for the ith dataset
      var dataunits = datasets[i].units; //determining the data unit for the ith dataset

      var series_in_set = datasets[i].series; //creating a dataseries array from the datasets

      //iterating through each dataseries
      for (var j = 0; j < series_in_set.length; j++) {
        var dataseriesname = series_in_set[j].name; //determing the dataseries name for the jth dataseries
        var data_in_series = series_in_set[j].data //creating an array of Datapoints from the series property in jth dataseries

          //determing if the series exceeds the allotted dataseries length
          //if (data_in_series.length >= MAX_DATASERIES_LEN) {

          //iterating through the data (that meets requirements) in the jth series
          for (var k = 0; k < data_in_series.length; k++) {

            var dpoint = data_in_series.shift();

            if (dpoint !== undefined) {

              var dchecksum = dpoint.value + dpoint.time;

              //creating a data packet to append to data_to_write
              var x: Datapacket =
              {
                setname: datasetname,
                seriesname: dataseriesname,
                value: dpoint.value,
                units: dataunits,
                time: dpoint.time,
                checksum: dchecksum,
              }
              if (data_to_write.length < MAX_CSV_LEN) {
                data_to_write.push(x);
              }
              else {
                endloop = true;
                break;
              }
            }

          }
          if (endloop) break;
        //}
      }
      if (endloop) break;
    }

    if (data_to_write.length > 0) {
      csvWriter.writeRecords(data_to_write).then(() => console.log('Data print successful!'));
      backup('data' + filecount, '', data_to_write);
      filecount++;
      data_to_write = [];
    } else {
      //console.log("All data has been written.");
    }
  } while (checkseries());
} 



function backup(filename: string, pathname: string, checkdata: Array<Datapacket>) {

  const csv = require('csv-parser');
  const fs = require('fs');

  const backupname = filename + '_backup';
  const filepath = backupname + '.csv';

  fs.createReadStream(filename + '.csv')
    .pipe(csv())
    .on('data', (data: any) => {
      csvdata.push(data);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      console.log(csvdata);
      for (var i = 0; i < csvdata.length; i++) {
        var check = checkdata[i]
        if (csvdata[i].Checksum == check.checksum) {
          backupdata.push(csvdata[i]);
          console.log("Adding data to backup");
        }
      }

      const createCsvWriter = require('csv-writer').createObjectCsvWriter;
      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'Set Name', title: 'Set Name' },
          { id: 'Series Name', title: 'Series Name' },
          { id: 'Value', title: 'Value' },
          { id: 'Units', title: 'Units' },
          { id: 'Time', title: 'Time' },
          { id: 'Checksum', title: 'Checksum' }
        ]
      });
      console.log(backupdata.length);
      if (backupdata.length > 0) {
        csvWriter.writeRecords(backupdata)
          .then(() => console.log("Backup successfully created."));
        backupdata = [];
      }
    });

}



function checkseries() {
  for (var i = 0; i < reactor_data.datasets.length; i++) {
    var seriess = reactor_data.datasets[i].series;
    for (var j = 0; j < seriess.length; j++) {
      var datas = seriess[j].data;
      for (var k = 0; k < datas.length; k++) {
        var datapoints = datas.map((data: Datapoint) => data);
        if (datapoints.length > 0)
          return true;
      }
    }
  }
  return false;
}