'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

config.server.port = 8081;

// Authentication
config.authentication.enable = true;
config.authentication.allowGuests = true;

// Plugins
config.plugin.allowServerExecution = true;
config.plugin.allowBrowserExecution = true;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"]
config.seedProjects.defaultProject = "guest+GridlabD"

config.requirejsPaths.gridlabd = "./src/common/"

config.client.log.level = 'info'

config.visualization.svgDirs = ["./src/svgs"] 

validateConfig(config);
module.exports = config;
