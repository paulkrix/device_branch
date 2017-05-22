var dataHandlers = require('./DataHandlers/dataHandlers');

function Device( options, id ) {
  if( options.type ) {
    this.type = options.type;
  }
  if( options.mode ) {
    this.mode = options.mode;
  }
  if( options.ip ) {
    this.ip = options.ip;
  }
  if( options.port ) {
    this.port = options.port;
  }
  if( options.logger ) {
    this.logger = options.logger;
  }
  if( options.label ) {
    this.label = options.label;
  }
  if( options.dataHandlers ) {
    this.dataHandlers = options.dataHandlers;
  }
  this.id = id;
  for( var key in this.dataHandlers ) {
    if( this.dataHandlers.hasOwnProperty( key ) ) {
      this.dataHandlers[key] = dataHandlers.getDataHandler( this.dataHandlers[key], key );
    }
  }
}

Device.prototype.id = null;
Device.prototype.type = "sensor";
Device.prototype.mode = "active"; //active | passive
Device.prototype.ip = null;
Device.prototype.port = "80";
Device.prototype.status = "registered";
Device.prototype.data = {};
Device.prototype.label = null;

// Device.prototype.dataHandlers = {
//   "Sparkfun" : {},
// }

Device.prototype.dataHandlers = {
  Mongo : {
    mapping: {
      sensors: 'sensors',
      time : 'time',
      id: 'id',
    },
  },
  Blynk : {}
}

Device.prototype.handleInput = function( data ) {
  this.data = data;
  for( var key in this.dataHandlers ) {
    if( this.dataHandlers.hasOwnProperty( key ) ) {
      this.dataHandlers[key].handleData( data, this );
    }
  }
}

Device.prototype.flatten = function() {
  var flatDevice = flattenObject( this );
  for( var key in this.dataHandlers ) {
    if( this.dataHandlers.hasOwnProperty( key ) ) {
      flatDevice.dataHandlers[key] = flattenObject( this.dataHandlers[key] );
    }
  }
  return flatDevice;
}

Device.prototype.getData = function( handler, inputId, callback ) {
  this.dataHandlers[ handler ].getData( inputId, callback );
}

function device (options, id ) {
  if (options === undefined) {
    return new Device({}, id)
  }

  if (typeof options === 'object' && options !== null) {
    return new Device(options, id)
  }

  throw new TypeError('Expected object for argument options')
}

function flattenObject( object ) {
  var flatObject = Object.create( object );
  for( var key in flatObject ) {
    flatObject[key] = flatObject[key];
  }
  return flatObject;
}

module.exports = device;
