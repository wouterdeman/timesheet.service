'use strict';

module.exports = function (app) {
    var AbsenceRightService = require('../service').AbsenceRightService;
    var SaldoService = require('../service').SaldoService;

    app.get('/timeandwork/absencerights/:year', function (req, res) {
        SaldoService.list({
            year: req.params.id
        }).then(function (absencerights) {
            res.json(absencerights);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.post('/timeandwork/absencerights', function (req, res) {
        var absenceright;
        console.log('POST: ');
        console.log(req.body);
        absenceright = {
            name: req.body.name,
            year: req.body.year,
            amount: req.body.amount,
            entity: req.body.entity,
            seqnr: req.body.seqnr,
            monthly: req.body.monthly
        };

        AbsenceRightService.save(absenceright).then(function () {
            console.log('absenceright created');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(absenceright);
    });

    app.get('/timeandwork/absencerights/:id', function (req, res) {
        AbsenceRightService.get(req.params.id).then(function (absenceright) {
            res.json(absenceright);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.put('/timeandwork/absencerights/:id', function (req, res) {
        var absenceright;
        console.log('PUT: ');
        console.log(req.body);
        absenceright = {
            name: req.body.name,
            year: req.body.year,
            amount: req.body.amount,
            entity: req.body.entity,
            seqnr: req.body.seqnr,
            monthly: req.body.monthly
        };

        AbsenceRightService.update(req.params.id, absenceright).then(function () {
            console.log('absenceright updated');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(absenceright);
    });

    app.delete('/timeandwork/absencerights/:id', function (req, res) {
        AbsenceRightService.remove(req.params.id).then(function () {
            console.log('absenceright removed');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
        return res.json();
    });
};
