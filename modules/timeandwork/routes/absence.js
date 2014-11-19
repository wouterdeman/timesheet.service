'use strict';

module.exports = function (app) {
    var AbsenceService = require('../service').AbsenceService;
    var Authstore = require('../../authstore/service');
    var Userstore = require('../../userstore/service');
    var ICalEvent = require('icalevent');
    require('date-utils');

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
                from: new Date(req.body.fromYear, req.body.fromMonth - 1, req.body.fromDay),
                to: new Date(req.body.toYear, req.body.toMonth - 1, req.body.toDay),
                amount: req.body.amount,
                prenoon: req.body.prenoon,
                entity: entity
            };

            AbsenceService.save(absence).then(function () {
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

    app.get('/timeandwork/absences/:id', function (req, res) {
        AbsenceService.get(req.params.id).then(function (absence) {
            res.json(absence);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
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

    app.get('/timeandwork/ical/:start/:end/:token', function (req, res) {
        if (!req.params.token) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(req.params.token).then(function (entity) {
            Userstore.get(entity).then(function (user) {
                var event = new ICalEvent();
                var startDate = new Date(req.params.start);
                var endDate = new Date(req.params.end);
                var filename = 'Absence' + startDate.toFormat('DDMMYY') + '-' + endDate.toFormat('DDMMYY');
                var hoursBetween = startDate.getHoursBetween(endDate);
                var halfDay = hoursBetween == 4;
                var prenoon = halfDay && parseInt(startDate.toFormat('HH')) < 12;
                var description = 'Absence ' + startDate.toFormat('DD/MM/YYYY');
                var summary = 'Absence';

                if (halfDay) {
                    description += prenoon ? ' prenoon' : ' Afternoon';
                    summary += prenoon ? ' prenoon' : ' Afternoon';
                }

                event.set('method', 'request');
                event.set('offset', new Date().getTimezoneOffset());
                event.set('status', 'confirmed');
                event.set('start', startDate);
                event.set('end', endDate);
                event.set('summary', summary);
                event.set('description', description);
                event.set('organizer', {
                    name: user.firstname + ' ' + user.lastname,
                    email: user.emails[0]
                });

                var icalFile = event.toFile();

                res.writeHead(200, {
                    'Content-Type': 'Application/octet-stream',
                    'Content-disposition': 'attachment; filename=' + filename + '.vcs'
                });
                res.end(icalFile);
            }).fail(function () {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.');
            });
        });
    });
};
