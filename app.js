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

var data = new Array(1);
data[0] = ["Lean Angle","Lean Rate","Front Motor Angle","Rear Motor Speed","Micros","Potato"];
// A simple echo service.
var existingFileNames = [];
var filesSorted = [];
var dirsSorted = [];

//getting data stuff working through 
var waypoints



app.ws('/', (ws) => {
  //initial filenames send
  fs.readdir('public/data/', (err, files) => {
    if(err){
      console.log("error in fs.readdir");
    }
    else{
      files.forEach(file => {
        if(file!='.DS_Store'){
          var fileObj = 'public/data/' + file;
          var stats = fs.statSync(fileObj);
          
          filesSorted.push({
              "filename" : file,
              "creation" : stats['birthtime']
          });
          
          existingFileNames.push(file);
        }
      });
    }
  });

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
    console.log('new message');
    var new_msg = JSON.parse(msg);
    
    //may be inefficient, because it's reading all the file names in the data folder everytime ws receives a message
    //existing files array doesnt work the first time after the server is started
    fs.readdir('public/data/', (err, files) => {
        if(err){
          console.log("error in fs.readdir");
        }
        else{
          files.forEach(file => {
            if(file!='.DS_Store'){
              existingFileNames.push(file);
            }
          });
        }
      });

    if (new_msg.msgType == "save"){
      var new_data = dataToString(data);
      var filename = new_msg.filename.toString();

      if(existingFileNames.includes(filename+'.csv') || filename.length < 5 || existingFileNames.includes(filename)){
        console.log("invalid filename");
        var message = (filename.length < 5) ? "filename must be over 5 characters" : "filename is taken";
        // send error 
        var errorMessage = {
          type: "filenameError",
          msg: message
        };
        ws.send(JSON.stringify(errorMessage));
      }
      else{
        console.log('write file');
        createCSVFile(new_data, filename);
        
        var successMessage = {
          type: "fileWritten",
          msg: filename + ".csv written",
          newFilename: filename+'.csv',
          existingFileNames: existingFileNames
        };
        ws.send(JSON.stringify(successMessage));
      }
    }
    else if (new_msg.msgType == 'reset'){
      console.log('reseting data')
      data = new Array(1);
	  data[0] = ["Lean Angle","Lean Rate","Front Motor Angle","Rear Motor Speed","Micros","Potato"];
    }
    else if (new_msg.msgType == 'download'){
      var fileAddr = 'public/data/'+ new_msg.filename;
      console.log('download: '+fileAddr);
      var filename = new_msg.filename;

      app.get('/download'+filename, function(req,res){
       res.download(__dirname + '/public/data/'+ filename, filename);
      })
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


	app.route('/getwaypoints')
		.get(function (req, res) { //Handles sending data
			res.send(JSON.stringify(waypoints));
		})
		.post(function (req, res) { //Handles recieving data
	  		console.log(req.body);
	  		waypoints = req.body;
		});

	app.route('/datastream')
		.get(function (req, res) { //Handles sending data
			res.send(data);
		})
		.post(function (req, res) { //Handles recieving data
	  		console.log(req.body);
	  		console.log(req.body.length);
	  		data.push(req.body);
		});

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
  fs.writeFile('public/data/' + name + '.csv', data,{flag:'wx'}, function(err) {
    if (err) {
      return console.error(err);
    }
  });
}

module.exports = app;
// [END app]