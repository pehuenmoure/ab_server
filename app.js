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

const http = require('http');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
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

var data = [1,2,35,43,4,1];
var datax = new Array(0);
datax.push(data);
// A simple echo service.
app.ws('/', (ws) => {
  ws.on('message', (msg) =>{  
    var new_msg = JSON.parse(msg);

    if (new_msg.msgType == "download"){
      console.log("Downloading data");
      console.log(datax);
      var new_data = dataToString(datax);
      console.log(new_data);
      var filename = new_msg.filename.toString();

      var existingFileNames = [];


      fs.readdir('public/data/', (err, files) => {
        if(err){
          console.log("error in fs.readdir");
        }
        else{
          files.forEach(file => {
            existingFileNames.push(file);
         });
        }

        if(existingFileNames.includes(filename+'.csv') || filename.length < 5 || existingFileNames.includes(filename)){
          console.log("invalid filename");
        }
        else{
          console.log('write file');
          createCSVFile(new_data, filename);
        }
      })

    }

    else if (new_msg.msgType == 'reset'){
      console.log('reseting data')
      data = new Array(6);
    }
  });
});


require('./routes/main')(app, data);

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
  for(var i = 0;i<rawdata.length;i++){
    for(var j = 0; j<rawdata[i].length;j++){
      str+=rawdata[i][j];
      if(j<rawdata[i].length-1)
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
  fs.writeFile('public/data/' + name + '.csv', data,{flag:'wx'}  ,function(err) {
    if (err) {
      return console.error(err);
    }
  });
}

module.exports = app;
// [END app]