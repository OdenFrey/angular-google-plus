/*! angular-google-plus - v0.1.3 2015-08-27 */
/**
 * googleplus module
 */
angular.module("googleplus", []).provider("GooglePlus", [ function() {
    /**
     * Options object available for module
     * options/services definition.
     * @type {Object}
     */
    var a = {};
    /**
     * clientId
     * @type {Number}
     */
    a.clientId = null;
    this.setClientId = function(b) {
        a.clientId = b;
        return this;
    };
    this.getClientId = function() {
        return a.clientId;
    };
    /**
     * apiKey
     * @type {String}
     */
    a.apiKey = null;
    this.setApiKey = function(b) {
        a.apiKey = b;
        return this;
    };
    this.getApiKey = function() {
        return a.apiKey;
    };
    /**
     * Scopes
     * @default 'https://www.googleapis.com/auth/plus.login'
     * @type {Boolean}
     */
    a.scopes = "https://www.googleapis.com/auth/plus.login";
    this.setScopes = function(b) {
        a.scopes = b;
        return this;
    };
    this.getScopes = function() {
        return a.scopes;
    };
    /**
     * Init Google Plus API
     */
    this.init = function(b) {
        angular.extend(a, b);
    };
    /**
     * Make sign-in server side
     */
    this.enableServerSide = function() {
        a.accessType = "offline";
        a.responseType = "code token id_token gsession";
    };
    /**
     * Make sign-in client side (default)
     */
    this.disableServerSide = function() {
        delete a.accessType;
        delete a.responseType;
    };
    /**
     * This defines the Google Plus Service on run.
     */
    this.$get = [ "$q", "$rootScope", "$timeout", function(b, c, d) {
        /**
       * Define a deferred instance that will implement asynchronous calls
       * @type {Object}
       */
        var e;
        /**
       * NgGooglePlus Class
       * @type {Class}
       */
        var f = function() {};
        f.prototype.login = function() {
            e = b.defer();
            var c = {
                client_id: a.clientId,
                scope: a.scopes,
                immediate: false
            };
            if (a.accessType && a.responseType) {
                c.access_type = a.accessType;
                c.response_type = a.responseType;
            }
            gapi.auth.authorize(c, this.handleAuthResult);
            return e.promise;
        };
        f.prototype.checkAuth = function() {
            e = b.defer();

            gapi.auth.authorize({
                client_id: a.clientId,
                scope: a.scopes,
                immediate: true
            }, this.handleAuthResult);

            return e.promise;
        };
        f.prototype.handleClientLoad = function() {
            gapi.client.setApiKey(a.apiKey);
            gapi.auth.init(function() {});
            d(this.checkAuth, 1);
        };
        f.prototype.handleAuthResult = function(a) {
            if (a && !a.error) {
                e.resolve(a);
                c.$apply();
            } else {
                e.reject(a);
            }
        };
        f.prototype.getUser = function() {
            var a = b.defer();
            gapi.client.load("oauth2", "v2", function() {
                gapi.client.oauth2.userinfo.get().execute(function(b) {
                    a.resolve(b);
                    c.$apply();
                });
            });
            return a.promise;
        };
        f.prototype.getEvents = function (uuid) {
            var a = b.defer();
            gapi.client.load("calendar", "v3", function () {
                gapi.client.calendar.events.list({
                    "calendarId": "primary",
                    "showDeleted": false,
                    "privateExtendedProperty": "uuid=" + uuid
                }).execute(function (b) {
                    a.resolve(b);
                    c.$apply();
                });
            });

            return a.promise;
        };

        f.prototype.addEvent = function (event) {
            var a = b.defer();

            this.getEvents(event.extendedProperties.private.uuid).then(function(events) {
                if (!events || !events.items.length){
                    gapi.client.load("calendar", "v3", function () {
                        gapi.client.calendar.events.insert({
                            "calendarId": "primary",
                            "resource": event
                        }).execute(function (b) {
                            a.resolve(b);
                            c.$apply();
                        });
                    });
                } else {
                    a.reject(events.items[0]);
                }
            });

            return a.promise;
        };

        f.prototype.deleteEvent = function (eventId) {
            var a = b.defer();
            this.getEvents(eventId).then(function(events) {
                if (events && events.items.length){
                    gapi.client.load("calendar", "v3", function () {
                        gapi.client.calendar.events.delete({
                            "calendarId": "primary",
                            "eventId": events.items[0].id
                        }).execute(function (b) {
                            a.resolve(b);
                            c.$apply();
                        });
                    });
                }
            });

            return a.promise;
        };
        f.prototype.getToken = function() {
            return gapi.auth.getToken();
        };
        f.prototype.setToken = function(a) {
            return gapi.auth.setToken(a);
        };
        f.prototype.logout = function() {
            gapi.auth.signOut();
        };
        return new f();
    } ];
} ]).run([ function() {
    var a = document.createElement("script");
    a.type = "text/javascript";
    a.async = true;
    a.src = "https://apis.google.com/js/client.js";
    var b = document.getElementsByTagName("script")[0];
    b.parentNode.insertBefore(a, b);
} ]);