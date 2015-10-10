var Integer = require('./integer');

function escapeName(string){
  return string.replace(/[ ,=]/g, '\\$&');
}

function escapeString(string){
  return string.replace(/"/g, '\\"');
}

module.exports = function (measurement, tags, fields, ns){
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
