'use strict';

require('./libs/mongoose');
var express = require('express');
var app = express();
var port = 3000;

require('./libs/express')(app, express, __dirname);
require('./routes')(app);
require('./modules/timeandwork/routes')(app);
require('./modules/timetracker/routes')(app);
require('./modules/userstore/routes')(app);
require('./modules/authstore/routes')(app);

/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);