var _ = require('lodash');
var request = require('request');
var dgram = require('dgram');

// Wrapper for integer values
function Integer (n){
  this.value = n|0;
  return this;
};

Integer.prototype.valueOf = function(){
  return this.value;
};

Integer.prototype.toString = function(){
  return this.value + 'i';
};


// Format line

function escapeName(string){
  return string.replace(/[ ,=]/g, '\\$&');
}

function escapeString(string){
  return string.replace(/"/g, '\\"');
}

function formatKey (measurement, tags){
  var result = '';
  result += escapeName(measurement);
  Object.keys(tags).sort().forEach(function(name){
    var value = tags[name].toString();
    result += ',' + escapeName(name) + '=' + escapeName(value);
  });
  return result;
}

function formatFields (fields){
  var result = '';
  Object.keys(fields).forEach(function(name){
    var rawvalue = fields[name];
    var value;

    if (typeof rawvalue === "number")
      value = rawvalue.toString();
    else if (typeof rawvalue === "string")
      value = '"' + escapeString(rawvalue) + '"';
    else if (rawvalue === true)
      value = 't';
    else if (rawvalue === false)
      value = 'f';
    else if (rawvalue instanceof Integer)
      value = rawvalue.toString();
    else
      throw new Error('Unknown value "' + rawvalue + '" for field ' + name);

    result += escapeName(name) + '=' + value;
  });
  return result;
}

function formatLine (measurement, tags, fields, ns){
  var result = '';

  result += formatKey(measurement, tags);
  result += ' ';
  result += formatFields(fields);
  if (ns !== undefined && ns !== null)
    result += ' ' + ns;

  return result;
}



function client (options, transport){

  // Normalize arguments
  options = _.defaults(options||{}, {
    prefix: '',
    defaultTags: {}
  });
  if (arguments.length < 2){
    transport = function(line){
      request({
        method: 'POST',
        uri: options.url + '/write',
        qs: {"db": options.database},
        body: line
      });
    };
  } else if (transport === 'udp'){
    var client = dgram.createSocket('udp4');
    transport = function(line){
      var message = new Buffer (line);
      client.send(message, 0, message.length, options.port || 8089, options.server);
    };
  }

  return function (measurement, values, tags, timestamp){
    tags = _.defaults(tags || {}, options.defaultTags);

    if (arguments.length < 4)
      timestamp = new Date() * 1000000;

    if (_.isNumber(values))
      values = {value: values};

    var message = formatLine(options.prefix+measurement, tags, values, timestamp);
    transport(message);
  };
};

client.Integer = Integer;

module.exports = client;
