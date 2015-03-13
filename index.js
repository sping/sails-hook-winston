'use strict';

var winston = require('winston');
var path = require('path');
var mkdirp = require('mkdirp');
var captain = require(path.resolve('node_modules/sails/node_modules/captains-log'));
var buildShipFn = require(path.resolve('node_modules/sails/lib/hooks/logger/ship'));

module.exports = function(sails) {
  return {
    ready: false,
    initialize: function(done){
      var log, logger, consoleOptions;

      consoleOptions = {
        level: sails.config.log.level,
        formatter: function(options) {
          var message;
          if (sails.config.log.timestamp){
            message = Date();
            message += ' ';
          } else  {
            message = '';
          }
          message += (undefined !== options.message ? options.message : '');
          message += (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
          return message;
        }
      };

      // Console Transport
      logger = new winston.Logger({transports: [ new winston.transports.Console(consoleOptions)]});

      // DailyRotateFile Transport
      if (sails.config.log.dailyRotate) {
        mkdirp.sync(sails.config.log.dailyRotate.dirname);
        logger.add(winston.transports.DailyRotateFile, (sails.config.log.dailyRotate));
      }

      // MongoDB Transport
      if (sails.config.log.mongoDB) {
        logger.add(require('winston-mongodb').MongoDB, sails.config.log.mongoDB);
      }

      sails.config.log.custom = logger;

      log = captain(sails.config.log);
      log.ship = buildShipFn(sails.version ?('v' + sails.version) :'', log.info );
      sails.log = log;
      return done();
    }
  };
};
