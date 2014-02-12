## Introduction

This is our timesheet service built to run on Node JS with Express, Angular, etc..

## Development guidelines

Required:
- Node.js
- Yeoman 1.0+ (Bower, Grunt, Yeoman)

1. Install node package => npm install
2. Run dev server => grunt debug

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
