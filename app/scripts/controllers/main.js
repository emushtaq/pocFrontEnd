'use strict';

/**
 * @ngdoc function
 * @name feApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the feApp
 */
angular.module('feApp')
// .value('braintree', braintree)
.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyApmA-heaA7NVO6GYfQI1LiL_zyDAQvSok',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
})//.constant('clientTokenPath', 'http://localhost:8080/client_token')
  .controller('MainCtrl', ['$scope', '$http', '$window', 'uiGmapGoogleMapApi', function ($scope, $http, $window, uiGmapGoogleMapApi) {
    $scope.user = {
      fromXCoordinates : '52.52656141115588',
      fromYCoordinates : '13.358001708984375',
      toXCoordinates : '52.493233155027156',
      toYCoordinates : '13.422374725341797',
      date : '10-20-2015',
      time : '05:13:00pm',
      maxWalkDistance : 800 };

    $scope.suggestedRoutes = [];

    $scope.makePayment = function(checkoutAmount, nonse) {
      let clientTokenUrl = 'http://localhost:8080/client_token';
      $http({
          method: 'GET',
          url: clientTokenUrl
        }).then(function successCallback(response) {
            $scope.initBrainTree(response.data, checkoutAmount);
          }, function errorCallback(response) {
            console.log(response);
            $window.alert(response.data);
      });
    };

    $scope.initBrainTree = function(clientToken, checkoutAmount) {
      $scope.checkoutAmount = checkoutAmount;
      var form = document.querySelector('#checkout-form');
      var submit = document.querySelector('input[type="submit"]');
      braintree.client.create({
        authorization : clientToken
        }, function(err, clientInstance){
              if (err) {
                $window.alert("Error creating client");
                return;
              }

          braintree.hostedFields.create({
                client: clientInstance,
                styles: {
                  'input': {
                    'font-size': '14pt'
                  },
                  'input.invalid': {
                    'color': 'red'
                  },
                  'input.valid': {
                    'color': 'green'
                  }
                },
                fields: {
                  number: {
                    selector: '#card-number',
                    placeholder: '4111 1111 1111 1111'
                  },
                  cvv: {
                    selector: '#cvv',
                    placeholder: '123'
                  },
                  expirationDate: {
                    selector: '#expiration-date',
                    placeholder: '10 / 2019'
                  }
                }
              }, function (hostedFieldsErr, hostedFieldsInstance) {
                if (hostedFieldsErr) {
                  $window.alert("Error creating hosted fields");
                  return;
                }
                submit.removeAttribute('disabled');

                form.addEventListener('submit', function (event) {
                  event.preventDefault();
                  hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                    if (tokenizeErr) {
                      $window.alert(tokenizeErr);
                      return;
                    }
                    $scope.checkout(payload.nonce);
                  });
              }, false);
            });
      });
      /*braintree.setup(clientToken, 'dropin', {
        container: 'container',
        paymentMethodNonceReceived: function (event, nonce) {
          var paymentRequestPayload = {
            paymentMethodNonce : nonce,
            amount : checkoutAmount
          };
          let checkoutUrl = 'http://localhost:8080/checkout';
          $http({
              method: 'POST',
              data: paymentRequestPayload,
              url: checkoutUrl
            }).then(function successCallback(response) {
              console.log(response);
              $window.alert(response.data + 'Payment success!');
            }, function errorCallback(response) {
              $window.alert(response.data);
            }
          );
        }
    });*/
    };

    $scope.checkout = function(nonce) {

      let postData = {
        paymentMethodNonce : nonce,
        amount : $scope.checkoutAmount
      };
      let checkoutUrl = 'http://localhost:8080/checkout';
      $http({
          method: 'POST',
          url: checkoutUrl,
          data: postData
        }).then(function successCallback(response) {
            $window.alert(response.data);
          }, function errorCallback(response) {
            console.log(response);
            $window.alert(response.data);
      });

    };

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
            $scope.parseRoutes(response.data);
          }, function errorCallback(response) {
            $scope.response = response;
          });
      };

      $scope.parseRoutes = function(routes) {
        routes.forEach(function(route){
          let tempRouteObject = {};
          tempRouteObject.transitTime = route.transitTime;
          tempRouteObject.totalPrice = route.totalPrice;
          $scope.suggestedRoutes.push(tempRouteObject);
        });
      };


      $scope.map = {
          center: { latitude: 52.5200, longitude: 13.4050 },
          zoom: 9,
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

      uiGmapGoogleMapApi.then(function(maps) {
        console.log(maps);
      });
  }]);
