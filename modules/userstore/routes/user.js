'use strict';

module.exports = function (app) {
    var UserService = require('../service');

    app.get('/userstore/users', function (req, res) {
        /*if (!req.body.hasOwnProperty('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }*/

        UserService.list().then(function (users) {
            res.json(users);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.post('/userstore/users', function (req, res) {
        var user;
        console.log('POST: ');
        console.log(req.body);
        user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            emails: req.body.emails
        };

        UserService.save(user).then(function () {
            console.log('user created');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(user);
    });

    app.get('/userstore/users/:id', function (req, res) {
        UserService.get(req.params.id).then(function (user) {
            res.json(user);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.put('/userstore/users/:id', function (req, res) {
        var user;
        console.log('PUT: ');
        console.log(req.body);
        user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            emails: req.body.emails
        };

        UserService.update(req.params.id, user).then(function () {
            console.log('user updated');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(user);
    });

    app.delete('/userstore/users/:id', function (req, res) {
        UserService.remove(req.params.id).then(function () {
            console.log('user removed');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
        return res.json();
    });
};