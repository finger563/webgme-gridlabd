
'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

config.server.port = 8082;

config.storage.keyType = 'rand160Bits';

// line router
config.client.defaultConnectionRouter = 'basic'

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
config.requirejsPaths.cola = "./node_modules/cola"
config.requirejsPaths.svgAssets = "./node_modules/webgme/src/client/assets"

config.client.log.level = 'info'

config.visualization.svgDirs.push("./src/svgs");

validateConfig(config);
module.exports = config;
