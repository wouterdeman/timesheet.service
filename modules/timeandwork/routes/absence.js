'use strict';

module.exports = function (app) {
    var AbsenceService = require('../service').AbsenceService;

    app.get('/timeandwork/absences', function (req, res) {
        console.log('ABSENCES');
        console.log(req.header('token'));

        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        /*AbsenceService.list().then(function (absences) {
            res.json(absences);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });*/
        res.json([]);
    });

    app.post('/timeandwork/absences', function (req, res) {
        var absence;
        console.log('POST: ');
        console.log(req.body);
        absence = {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year,
            amount: req.body.amount,
            prenoon: req.body.prenoon,
            absenceright: req.body.absenceright,
            entity: req.body.entity
        };

        AbsenceService.save(absence).then(function () {
            console.log('absence created');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(absence);
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