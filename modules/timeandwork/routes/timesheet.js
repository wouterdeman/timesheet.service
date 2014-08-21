'use strict';

var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
var fs = require('fs');
var Authstore = require('../../authstore/service');
var TimesheetService = require('../service').TimesheetService;

module.exports = function (app) {
    app.post('/timeandwork/timesheet', function (req, res) {
        Authstore.verifyToken(req.header('token')).then(function (entity) {
            var input = {
                year: req.body.year,
                month: req.body.month,
                customer: req.body.customer,
                entity: entity
            };

            TimesheetService.list(input).then(function (data) {
                res.json(data);
            }).fail(function (e) {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.' + e);
            });
        });
    });


    app.get('/timeandwork/timesheet/download', function (req, res) {
        /*if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(req.header('token')).then(function (entity) {
            SaldoService.list({
                entity: entity
            }).then(function (saldos) {
                res.json(saldos);
            }).fail(function () {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.');
            });
        });
        */
        console.log(req.body);

        // Create folder if not exists
        if (!fs.existsSync('tmp')) {
            fs.mkdirSync('tmp', '0766', function (err) {
                if (err) {
                    console.log(err);
                    res.send('ERROR! Can\'t make the directory! \n'); // echo the result back
                }
            });
        }

        var timestamp = new Date().getTime();
        var renderedTemplate = 'tmp/' + timestamp + '.html';
        var pdf = 'tmp/' + timestamp + '.pdf';

        fs.readFile(path.join(__dirname, 'template.html'), 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(/%%data%%/g, JSON.stringify({
                firstname: 'Wouter'
            }));

            fs.writeFile(renderedTemplate, result, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        });

        var childArgs = [
            path.join(__dirname, 'rasterize.js'),
            renderedTemplate,
            pdf,
            'A4'
        ];

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
            console.log(err);
            console.log(stdout);
            console.log(stderr);
            res.download(pdf, 'haha.pdf', function () {
                fs.unlink(renderedTemplate);
                fs.unlink(pdf);
            });
        });
    });
};