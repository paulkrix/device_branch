/********
 * Requirements
 ********/
var moment = require('moment');
var BaseHandler = require('./BaseHandler');
var Blynk = require('blynk-library');
var util = require('util');
var logins = require('../../logins');

/********
 * Variables and objects
 ********/

var auth = logins.blynk.auth;
var blynk = new Blynk.Blynk( auth );


function BlynkHandler() {
  BaseHandler.apply( this, arguments );
}
util.inherits( BlynkHandler, BaseHandler );

/********
 * Default settings
 ********/

BlynkHandler.prototype.pins = [];
BlynkHandler.prototype.mapping = {
  'sensors[boxTemperature]' : 0,
  'sensors[liquidTemperature]' : 1,
  'sensors[roomTemperature]' : 2,
};

BlynkHandler.prototype.name = "Blynk";

BlynkHandler.prototype.initPins = function( device ) {
  var mapping = this.getOption( 'mapping', device );
  for (var key in mapping) {
    if ( mapping.hasOwnProperty( key ) ) {
      this.pins[ mapping[key] ] = new blynk.VirtualPin( mapping[key] );
    }
  }
}

BlynkHandler.prototype.mapData = function( data, device ) {
  var insertData = {};
  var mapping = this.getOption( 'mapping', device );
  for( var key in mapping ) {
    if( key.indexOf('[') > 0 && key.indexOf( ']' ) === key.length-1 ) {
      var firstBracket = key.indexOf('[');
      var arrayKey = key.substr( 0, firstBracket );
      var elementKey = key.substr( firstBracket + 1, key.length - firstBracket - 2 );
      insertData[ mapping[ key ] ] = data[ arrayKey ][ elementKey ].value;
    }
  }
  return insertData;
}

BlynkHandler.prototype.handleData = function( data, device ) {

  this.initPins( device );

  if( !data.time ) {
    data.time = moment().format();
  }
  if( !data.id ) {
    data.id = device.id;
  }
  var insertData = this.mapData( data, device );

  for (var key in insertData) {
    if ( insertData.hasOwnProperty( key ) ) {
      this.pins[key].write( insertData[key] );
    }
  }

//   v0.write( data.c );

}

module.exports = new BlynkHandler();
