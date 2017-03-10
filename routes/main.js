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

'use strict';

const request = require('request');

module.exports = function(app, data){
	// [START external_ip]
	// In order to use websockets on App Engine, you need to connect directly to
	// application instance using the instance's public external IP. This IP can
	// be obtained from the metadata server.
	const METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/' +
	    '/instance/network-interfaces/0/access-configs/0/external-ip';

	function getExternalIp (cb) {
	  const options = {
	    url: METADATA_NETWORK_INTERFACE_URL,
	    headers: {
	      'Metadata-Flavor': 'Google'
	    }
	  };

	  request(options, (err, resp, body) => {
	    if (err || resp.statusCode !== 200) {
	      console.log('Error while talking to metadata server, assuming localhost');
	      cb('localhost');
	      return;
	    }
	    cb(body);
	  });
	}
	// [END external_ip]

	app.get('/', (req, res) => {
	  getExternalIp((externalIp) => {
	    res.render('index.ejs', {externalIp: externalIp});
	  });
	});

	app.get('/graph', (req, res) => {
		getExternalIp((externalIp) => {
			res.render('graph.ejs', {externalIp: externalIp});
		});
	});
	app.get('/navigation', (req, res) => {
		res.render('navigation');
	});
	app.get('/about', (req, res) => {
		res.render('about');
	});
	app.get('/team', (req, res) => {
		res.render('team');
	});
	app.get('/subteams', (req, res) => {
		res.render('subteams');
	});
	app.get('/home', (req, res) => {
		res.render('home');
	});

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
	  		data.push(req.body);
			if(d>5000){
				data[5] = d;
				// sendToApp(JSON.stringify(data)); //Should I reinitialize the array?
				// console.log(data);
				app.ws.send('data-msg', data);
			} else {
				var col = Math.floor(Math.trunc(d)/1000);
				if (col == 1){
					data[col-1] = d-(col*1500.0);
				}else if (col == 2){
					data[col-1] = d-(2500.0);
				}else if (col == 3){
					data[col-1] = d-(3500.0);
				}else if (col == 4){
					data[col-1] = 0;//d-(4500.0);
				}
			}
		});

	app.route('/getdata')
		.get(function(req, res){
			res.send(data);
		})
}