'use strict';

module.exports = function (app) {
    var SaldoService = require('../service').SaldoService;
    var Authstore = require('../../authstore/service');

    app.get('/timeandwork/saldo', function (req, res) {
        if (!req.header('token')) {
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
    });
};