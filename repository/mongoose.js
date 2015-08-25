var Promise = require('bluebird');
var mongoose = require('mongoose');

Promise.promisifyAll( mongoose );

module.exports = mongoose;