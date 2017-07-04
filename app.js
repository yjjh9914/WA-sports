var express = require('express');
var Session = require('express-session');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
const ClientId = "868203665789-ibhhhbgth1ttrs6qjtc9m3ubt7793pg9.apps.googleusercontent.com";
const ClientSecret = "9-0O6oE1yQBsYX6soESDmEDn";
const RedirectionUrl = "http://localhost/oauthCallback/";
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');


//var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', '/favicons/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(Session({
    secret: 'your-random-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));


function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}

function getAuthUrl () {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me'
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });

    return url;
}

app.get('/', function(req, res, next){
	var gamedata = require('./public/games/games.json');
	console.log(gamedata);
  res.render('main',{
		title: 'WA Sports',
		games: gamedata.games
	});
});

app.get('/admin',function(req, res, next){
	var url = getAuthUrl();
	res.render('admin',{
		url: url
	});
})
app.use("/oauthCallback", function (req, res) {
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code; // the query param code
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.

      if(!err) {
        oauth2Client.setCredentials(tokens);
        //saving the token to current session
        session["tokens"]=tokens;
        res.redirect('/upload');
      }
      else{
        res.send(`
            &lt;h3&gt;Login failed!!&lt;/h3&gt;
        `);
      }
    });
});

app.get("/upload", function(req, res) {
    var oauth2Client = getOAuthClient();
    if(!(req.session["tokens"])){
        res.redirect("/admin");
    }
    else{
        oauth2Client.setCredentials(req.session["tokens"]);
        var p = new Promise(function(resolve, reject){
            plus.people.get({userId: 'me', auth: oauth2Client}, function(err, response){
                resolve(response || err);
            });
        }).then(function(data){
            console.log(data.url);
            if(data.url === "https://plus.google.com/110873073230021068235"){
                res.render('upload');
            }
            else res.redirect("https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost/admin");
        });
    }
})

app.get('/:sports', function (req, res, next){
	res.render('games',{
		title: req.param.sports
	});
});
// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;