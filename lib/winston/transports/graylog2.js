var util = require('util'),
dgram = require('dgram'),
os = require('os'),
compress = require('compress-buffer').compress,
common = require('../common'),
syslog = require('../config/syslog-config'),
compress = require('compress-buffer').compress,
Transport = require('./transport').Transport;

syslogCodes = {
  debug: 7, 
  info: 6, 
  notice: 5, 
  warning: 4,
  error: 3, 
  crit: 2,
  alert: 1,
  emerg: 0
};

var Graylog2 = exports.Graylog2 = function (options) {
    Transport.call(this, options);  
    options     = options        || {};
    this.name   = 'Graylog2';
    this.host   = options.host   || 'localhost';
    this.port   = options.port   || 12201;
    this.level  = options.level  || 'info';
    this.client = dgram.createSocket("udp4");
    this.hostname = os.hostname();
  };

//
// Inherit from `winston.Transport`.
//
util.inherits(Graylog2, Transport);

Graylog2.prototype.log = function (level, msg, meta, callback) {

    if (this.silent) {
        return callback(null, true);
    }
    
    message = {
        version: '1.0',
        host: this.hostname,
        short_message: msg,
        timestamp: ((new Date()).getTime()/1000).toFixed(2),
        level: syslogCodes[level],
        facility: 'node-winston'
    }

    if (meta) {
        message["_meta"] = JSON.stringify(meta)
    } 

    msg = compress(new Buffer(JSON.stringify(message)))
    this.client.send(msg, 0, msg.length, this.port, this.host, console.log);
};

Graylog2.prototype.close = function () {
    this.client.close();
};
