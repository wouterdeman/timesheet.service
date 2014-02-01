'use strict';

/*
 * Express Dependencies
 */
var db = require('./mongoose');
var express = require('express');
var app = express();
var port = 3000;
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

// For gzip compression
app.use(express.compress());

/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/dist/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');

// Set bodyParser
app.use(express.bodyParser());

//app.use(express.session({secret: 'SECRET'}));
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
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var authenticateBiteAccount = function(req, success, failure){
    return passport.authenticate('google', function(err, user, info){
        if(err){
            failure(err);
        }
        else if(!user){
            failure('user does not exist');
        }
        else{
            if(user.emails[0].value.indexOf('@bite.be') === -1){
                failure('user must be a bite account');
            }
            else{
                req.login(user, function(err){
                    if(err){
                        failure(err);    
                    }else{
                        success();
                    }
                    
                });
            }
        }
    });
};

var biteAuthMiddleware = function(req, res, next){
    var success = function(){
        res.redirect('/')
    };

    var failure = function(error){
        res.error = error;
        res.redirect('/login');
    }

    var auth = authenticateBiteAccount(req, success, failure);
    auth(req, res, next);
};

app.use( express.cookieParser() );
  app.use(express.session({ secret: 'veryverysecret' }));
  app.use(passport.initialize());
  app.use(passport.session());

/*
 * Routes
 */

app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/login' }),
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

require('./routes')(app);

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);