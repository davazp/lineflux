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
  return Object.keys(fields).map(function(name){
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

    return escapeName(name) + '=' + value;

  }).join(',');
}


function HTTPTransport (options){
  return function(line){
    request({
      method: 'POST',
      uri: options.url + '/write',
      qs: {"db": options.database},
      body: line
    });
  };
}

function UDPTransport (options){
  var client = dgram.createSocket('udp4');
  return function(line){
    var message = new Buffer (line);
    client.send(message, 0, message.length, options.port || 8089, options.server);
  };
}


function collect (value, acc){
  acc = acc || [];
  acc.push(value);
  return acc;
}



function client (options, transport, aggregateFunction){
  // Normalize arguments
  options = _.defaults(options||{}, {
    prefix: '',
    flushInterval: 10000,
    defaultTags: {}
  });
  if (arguments.length < 2)
    transport = HTTPTransport(options);
  else if (transport === 'udp')
    transport = UDPTransport(options);

  if (arguments.length < 3)
    aggregateFunction = collect;


  var aggregates = {};

  function flush () {
    Object.keys(aggregates).forEach(function(k){
      aggregates[k].forEach(transport);
    });
  }
  setInterval(flush, options.flushInterval);

  return function (measurement, values, tags, timestamp){
    tags = _.defaults(tags || {}, options.defaultTags);

    if (arguments.length < 4)
      timestamp = new Date() * 1000000;

    if (_.isNumber(values))
      values = {value: values};

    var message = '';
    var key = formatKey(options.prefix+measurement, tags);

    message += key;
    message += ' ';
    message += formatFields(values);
    if (timestamp !== undefined && timestamp !== null)
      message += ' ' + timestamp;

    aggregates['m-'+key] = aggregateFunction(message, aggregates['m-'+key]);
  };
};

client.Integer = Integer;

module.exports = client;
