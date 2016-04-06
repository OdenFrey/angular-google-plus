(function(window, angular, undefined) {
  'use strict';

  // Module global options.
  var options = {};

  // Module global flags.
  var flags = {
    sdk: false,
    ready: false
  };
  
  /**
   * googleplus module
   */
  angular.module('googleplus', []).

    // Declare module options value
    value('options', options).

    // Declare module flags value
    value('flags', flags).

    /**
     * GooglePlus provider
     */
    provider('GooglePlus', [function() {
      /**
       * clientId
       * @type {Number}
       */
      options.clientId = null;

      this.setClientId = function(clientId) {
        options.clientId = clientId;
        return this;
      };

      this.getClientId = function() {
        return options.clientId;
      };

      /**
       * apiKey
       * @type {String}
       */
      options.apiKey = null;

      this.setApiKey = function(apiKey) {
        options.apiKey = apiKey;
        return this;
      };

      this.getApiKey = function() {
        return options.apiKey;
      };

      /**
       * Scopes
       * @default 'https://www.googleapis.com/auth/plus.login'
       * @type {Boolean}
       */
      options.scopes = 'https://www.googleapis.com/auth/plus.login';

      this.setScopes = function(scopes) {
        options.scopes = scopes;
        return this;
      };

      this.getScopes = function() {
        return options.scopes;
      };

      /**
       * load SDK
       */
      options.loadSDK = true;

      this.setLoadSDK = function(a) {
        options.loadSDK = !!a;
      };

      this.getLoadSDK = function() {
        return options.loadSDK;
      };

      /**
       * Init Google Plus API
       */
      this.init = function(customOptions) {
        angular.extend(options, customOptions);
      };

      /**
       * Make sign-in server side
       */
      this.enableServerSide = function () {
        options.accessType = 'offline';
        options.responseType = 'code token id_token gsession';
      };

      /**
       * Make sign-in client side (default)
       */
      this.disableServerSide = function () {
        delete options.accessType;
        delete options.responseType;
      };

      /**
       * This defines the Google Plus Service on run.
       */
      this.$get = ['$q', '$rootScope', '$timeout', function($q, $rootScope, $timeout) {

        /**
         * Define a deferred instance that will implement asynchronous calls
         * @type {Object}
         */
        var deferred;

        /**
         * NgGooglePlus Class
         * @type {Class}
         */
        var NgGooglePlus = function () {};

        /**
         * Ready state method
         * @return {Boolean}
         */
        NgGooglePlus.prototype.isReady = function() {
          return flags.ready;
        };

        NgGooglePlus.prototype.login =  function () {
          deferred  = $q.defer();

          var authOptions = {
            client_id: options.clientId,
            scope: options.scopes,
            immediate: false
          };

          if(options.accessType && options.responseType) {
            authOptions.access_type = options.accessType;
            authOptions.response_type = options.responseType;
          }

          gapi.auth.authorize(authOptions, this.handleAuthResult);

          return deferred.promise;
        };

        NgGooglePlus.prototype.checkAuth = function() {
          deferred  = $q.defer();

          gapi.auth.authorize({
            client_id: options.clientId,
            scope: options.scopes,
            immediate: true
          }, this.handleAuthResult);

          return deferred.promise;
        };

        NgGooglePlus.prototype.handleClientLoad = function () {
          gapi.client.setApiKey(options.apiKey);
          gapi.auth.init(function () { });
          $timeout(this.checkAuth, 1);
        };

        NgGooglePlus.prototype.handleAuthResult = function(authResult) {
            if (authResult && !authResult.error) {
              deferred.resolve(authResult);
              $rootScope.$apply();
            } else {
              deferred.reject('error');
            }
        };

        NgGooglePlus.prototype.getUser = function() {
            var deferred = $q.defer();

            gapi.client.load('oauth2', 'v2', function () {
              gapi.client.oauth2.userinfo.get().execute(function (resp) {
                deferred.resolve(resp);
                $rootScope.$apply();
              });
            });

            return deferred.promise;
        };

        NgGooglePlus.prototype.getToken = function() {
          return gapi.auth.getToken();
        };

        NgGooglePlus.prototype.setToken = function(token) {
          return gapi.auth.setToken(token);
        };

        NgGooglePlus.prototype.logout =  function () {
          gapi.auth.signOut();
        };

        return new NgGooglePlus();
      }];
  }]).

  /**
   * Module initialization
   */
  run([
    '$rootScope',
    '$q',
    '$window',
    '$timeout',
    function($rootScope, $q, $window, $timeout) {
      var loadSDK = options.loadSDK;

      /**
       * SDK script injecting
       */
      if(loadSDK) {
        (function injectScript() {
          var src           = '//apis.google.com/js/client.js',
              script        = document.createElement('script');
              script.id     = 'google-jssdk';
              script.async  = true;

          // Prefix protocol
          if (['file', 'file:'].indexOf($window.location.protocol) !== -1) {
            src = 'https:' + src;
          }

          script.src = src;
          script.onload = function() {
            // Set sdk global flag
            flags.sdk = true; 

            // Set ready global flag
            flags.ready = true;
          };

          document.getElementsByTagName('head')[0].appendChild(script); // // Fix for IE < 9, and yet supported by lattest browsers
        })();
      }
    }
  ]);

})(window, angular);
