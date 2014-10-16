## Introduction

This is our timesheet service built to run on Node JS with Express, Angular, etc..

## Development guidelines

Required:
- Node.js
- Yeoman 1.0+ (Bower, Grunt, Yeoman)

1. Install node package => npm install
2. Run dev server => grunt debug

Debugging:

First install node-inspector (web debugger): npm install node-inspector -g

We have a number of npm scripts that you can use:
1. npm run-script test (runs grunt test task in debug)
2. npm run-script testspecific (runs grunt testspecific task in debug)
3. npm run-script web (runs express server (port 3000) in debug)

The web node-inspector should start in your default browser.

## Deployment guidelines

Required:
- Heroku account

1. heroku login (Login with you heroku account)
2. heroku create (Create an heroku app)
3. git push heroku master (Push/Deploy you master branch to heroku)

Common issues:
- 'Permission denied (publickey). fatal: Could not read from remote repository.'
-- Create an rsa key => ssh-keygen -t rsa (optional)
-- Register your rsa key with Heroku => heroku keys:add
