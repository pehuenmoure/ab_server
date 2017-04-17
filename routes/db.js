//postgres


'use strict';

const request = require('request');

module.exports = function(app, data){

//usrename:password ... dbname
var conString = "postgres://postgres:postgres@localhost/ab_data";

var pg = require('pg');
//pg-promise version
var pgp = require('pg-promise')();
var db = pgp(conString);


app.get('/testnames', (req, res) => {
    db.any("select * from tests", [true])
    .then(data => {
        //console.log("data: "+JSON.stringify(data));
        res.json(data);
        //res.send("data: "+JSON.stringify(data));
    })
    .catch(error => {console.log("ERROR:", error.message || error);});
  });

app.get('/download', (req, res) => {
  var query = "select D.lean_angle, D.lean_angular_rate, D.steer_angle, D.measured_steer_rate,\
  D.desired_steer_rate, D.measured_steer_angle, D.desired_steer_angle, D.measured_velocity, \
  D.desired_velocity, D.battery_voltage, D.time from tests T JOIN data D on T.tid = D.tid\
   where T.tid = "+req.headers["id"].toString();
   console.log(query)
   db.any(query, [true])
    .then(data => {
        //console.log("data: "+JSON.stringify(data));
        res.json(data);
        //res.send("data: "+JSON.stringify(data));
    })
    .catch(error => {console.log("ERROR:", error.message || error);});
  });

/*function query(query, fn){
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
*/

/*
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




}