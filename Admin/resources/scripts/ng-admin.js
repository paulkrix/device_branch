var BranchAdminApp = angular.module('BranchAdminApp', []);

BranchAdminApp.factory( 'DeviceManager', function( $http, $location ) {
  return {
    get: function() {
      return $http.get( $location.protocol()  + '://' + $location.host() + ':8084/devices?cacheBreaker='+Date.now()).then( function( result ) {
        if( result.status === 200 ) {
          return result.data;
        }
        return [];
      },
      function(result) {
        return [];
      });
    },

    // save: function (data, type, callback) {
    //   if(callback === undefined) {
    //     callback = function(){}
    //   };
    //   $http.post('data/save.php', { 'data': data, 'type':type })
    //   .success(callback);
    // },

    // destroy: function (data, type, callback) {
    //   if(callback === undefined) {
    //     callback = function(){}
    //   };
    //   $http.post('data/destroy.php', { 'data': data, 'type':type })
    //   .success(callback);
    // }

  }
})

BranchAdminApp.filter('trusted', ['$sce', function($sce) {
    var div = document.createElement('div');
    return function(text) {
        return $sce.trustAsHtml( text );
    };
}])

BranchAdminApp.controller('DevicesController', function DevicesController( $scope, DeviceManager ) {
  DeviceManager.get().then( function( _data ) {
    $scope.devices = _data;
    console.log( _data );
  });
  $scope.devices = [];
});
