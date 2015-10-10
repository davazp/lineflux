var formatLine = require('./format-line');
var Integer = require('./integer');

function Client (options){
  this.options = options;
}

Client.prototype.Integer = Integer;

module.exports = Client;
