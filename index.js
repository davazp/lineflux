var _ = require('lodash');


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

function formatLine (measurement, tags, fields, ns){
  var result = '';

  result += escapeName(measurement);

  Object.keys(tags).sort().forEach(function(name){
    var value = tags[name].toString();
    result += ',' + escapeName(name) + '=' + escapeName(value);
  });

  result += ' ';

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

  if (ns !== undefined && ns !== null)
    result += ' ' + ns;

  return result;
};



function Client (options, transport){
  if (arguments.length < 2){
    transport = function(line){
      return line;
    };
  }
  this.options = options;
  this.transport = transport;
}

Client.prototype.Integer = Integer;

Client.prototype.write = function(measurement, values, tags, timestamp){
  tags = _.defaults(tags || {}, this.options.defaultTags);

  if (arguments.length < 4)
    timestamp = new Date() * 1000000;
  
  var message = formatLine(measurement, tags, values, timestamp);
  this.transport(message);
};


module.exports = function(options, transport){
  return new Client(options, transport);
};
