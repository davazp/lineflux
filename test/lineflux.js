var chai = require('chai').should();
var lineflux = require('..');


function mock(options){
  var lastResult;
  var lf = lineflux(options, function(){}, function(line){ lastResult = line; });
  return function(){
    lf.apply(null, arguments);
    return lastResult;
  };
}


describe('Line Protocol Format', function(){
  var msg = mock();

  it('should be correct for basic cases', function(){
    msg('t', {value: 1}, {m: 'h'}, 0).should.be.equal('t,m=h value=1 0');
  });

  it('should allow measurement names with dots', function(){
    msg('a.b', {v: 1}, {}, 0).should.be.equal('a.b v=1 0');
    msg('a.b.', {v: 1}, {}, 0).should.be.equal('a.b. v=1 0');
    msg('.a.b', {v: 1}, {}, 0).should.be.equal('.a.b v=1 0');
  });

  it('should escape measurement names', function(){
    msg('a,b', {v: 1}, {}, 0).should.be.equal('a\\,b v=1 0');
    msg('a=b', {v: 1}, {}, 0).should.be.equal('a\\=b v=1 0');
    msg('a b', {v: 1}, {}, 0).should.be.equal('a\\ b v=1 0');
    msg(' ab', {v: 1}, {}, 0).should.be.equal('\\ ab v=1 0');
    msg('ab ', {v: 1}, {}, 0).should.be.equal('ab\\  v=1 0');
    msg(' ab ', {v: 1}, {}, 0).should.be.equal('\\ ab\\  v=1 0');
    msg('   ', {v: 1}, {}, 0).should.be.equal('\\ \\ \\  v=1 0');
  });


  it('should escape tag names', function(){
    msg('m', {v:1}, {'a,b': 1}, 0).should.be.equal('m,a\\,b=1 v=1 0');
    msg('m', {v:1}, {'a=b': 1}, 0).should.be.equal('m,a\\=b=1 v=1 0');
    msg('m', {v:1}, {'a b': 1}, 0).should.be.equal('m,a\\ b=1 v=1 0');
    msg('m', {v:1}, {' ab': 1}, 0).should.be.equal('m,\\ ab=1 v=1 0');
    msg('m', {v:1}, {'ab ': 1}, 0).should.be.equal('m,ab\\ =1 v=1 0');
    msg('m', {v:1}, {' ab ': 1}, 0).should.be.equal('m,\\ ab\\ =1 v=1 0');
    msg('m', {v:1}, {'   ': 1}, 0).should.be.equal('m,\\ \\ \\ =1 v=1 0');
  });


  it('should escape tag values', function(){
    msg('m', {v:1}, {'t': 'a,b'}, 0).should.be.equal('m,t=a\\,b v=1 0');
    msg('m', {v:1}, {'t': 'a=b'}, 0).should.be.equal('m,t=a\\=b v=1 0');
    msg('m', {v:1}, {'t': 'a b'}, 0).should.be.equal('m,t=a\\ b v=1 0');
    msg('m', {v:1}, {'t': ' ab'}, 0).should.be.equal('m,t=\\ ab v=1 0');
    msg('m', {v:1}, {'t': 'ab '}, 0).should.be.equal('m,t=ab\\  v=1 0');
    msg('m', {v:1}, {'t': ' ab '}, 0).should.be.equal('m,t=\\ ab\\  v=1 0');
    msg('m', {v:1}, {'t': '   '}, 0).should.be.equal('m,t=\\ \\ \\  v=1 0');
  });

  it('tags should be lexicographically sorted', function(){
    var tags = {z: 0, a: 0, b: 0, c: 0, y: 0, x: 0};
    msg('m', {v:1}, tags, 0).should.be.equal('m,a=0,b=0,c=0,x=0,y=0,z=0 v=1 0');
  });

  it('should escape field names', function(){
    msg('m', {'a,b': 1}, {}, 0).should.be.equal('m a\\,b=1 0');
    msg('m', {'a=b': 1}, {}, 0).should.be.equal('m a\\=b=1 0');
    msg('m', {'a b': 1}, {}, 0).should.be.equal('m a\\ b=1 0');
    msg('m', {' ab': 1}, {}, 0).should.be.equal('m \\ ab=1 0');
    msg('m', {'ab ': 1}, {}, 0).should.be.equal('m ab\\ =1 0');
    msg('m', {' ab ': 1}, {}, 0).should.be.equal('m \\ ab\\ =1 0');
    msg('m', {'   ': 1}, {}, 0).should.be.equal('m \\ \\ \\ =1 0');
  });

  it('should format integer field values', function(){
    msg('m', {'v': new lineflux.Integer(1)}, {}, 0).should.be.equal('m v=1i 0');
    msg('m', {'v': new lineflux.Integer(0)}, {}, 0).should.be.equal('m v=0i 0');
    msg('m', {'v': new lineflux.Integer(-1)}, {}, 0).should.be.equal('m v=-1i 0');
  });

  it('should format float field values', function(){
    msg('m', {'v': 1}, {}, 0).should.be.equal('m v=1 0');
    msg('m', {'v': 0}, {}, 0).should.be.equal('m v=0 0');
    msg('m', {'v': -1}, {}, 0).should.be.equal('m v=-1 0');
    msg('m', {'v': 1.2}, {}, 0).should.be.equal('m v=1.2 0');
    msg('m', {'v': -1.2}, {}, 0).should.be.equal('m v=-1.2 0');
  });

  it('should format boolean field values', function(){
    msg('m', {'v': true}, {}, 0).should.be.equal('m v=t 0');
    msg('m', {'v': false}, {}, 0).should.be.equal('m v=f 0');
  });

  it('should format string field values', function(){
    msg('m', {'v': ''}, {}, 0).should.be.equal('m v="" 0');
    msg('m', {'v': 'f'}, {}, 0).should.be.equal('m v="f" 0');
    msg('m', {'v': 't'}, {}, 0).should.be.equal('m v="t" 0');
    msg('m', {'v': '0'}, {}, 0).should.be.equal('m v="0" 0');
    msg('m', {'v': ' '}, {}, 0).should.be.equal('m v=" " 0');
    msg('m', {'v': '"'}, {}, 0).should.be.equal('m v="\\"" 0');
    msg('m', {'v': '\\"'}, {}, 0).should.be.equal('m v="\\\\"" 0');
  });

  it('numeric values should be assigned to the "values" field', function(){
    msg('m',  0, {}, 0).should.be.equal('m value=0 0');
    msg('m', -1, {}, 0).should.be.equal('m value=-1 0');
    msg('m', +1, {}, 0).should.be.equal('m value=1 0');
  });

  it('should include timestamp if it is provided', function(){
    msg('m', {'v': 1}, {}, 0).should.be.equal('m v=1 0');
    msg('m', {'v': 1}, {}, 1).should.be.equal('m v=1 1');

    var ns = new Date() * 1000000;
    msg('m', {'v': 1}, {}, ns).should.be.equal('m v=1 ' + ns);
  });

  it('should omit timestamp if it is null or undefined', function(){
    msg('m', {'v': 1}, {}, null).should.be.equal('m v=1');
    msg('m', {'v': 1}, {}, undefined).should.be.equal('m v=1');
  });

});


describe('Initialization', function(){

  it('should set default tags for all the measurements', function(){
    var msg = mock({defaultTags: {machine: 'gauss'}});
    msg('test', {value: 10}, {}, null).should.be.equal('test,machine=gauss value=10');
  });

  it('should set a prefix for all the measurements', function(){
    var msg = mock({prefix: 'app.'});
    msg('test', {v: 0}, {}, null).should.be.equal('app.test v=0');
  });

});
