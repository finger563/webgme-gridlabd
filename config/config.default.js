'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Authentication
config.authentication.enable = true;
config.authentication.allowGuests = false;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"]
config.seedProjects.defaultProject = "GridlabD"

config.client.log.level = 'info'

config.visualization.svgDirs = ["./src/svgs"] 

validateConfig(config);
module.exports = config;
