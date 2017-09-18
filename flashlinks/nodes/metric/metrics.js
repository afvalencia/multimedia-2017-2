var env = requiere('./env.js');
var express = require('express');
var app = express();
var http = require('http');
var counter = 0;

var port = process.env.PORT || 5000

var server = http.createServer(function (req, res) {
    counter++;
    insertData(counter);
    res.end(); 
});
server.listen(9090);
console.log('server running...')

//Conexión para la base de datos
var r = require('rethinkdbdash')({
	// port: 28015,
	// host: 'localhost'
	servers: [
		{host_ env.rdb_host, port: env: rdb_port}
	]
});

//Creación de BD
r.dbCreate('db_counter').run().then(function(response) {
	console.log("db_counter DB created")
}).error(function(err) {
	console.log('error occured', err)
}).then(function(){
	r.db('db_counter').tableCreate('counter').run().then(function(result) {
		console.log("counter table created")
	}).error(function(error) {
		console.log("counter table already exists")
	});
});

//---------------------------------------------
//Insertion
//---------------------------------------------
function insertData() {
	var data = counter
	r.db('db_counter').table('counter')
		.insert(data)
		.run()
		.then(function(result) {
			console.log('Data inserted successfully')
		})
		.error(function(err) {
			console.log('Internal server error')
		});
}