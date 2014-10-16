'use strict';

var Q = require('q');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var binPath = phantomjs.path;
var fs = require('fs');

exports.generate = function (template, data) {
    var deferred = Q.defer();

    if (!fs.existsSync('tmp')) {
        fs.mkdirSync('tmp', '0766', function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
        });
    }

    var timestamp = new Date().getTime();
    var renderedTemplate = 'tmp/' + timestamp + '.html';
    var pdf = 'tmp/' + timestamp + '.pdf';

    fs.readFile(path.join(__dirname, '../documenttmpls/' + template), 'utf8', function (err, content) {
        if (err) {
            deferred.reject(err);
            return;
        }
        var result = content.replace(/%%data%%/g, JSON.stringify(data));

        fs.writeFile(renderedTemplate, result, 'utf8', function (err) {
            if (err) {
                deferred.reject(err);
                return;
            }
        });
    });

    var childArgs = [
        path.join(__dirname, '../documenttmpls/rasterize.js'),
        renderedTemplate,
        pdf,
        'A4'
    ];

    childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
        deferred.resolve(pdf, function () {
            fs.unlink(renderedTemplate);
            fs.unlink(pdf);
        }, err, stdout, stderr);
    });

    return deferred.promise;
};