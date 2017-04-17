'use strict';

const request = require('request');

module.exports = function(app, waypoints){

	app.route('/getwaypoints')
		.get(function (req, res) { //Handles sending data
			res.send(JSON.stringify(waypoints));
		})
		.post(function (req, res) { //Handles recieving data
	  		waypoints = req.body;
		});

}