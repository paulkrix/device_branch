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
});

BranchAdminApp.controller('DevicesController', function DevicesController( $scope, DeviceManager ) {
  DeviceManager.get().then( function( _data ) {
    $scope.devices = _data;
    console.log( _data );
  });
  $scope.devices = [];
});

BranchAdminApp.controller('DeviceController', function DeviceController( $scope, $routeParams, DeviceManager ) {
  console.log("hello");
  console.log( $routeParams.deviceId );
  DeviceManager.get( $routeParams.deviceId ).then( function( _data ) {
    $scope.device = _data;
    console.log( _data );
  });
  $scope.device = {};
});
