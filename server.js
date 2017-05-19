/*********
 * Required modules
 *********/
var express = require( 'express' );
var APIInterface = express();
var WebInterface = express();
var bodyParser = require( 'body-parser' );
var fs = require( 'fs' );
var assert = require('assert');
var dgram = require('dgram');
var path = require('path');
var DeviceManager = require('./DeviceManager/deviceManager');

/*********
 * Globals and configuration
 *********/

var UDPSocket = dgram.createSocket('udp4');
var externalIP = "0.0.0.0";
var UDPPort = 4211;
var apiPort = 8084;
var webPort = 8080;

/*********
 * UDP listener
 *********/
 /*
  * Makes the server discoverable to devices that don't know it's IP or port
  */

UDPSocket.on('listening', function() {
  var address = UDPSocket.address();
  console.log('Discovery protocol listening on ' + address.address + ":" + address.port);
});

UDPSocket.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    var message = new Buffer( "" + apiPort );
    UDPSocket.send(message, 0, message.length, remote.port, remote.address, function(err, bytes) {
      if (err) throw err;
      console.log('UDP message sent to ' + remote.address +':'+ remote.port);
    });
});

UDPSocket.bind( UDPPort, externalIP );

/*********
 * Restful interface
 *********/

 //Cors headers
 APIInterface.use(function( request, response, next ) {
   response.header("Access-Control-Allow-Origin", "*");
   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
 });
 APIInterface.use( bodyParser.json() );
 APIInterface.use( bodyParser.urlencoded( { extended: true} ) );


APIInterface.get('/devices', function( request, response ) {
  response.status( 200 ).json( DeviceManager.getDevices() );
});

APIInterface.post('/devices', function( request, response ) {
  var newDeviceId = DeviceManager.registerDevice( request.body );
  response.status(201).json( { 'dataUrl':'/devices/'+newDeviceId+'/input', 'id':newDeviceId } );
});

APIInterface.get('/devices/:deviceId', function( request, response ) {
  var deviceId =  request.params.deviceId;
  response.status( 200 ).json( DeviceManager.getDevice( deviceId ) );
});

APIInterface.post('/devices/:deviceId/input', function( request, response ) {
  var deviceId =  request.params.deviceId;
  var result = DeviceManager.handleInput( deviceId, request.body );

  if( result === 0 ) {
    response.sendStatus( 201 );
  } else {
    response.status( 500 ).send( result );
  }
});

APIInterface.post('/devices/:deviceId/controls', function( request, response ) {
  var deviceId =  request.params.deviceId;
  var result = DeviceManager.handleControl( deviceId, request.body );

  if( result === 0 ) {
    response.sendStatus( 200 );
  } else {
    response.status( 500 ).send( result );
  }

});

APIInterface.get('/', function ( request, response ) {
  response.send('Hello World!')
});

// A handy endpoint for testing json requests. It just echoes the json payload
// back
APIInterface.post('/echo', function( request, response ) {
  console.log( request.body );
  response.json( request.body );
});

var apiServer = APIInterface.listen( apiPort, function() {
  var host = apiServer.address().address;
  var port = apiServer.address().port;
  console.log("Listening for API calls at http://%s:%s", host, port);
});

/*********
 * Web control interface
 *********/
 WebInterface.use(express.static(__dirname + '/Admin/view'));
 //Store all HTML files in view folder.
 WebInterface.use(express.static(__dirname + '/Admin/resources'));
 //Store all JS and CSS in Scripts folder.

 WebInterface.get('/', function ( request, response ) {
   response.sendFile( path.join( 'index.html') );
 });

 WebInterface.get('/css', function ( request, response ) {
   response.sendFile( path.join( 'index.html') );
 });

var webServer = WebInterface.listen( webPort, function() {
  var host = webServer.address().address;
  var port = webServer.address().port;
  console.log("Listening for web requests at http://%s:%s", host, port);
});
