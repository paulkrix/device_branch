var BranchAdminApp = angular.module('BranchAdminApp', ['ngRoute']);

BranchAdminApp.factory( 'DeviceManager', function( $http, $location ) {
  return {

    get: function( id ) {
      var url = $location.protocol()  + '://' + $location.host() + ':8084/devices?cacheBreaker='+Date.now();
      if( typeof id !== 'undefined' ) {
        url = $location.protocol()  + '://' + $location.host() + ':8084/devices/' + id + '?cacheBreaker='+Date.now();
        console.log( url );
      }
      return $http.get( url ).then( function( result ) {
        if( result.status === 200 ) {
          return result.data;
        }
        return [];
      },
      function(result) {
        return [];
      });
    },

    getData: function( id, handler, inputId ) {
      var url = $location.protocol()  + '://' + $location.host() + ':8084/devices/' +id+ '/dataHandler/' +handler+ '/input/' +inputId+ '?cacheBreaker='+Date.now();
      return $http.get( url ).then( function( result ) {
        if( result.status === 200 ) {
          return result.data;
        }
        return [];
      },
      function(result) {
        return [];
      });
    },

  }
})
BranchAdminApp.filter('trusted', ['$sce', function($sce) {
    var div = document.createElement('div');
    return function(text) {
        return $sce.trustAsHtml( text );
    };
}])

BranchAdminApp.config( function( $routeProvider ) {
  $routeProvider
    .when('/', {
      controller: 'DevicesController',
      templateUrl: 'devices.html'
    })
    .when('/devices/:deviceId', {
      controller: 'DeviceController',
      templateUrl: 'device.html'
    })
    .when('/devices/:deviceId/datahandlers/:handlerId', {
      controller: 'DataHandlerController',
      templateUrl: 'dataHandler.html'
    })
});

BranchAdminApp.controller('DevicesController', function DevicesController( $scope, DeviceManager ) {
  DeviceManager.get().then( function( _data ) {
    $scope.devices = _data;
  });
  $scope.devices = [];
});

BranchAdminApp.controller('DeviceController', function DeviceController( $scope, $routeParams, DeviceManager ) {
  DeviceManager.get( $routeParams.deviceId ).then( function( _data ) {
    // for( var key in _data.dataHandlers ) {
    //   if( key === 'Mongo' ) {
    //     _data.dataHandlers[key].getHistory = true;
    //   }
    // }
    $scope.device = _data;
  });
  $scope.device = {};
});

BranchAdminApp.controller('DataHandlerController', function DataHandlerController( $scope, $routeParams, DeviceManager ) {
  DeviceManager.get( $routeParams.deviceId ).then( function( _data ) {
    for( var key in _data.dataHandlers ) {
      if( key === $routeParams.handlerId ) {
        $scope.dataHandler = _data.dataHandlers[key];
        $scope.dataHandler.label = key;
        if( key === 'Mongo' ) {
          $scope.getData( 0, "Mongo", "roomTemperature" );
        }
      }
    }
    $scope.device = _data;
  });
  $scope.device = {};
  $scope.dataHandler = {};
  $scope.excludeLabelFilter = function( items ) {
    var result = {};
    angular.forEach( items, function( value, key ) {
      if( key !== 'label' ) {
        result[key] = value;
      }
    });
    return result;
  };
  $scope.getData = function( device, handler, inputId ) {
    DeviceManager.getData( device, handler, inputId ).then( function( _data ) {
      $scope.data = _data;
    });
  }
});
