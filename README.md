> **Warning**

> This project is experimental and not well supported.

# Scribe

[Scribe](http://scribeproject.github.io/) is a framework for crowdsourcing the transcription of text-based documents, particularly documents that are not well suited for Optical Character Recognition. It is a collaboration between [Zooniverse](https://www.zooniverse.org/) and [The New York Public Library Labs](http://labs.nypl.org/) with generous support from [The National Endowment for the Humanities (NEH), Office of Digital Humanities](http://www.neh.gov/divisions/odh).

This fork by the [Digital Humanities Lab at Utrecht University](https://dig.hum.uu.nl/) has additional functionality and updated dependencies and was worked on for the [CEMROL crowd-sourcing project](https://skillnet.nl/cemrol/).

## For Project Creators

Are you an organization or individual interested in using Scribe for your next crowdsourced transcription project? Start here!

* What is Scribe and is it for me? Read our [Scribe Primer](https://github.com/zooniverse/scribeAPI/wiki/Getting-started)
* Ready to set up your project? Head over to our [Project Setup page](https://github.com/zooniverse/scribeAPI/wiki/Setting-up-your-project)
* !! Use yarn instead of npm, this is needed by [rails/webpacker](https://github.com/rails/webpacker) !!

## For Contributors

Would you like to contribute to the codebase? Check out these technical resources about the Scribe framework and make your first pull request!

* [Terms and Keywords](https://github.com/zooniverse/scribeAPI/wiki/Terms-and-Keywords)
* Setting up your environment on [Mac OSX](https://github.com/zooniverse/scribeAPI/wiki/Setup-Mac-OSX), [Windows](https://github.com/zooniverse/scribeAPI/wiki/Setup-in-Windows-Vagrant), or [Unix](https://github.com/zooniverse/scribeAPI/wiki/Setup-Unix)
* [Data Model & Tools Config](https://github.com/zooniverse/scribeAPI/wiki/Data-Model-%26-Tools-Config)
* [Creating Custom Marking Tools](https://github.com/zooniverse/scribeAPI/wiki/Creating-Custom-Marking-Tools)
* [Setting up OAuth & Deploying](https://github.com/zooniverse/scribeAPI/wiki/Setting-up-OAuth-%26-Deploying)

## Example Projects

We are launching Scribe with three very different projects by [Zooniverse](https://www.zooniverse.org/) and [The New York Public Library](http://www.nypl.org/):

* [Emigrant City (NYPL)](http://emigrantcity.nypl.org)
* [Measuring the Anzacs (Zooniverse)](http://measuringtheanzacs.org)
* [Old Weather: Whaling (Zooniverse)](http://whaling.oldweather.org)

## Dependencies and Deployment

### Software versions

* Node versions greater than 10. You might need to [use n](https://github.com/tj/n) to install and activate a specific version of Node for development. It has been tested to work in production with Node 10 and development using Node 13.

* [Yarn](https://yarnpkg.com/) is required for [Webpacker](https://github.com/rails/webpacker).

### Code changes

* In `config/mongoid.yml` changed `sessions` to `clients` .
* In `app/models/classification.rb` changed `find_and_modify` method to `find_one_and_update` .

### Environment variables -- Development

This isn't really mentioned in the [ScribeAPI wiki](https://github.com/zooniverse/scribeAPI/wiki):

* Create a file in the root of the project called `.env` .
* Use `rake secret` to create a secret key.
* Add `DEVISE_SECRET_TOKEN=yournewkey` to `.env` .
* Repeat to add `SECRET_KEY_BASE_TOKEN=anothernewkey` to `.env` .
* To specify the name of the Mongo database you want to create, set `MONGO_DB=yourdbname` 
* If you're going to start up the Puma web server (see below), add `RACK_ENV=development` and `PORT=3000` 

Also add your OAUTH keys to `.env` as mentioned [in the wiki](https://github.com/zooniverse/scribeAPI/wiki/Setting-up-OAuth-%26-Deploying).

### Deployment to Heroku

After creating your Heroku app and database as described [in the wiki](https://github.com/zooniverse/scribeAPI/wiki/Setting-up-OAuth-%26-Deploying):

* Add `DEVISE_SECRET_TOKEN` and `SECRET_KEY_BASE_TOKEN` to Heroku's environment variables, eg: `heroku config:set "DEVISE_SECRET_TOKEN=yournewkey"` 
* Add your `MONGOLAB_URI` and OAUTH credentials as described in the wiki.

The information about buildpacks in the wiki is out of date. Ignore the section about `BUILDPACK_URL` but before you deploy to Heroku run the following commands:

* `heroku buildpacks:add --index 1 heroku/nodejs` 
* `heroku buildpacks:add --index 2 heroku/ruby` 

The index values are important as Node needs to be built first, otherwise the Ruby build will fail complaining about Browserify.

### Procfile

The original repo had a non-functional `procfile` -- capitalisation matters to Heroku, so I've renamed it `Procfile` . Heroku recommends running the [Puma web server](https://devcenter.heroku.com/articles/getting-started-with-rails4#webserver), so I've just followed their instructions on what to include in the `Procfile` . If you want to test the config in your development environment, make sure you set the `RACK_ENV` and `PORT` values in your `.env` file and then use Foreman -- `foreman start` .

