'use strict';

module.exports = function (app) {
    var UserService = require('../service');

    app.get('/users', function (req, res) {
        /*if (!req.body.hasOwnProperty('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }*/

        res.setHeader('Access-Control-Allow-Origin', '*');

        UserService.list().then(function (users) {
            res.json(users);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });
};