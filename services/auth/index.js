var Requester = require('requester'),
	requester = new Requester({
		debug: 1
	});
var crypto = require('crypto');
var models = require('../../models');
var User = models.userModel;
var Token = models.tokenModel;
var Q = require('q');

var getGoogleAuthToken = function(refreshtoken) {
	var deferred = Q.defer();
	var authUrl = "https://accounts.google.com/o/oauth2/token"
	var data = {
		refresh_token: refreshtoken,
		client_id: "607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com",
		client_secret: "PfpT2sY3tLOlztx9J5FE2gdR",
		grant_type: "refresh_token"
	};

	requester.post(authUrl, {
		headers: {
			"content-type": "application/x-www-form-urlencoded"
		},
		data: data
	}, function(resJson) {
		var response = JSON.parse(resJson);
		var access_token = response.access_token;
		deferred.resolve(access_token);
	});

	return deferred.promise;
};

var getUserEmail = function(access_token) {
	var deferred = Q.defer();
	requester.get("https://www.googleapis.com/userinfo/email?alt=json&access_token=" + access_token, {}, function(resg) {
		var responseGoogle = JSON.parse(resg);
		var email = responseGoogle.data.email;
		deferred.resolve(email);
	});

	return deferred.promise;
};

var getNewTokenAndUpdateUser = function(email, refreshtoken, provider) {
	var deferred = Q.defer();
	crypto.randomBytes(48, function(ex, buf) {
		var userToken = buf.toString('hex');
		User.findOne({
			email: email
		}, function(error, user) {
			if (error || !user) {
				deferred.reject(new Error(error));
				return;
			}

			if (provider == "google") {
				user.google = {
					refreshtoken: refreshtoken
				};
				user.provider = "google";
			}

			user.token = Token.create(userToken);
			user.save(function(err, user) {
				deferred.resolve(userToken);
			});
		});
	});
	return deferred.promise;
};

exports.getGoogleAuthToken = getGoogleAuthToken;
exports.getUserEmail = getUserEmail;
exports.getNewTokenAndUpdateUser = getNewTokenAndUpdateUser;