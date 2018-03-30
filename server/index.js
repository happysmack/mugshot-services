const argv = require('minimist')(process.argv.slice(2));
const express = require('express');
const profileInformation = require(`../profiles/${argv.profile}`);
const MongoClient = require('mongodb').MongoClient;

let app = express();
let db;
let pageSize = 9;

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

MongoClient.connect(profileInformation.mongoUrl, (error, client) => {
	if (error) {
		// eslint-disable-next-line
		return console.log(error);
	}

	db = client.db('inmates');
});

app.get('/inmates', function(request, response) {
	db.collection(profileInformation.databaseCollection).find({}, {'sort' : [['ISODate', -1]]}).limit(pageSize).toArray((error, results) => {
		response.send(results);
	});
});

app.get('/inmates/:page', function(request, response) {
	let page = request.params.page;

	db.collection(profileInformation.databaseCollection).find({}, {'sort' : [['ISODate', -1]]}).skip(pageSize * (page - 1)).limit(pageSize).toArray((error, results) => {
		response.send(results);
	});
});

app.get('/inmate/:inmateId', function(request, response) {
	let inmateId = request.params.inmateId;

	db.collection(profileInformation.databaseCollection).find({id: inmateId}).limit(1).toArray((error, results) => {
		response.send(results);
	});
});

app.get('/search', function(request, response) {
	let firstName = request.query.firstName;
	let lastName = request.query.lastName;

	let searchQuery = {};
	if (firstName) searchQuery['person.firstName'] = firstName.toUpperCase();
	if (lastName) searchQuery['person.lastName'] = lastName.toUpperCase();

	db.collection(profileInformation.databaseCollection).find(searchQuery, {'sort' : [['ISODate', -1]]}).limit(pageSize).toArray((error, results) => {
		response.send(results);
	});
});

// eslint-disable-next-line
app.listen(3001, () => console.log('inmate-server running on port 3001'));
