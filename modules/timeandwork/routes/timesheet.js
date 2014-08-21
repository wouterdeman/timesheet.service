'use strict';

var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
var fs = require('fs');

module.exports = function (app) {
    //var SaldoService = require('../service').SaldoService;
    //var Authstore = require('../../authstore/service');

    app.get('/timeandwork/timesheet', function (req, res) {
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

        if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.mkdirSync(path.join(__dirname, 'tmp'), '0766', function (err) {
                if (err) {
                    console.log(err);
                    response.send("ERROR! Can't make the directory! \n"); // echo the result back
                }
            });
        }

        var timestamp = new Date().getTime();
        var renderedTemplate = path.join(__dirname, 'tmp/' + timestamp + '.html');
        var pdf = path.join(__dirname, 'tmp/' + timestamp + '.pdf');

        fs.readFile(path.join(__dirname, 'template.html'), 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(/%%data%%/g, JSON.stringify({
                firstname: 'Wouter'
            }));

            console.log(result);

            fs.writeFile(renderedTemplate, result, 'utf8', function (err) {
                console.log('rendered template written');
                if (err) {
                    return console.log(err);
                }
            });
        });

        var getFiles = function getFiles(dir, files_) {
            files_ = files_ || [];
            if (typeof files_ === 'undefined') {
                files_ = [];
            }
            var files = fs.readdirSync(dir);
            for (var i in files) {
                if (!files.hasOwnProperty(i)) {
                    continue;
                }
                var name = dir + '/' + files[i];
                if (fs.statSync(name).isDirectory()) {
                    getFiles(name, files_);
                } else {
                    files_.push(name);
                }
            }
            return files_;
        };
        console.log(getFiles(path.join(__dirname, 'tmp')));

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
                //fs.unlink(renderedTemplate);
                //fs.unlink(pdf);
            });
        });
    });
};