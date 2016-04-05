'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Authentication
config.authentication.enable = false;
config.authentication.allowGuests = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"]
config.seedProjects.defaultProject = "guest+GridlabD"

config.requirejsPaths.rosmod = "./src/common/"

config.client.log.level = 'info'

config.visualization.svgDirs = ["./src/svgs"] 

validateConfig(config);
module.exports = config;
