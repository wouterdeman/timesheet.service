'use strict';

module.exports = function (app) {
    var AbsenceService = require('../service').AbsenceService;
    var AbsenceRightService = require('../service').AbsenceRightService;
    var Authstore = require('../../authstore/service');

    app.get('/timeandwork/absences', function (req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(req.header('token')).then(function (entity) {
            AbsenceService.list({
                entity: entity
            }).then(function (absences) {
                res.json(absences);
            }).fail(function () {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.');
            });
        });
        res.json([]);
    });

    app.post('/timeandwork/absences', function (req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        console.log('POST: ');
        console.log(req.body);

        Authstore.verifyToken(req.header('token')).then(function (entity) {
            var absence;
            absence = {
                date: new Date(req.body.year, req.body.month - 1, req.body.day),
                amount: req.body.amount,
                prenoon: req.body.prenoon,
                entity: entity
            };

            AbsenceRightService.list({
                entity: entity,
                year: req.body.year
            }).then(function (absencerights) {
                console.log(absencerights);
                AbsenceService.save(absence, absencerights).then(function () {
                    console.log('absence created');
                    return res.json({
                        success: true,
                        absence: absence
                    });
                }).fail(function (err) {
                    return res.json({
                        success: false,
                        message: err
                    });
                });
            });
        });
    });

    app.get('/timeandwork/absences/:id', function (req, res) {
        AbsenceService.get(req.params.id).then(function (absence) {
            res.json(absence);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.put('/timeandwork/absences/:id', function (req, res) {
        var absence;
        console.log('PUT: ');
        console.log(req.body);
        absence = {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year,
            amount: req.body.amount,
            prenoon: req.body.prenoon,
            entity: req.body.entity
        };

        AbsenceService.update(req.params.id, absence).then(function () {
            console.log('absence updated');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(absence);
    });

    app.delete('/timeandwork/absences/:id', function (req, res) {
        AbsenceService.remove(req.params.id).then(function () {
            console.log('absence removed');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
        return res.json();
    });
};