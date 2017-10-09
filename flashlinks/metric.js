var env = requiere('./env.js');
var os = require("os");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var expressLogging = require('express-logging');
var logger = require('logops');
var counter = 0;

app.use(expressLogging(logger));

var port = process.env.PORT || 6000

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

//Configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

//---------------------------------------------
//REST
//---------------------------------------------
/*
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
*/
app.get('/metrics/', function(req, res) {  
  r.db('db_counter').table('counter')
    .run()
    .then(function(result) {
      res.end(JSON.stringify(result));
    })
    .error(function(err) {
       res.end(JSON.stringify([]));
       console.log('Internal server error');
    })
});

app.post('/metrics/add/', function(req, res){
  var data = req.body;
  console.log(data);
  r.db('db_metric').table('metrics')
    .insert(data)
    .run()
    .then(function(result) {
      res.send('Query executed');
    })
    .error(function(err) {
      res.status(500).send('Internal Server Error');
    })
});

app.post('/metrics/count/', function(req, res) {  
  var data = req.body;
  var url = data.url;
  r.db('db_counter').table('counting')
  	.filter(r.row('url').eq(url))
    .update({visits: r.row('visits').add(1).default(0)})
    .run()
    .then(function(result) {
    	res.send('Query executed');
    })
    .error(function(err) {
    	console.log('Internal server error');
    })
});

//---------------------------------------------
//Server
//---------------------------------------------
var server = app.listen(port, function() {
	var port = server.address().port;
	console.log("Running");
});