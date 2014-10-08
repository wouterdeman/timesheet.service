'use strict';

module.exports = function(app) {
    var AbsenceService = require('../service').AbsenceService;
    var Authstore = require('../../authstore/service');

    app.get('/timeandwork/absencemanagement', function(req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(req.header('token')).then(function() {
            AbsenceService.list().then(function(absences) {
                res.json(absences);
            }).fail(function() {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.');
            });
        });
    });

    app.post('/timeandwork/absencemanagement', function(req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        console.log('POST: ');
        console.log(req.body);

        Authstore.verifyToken(req.header('token')).then(function() {
            var absence;
            absence = {
                from: new Date(req.body.fromYear, req.body.fromMonth - 1, req.body.fromDay),
                to: new Date(req.body.toYear, req.body.toMonth - 1, req.body.toDay),
                amount: req.body.amount,
                prenoon: req.body.prenoon,
                entity: req.body.entity
            };

            AbsenceService.save(absence).then(function() {
                console.log('absence created');
                return res.json({
                    success: true,
                    absence: absence
                });
            }).fail(function(err) {
                return res.json({
                    success: false,
                    message: err
                });
            });
        });
    });

    app.get('/timeandwork/absencemanagement/:id', function(req, res) {
        AbsenceService.get(req.params.id).then(function(absence) {
            res.json(absence);
        }).fail(function() {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.delete('/timeandwork/absencemanagement/:id', function(req, res) {
        AbsenceService.remove(req.params.id).then(function() {
            console.log('absence removed');
        }).fail(function() {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
        return res.json();
    });

    app.post('/timeandwork/freeze', function(req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        console.log('POST: ');
        console.log(req.body);

        Authstore.verifyToken(req.header('token')).then(function() {
            var date = new Date(req.body.year, req.body.month - 1, req.body.day);

            AbsenceService.freeze(date).then(function() {
                console.log('Freeze applied');
                return res.json({
                    success: true
                });
            }).fail(function(err) {
                return res.json({
                    success: false,
                    message: err
                });
            });
        });
    });

    app.get('/timeandwork/absencemanagement/frozen', function(req, res) {
        AbsenceService.getFrozen().then(function(frozen) {
            res.json(frozen);
        }).fail(function() {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });
};