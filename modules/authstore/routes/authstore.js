'use strict';

module.exports = function (app) {
    var Authstore = require('../service');

    app.get('/authstore/verify', function (req, res) {
        var token = req.header('token');
        if (!token) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(token).then(function () {
            res.json(true);
        }).fail(function () {
            res.json(false);
        });
    });
};