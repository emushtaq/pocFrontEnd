'use strict';

/**
 * @ngdoc function
 * @name feApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the feApp
 */
angular.module('feApp')
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyApmA-heaA7NVO6GYfQI1LiL_zyDAQvSok',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
})
  .controller('MainCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', function ($scope, $http, uiGmapGoogleMapApi) {
    $scope.user = {
      fromXCoordinates : '52.52656141115588',
      fromYCoordinates : '13.358001708984375',
      toXCoordinates : '52.493233155027156',
      toYCoordinates : '13.422374725341797',
      date : '10-20-2015',
      time : '05:13:00pm',
      maxWalkDistance : 800 };

    $scope.fetchRoutes = function() {
      let urlData = 'http://localhost:8080/itineraries?' +
      'fromX='+$scope.user.fromXCoordinates+'&' +
      'fromY='+$scope.user.fromYCoordinates+'&'+
      'toX='+$scope.user.toXCoordinates+'&'+
      'toY='+$scope.user.toYCoordinates+'&'+
      'journeyTime='+$scope.user.time+'&'+
      'journeyDate='+$scope.user.date;

      $http({
          method: 'GET',
          url: urlData
        }).then(function successCallback(response) {
            $scope.response = response.data;
          }, function errorCallback(response) {
            $scope.response = response;
          });
      };

      $scope.map = {
          center: { latitude: 52.5200, longitude: 13.4050 },
          zoom: 12,
          control: {}
        };
      $scope.marker={};
      $scope.marker.options = {
        //icon:'//developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
      };

      $scope.markers = [
        {
          id: Date.now(),
          location : {
            latitude: $scope.user.fromXCoordinates,
            longitude: $scope.user.fromYCoordinates
          }
        },
        {
          id: Date.now()+1,
          location : {
            latitude: $scope.user.toXCoordinates,
            longitude: $scope.user.toYCoordinates
          }
        },
      ];
      
      $scope.initMarkers = function() {
        $scope.markers = [
          {
            id: Date.now(),
            location : {
              latitude: $scope.user.fromXCoordinates,
              longitude: $scope.user.fromYCoordinates
            }
          },
          {
            id: Date.now()+1,
            location : {
              latitude: $scope.user.toXCoordinates,
              longitude: $scope.user.toYCoordinates
            }
          },
        ];
      };

      uiGmapGoogleMapApi.then(function(maps) {
        console.log(maps);
      });

      $scope.updateCoords = function(id) {
        $scope.initMarkers();
      };
  }]);
