//NPM packages

var http = require('http');
var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true} ) );

var branch = {
  host: "127.0.0.1",
  port: 8084,
  registerPath: "/devices",
};

var temp1 = 20.0;
var temp2 = 20.0;
var temp3 = 20.0;

var device = {
  path : '',
  port : process.argv[2],
  id : null,
  label : "Brew controller 1",
}

if( process.argv.length > 3 ) {
  device.label = process.argv[3];
}

var POST_INTERVAL = 1000 * 5;

var server = app.listen( device.port, function() {
  console.log(this._connectionKey);

  var host = server.address().address;
  var port = server.address().port;

  console.log("Fake client listening at http://%s:%s", host, port);

});

app.post('/controls', function( request, response ) {
  console.log( "We got a control request" );
  console.log( request.body );
  console.log( request.body.setting );
  console.log( request.body.value );
  response.status( 200 ).json( {"status":"successful"} );
});


function FakeClient() {
  this.__registerDevice();
  var that = this;
  setTimeout( function() { that.__postTemperatureData(); }, POST_INTERVAL );
}

FakeClient.prototype.__registerDevice = function( ) {
  var postData = {
    ip : "127.0.0.1",
    port : device.port,
    label : device.label,
  };
  postData = JSON.stringify(postData);
  var options = {
    host: branch.host,
    port: branch.port,
    path: branch.registerPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(postData)
    },
  };
  var request = http.request( options, function( response ) {
    var str = "";
    response.on( 'data', function( chunk ) {
      str += chunk;
    });
    response.on( 'end', function() {
      var data = JSON.parse( str );
      device.path = data.dataUrl;
      device.id = data.id;
      console.log( device );
    });
  });
  request.write( postData );
  request.end();
}

FakeClient.prototype.__postTemperatureData = function( ) {
  console.log("Posting to " + device.path );
  temp1 = temp1 + Math.random()-0.5;
  temp1 = Math.round( (temp1) * 100 ) / 100;
  temp2 = temp2 + Math.random()-0.5;
  temp2 = Math.round( (temp2) * 100 ) / 100;
  temp3 = temp3 + Math.random()-0.5;
  temp3 = Math.round( (temp3) * 100 ) / 100;
  var postData = {
    sensors: {
      roomTemperature: {
        id: 'roomTemperature',
        label: 'Room temperature',
        value: temp1,
        unit: '&degC'
      },
      liquidTemperature: {
        id: 'liquidTemperature',
        label: 'Liquid temperature',
        value: temp2,
        unit: '&degC'
      },
      boxTemperature: {
        id: 'boxTemperature',
        label: 'Box temperature',
        value: temp3,
        unit: '&degC'
      },
    },
  };
  postData = JSON.stringify(postData);
  var options = {
    host: branch.host,
    port: branch.port,
    path: device.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(postData)
    },
  };
  console.log( postData );
  var request = http.request( options, function( response ) {
    var str = "";
    response.on( 'data', function( chunk ) {
      str += chunk;
    });
    response.on( 'end', function() {
      console.log( str );
    });
  });
  request.write( postData );
  request.end();
  var that = this;
  setTimeout( function() { that.__postTemperatureData(); }, POST_INTERVAL );
}

var fakeClient = new FakeClient();
