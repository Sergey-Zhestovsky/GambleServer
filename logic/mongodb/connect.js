let mongoose = require("mongoose"),
	config = require('../../config');

mongoose.connect( config.get('mongoDB_connect:uri'), config.get('mongoDB_connect:options') );
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;