lineflux
========

*lineflux* is a client for the [line protocol](https://influxdb.com/docs/v0.9/write_protocols/write_syntax.html)
for InfluxDB time series database.


## Usage

```javascript

var os = require('os');

var metrics = require('lineflux')({
  url: 'http://localhost:8086',
  database: 'appname',
  // defaultTags are appended to every measurement
  defaultTags: {
     host: os.hostname()
  }
});

metrics('memory', {free: os.freemen()};

```
