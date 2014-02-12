module.exports = function(app) {
	var passport = require('passport');
	var GoogleStrategy = require('passport-google').Strategy;

	/*
	 * Configure passport
	 */

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	passport.use(new GoogleStrategy({
			returnURL: 'http://localhost:3000/auth/google/return',
			realm: 'http://localhost:3000/'
		},
		function(identifier, profile, done) {
			console.log(identifier);
			console.log(profile);
			// asynchronous verification, for effect...
			process.nextTick(function() {
				profile.identifier = identifier;
				return done(null, profile);
			});
		}
	));

	var authenticateBiteAccount = function(req, success, failure) {
		return passport.authenticate('google', function(err, user, info) {
			if (err) {
				failure(err);
			} else if (!user) {
				failure('user does not exist');
			} else {
				if (user.emails[0].value.indexOf('@bite.be') === -1) {
					failure('user must be a bite account');
				} else {
					req.login(user, function(err) {
						if (err) {
							failure(err);
						} else {
							success();
						}

					});
				}
			}
		});
	};

	var biteAuthMiddleware = function(req, res, next) {
		var success = function() {
			res.redirect('/')
		};

		var failure = function(error) {
			res.error = error;
			res.redirect('/login');
		}

		var auth = authenticateBiteAccount(req, success, failure);
		auth(req, res, next);
	};

	app.use(passport.initialize());
	app.use(passport.session());

	/*
	 * Routes
	 */
	app.get('/auth/google', passport.authenticate('google', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			res.redirect('/');
		});

	app.get('/auth/google/return', biteAuthMiddleware);

	/*
app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
*/

}