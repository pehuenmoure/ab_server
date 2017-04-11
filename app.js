/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START app]
'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var router = express.Router();

const app = express();
const http = require('http').Server(app);
const fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use express-ws to enable web sockets.
require('express-ws')(app);

//postgres

//usrename:password ... dbname
var conString = "postgres://postgres:postgres@localhost/ab_data";

var pg = require('pg');
function query(query, fn){
  //query is a SQL query string
    pg.connect(conString, function(err, client, done){
      if(err) {return console.error('pg error', err);}
        client.query(query, function(err, result){
          if(err) {return console.error('query error', err);}
          fn(JSON.stringify(result.rows));
    });
  });
}

query('SELECT * FROM tests', function(result){
  console.log("async: "+result);
});

//pg-promise version
var pgp = require('pg-promise')();
var db = pgp(conString);

db.any("select * from tests", [true])
    .then(data => {
        console.log("data: "+JSON.stringify(data));
    })
    .catch(error => {console.log("ERROR:", error.message || error);});
db.any("select * from data", [true])
    .then(data => {
        console.log("data: "+JSON.stringify(data));
    })
    .catch(error => {console.log("ERROR:", error.message || error);});

/*
router.post('/getTestsTable', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  pg.connect(conString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM tests');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      console.log(res.json(results));
      return res.json(results);
    });
  });
});
*/

function randomArray(rows, cols){
  var arr = [];
  for (var i = 0; i < rows; i++){
    arr.push(randomRow(cols));
  }
  function randomRow(cols){
    var row = [];
    for (var i = 0; i < cols; i++){
      // random int between 
      row.push((Math.random() * 10) + 1  )
    }
    return row;
  }
  return arr
}
console.log(randomArray(4,3));


// A simple echo service.
var existingFileNames = [];
var filesSorted = [];
var dirsSorted = [];

app.ws('/', (ws) => {
  for(var i = 0; i < filesSorted.length; i++){
    var dat = filesSorted[i];
    console.log('time: '+ (dat["creation"]));
  }

  var initialFilenamesMessage = {
    type: "initialFilenames",
    msg: existingFileNames.length+" files",
    existingFileNames: existingFileNames
  };
  ws.send(JSON.stringify(initialFilenamesMessage));

  ws.on('message', (msg) =>{
    
  });
  });

  


require('./routes/main')(app);

// Start the websocket server
const wsServer = app.listen('65080', () => {
  console.log('Websocket server listening on port %s', wsServer.address().port);
});

// Additionally listen for non-websocket connections on the default App Engine
// port 8080. Using http.createServer will skip express-ws's logic to upgrade
// websocket connections.

//=======================FOR WRITING TO FILE======================
/*
*Converts the 2d array into a csv String
*/
function dataToString(rawdata){
  var str = "";
  //Converting data to string
  for(var i = 0; i < rawdata.length; i++){
    for(var j = 0; j < rawdata[i].length; j++){
      str += rawdata[i][j];
      if(j < rawdata[i].length-1)
        str+=',';
    }
    str+='\n';
  }
  return str;
}

/*
*Writes data to a .csv file
*/
function createCSVFile(data, name){
  // flag wx causes this to fail when filename exists, prevents overwriting data
  fs.writeFile('public/data/' + name + '.csv', data, {flag:'wx'}, function(err) {
    if (err) {
      return console.error(err);
    }
  });
}

module.exports = app;
// [END app]