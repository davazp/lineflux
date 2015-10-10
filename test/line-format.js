var chai = require('chai').should();
var fl = require('../lib/format-line');
var Integer = require('../lib/integer');

describe('Line Protocol Format', function(){

  it('should be correct for basic cases', function(){
    fl('t', {m: 'h'}, {value: 1}, 0).should.be.equal('t,m=h value=1 0');
  });

  it('should allow measurement names with dots', function(){
    fl('a.b', {}, {v: 1}, 0).should.be.equal('a.b v=1 0');
    fl('a.b.', {}, {v: 1}, 0).should.be.equal('a.b. v=1 0');
    fl('.a.b', {}, {v: 1}, 0).should.be.equal('.a.b v=1 0');
  });

  it('should escape measurement names', function(){
    fl('a,b', {}, {v: 1}, 0).should.be.equal('a\\,b v=1 0');
    fl('a=b', {}, {v: 1}, 0).should.be.equal('a\\=b v=1 0');
    fl('a b', {}, {v: 1}, 0).should.be.equal('a\\ b v=1 0');
    fl(' ab', {}, {v: 1}, 0).should.be.equal('\\ ab v=1 0');
    fl('ab ', {}, {v: 1}, 0).should.be.equal('ab\\  v=1 0');
    fl(' ab ', {}, {v: 1}, 0).should.be.equal('\\ ab\\  v=1 0');
    fl('   ', {}, {v: 1}, 0).should.be.equal('\\ \\ \\  v=1 0');
  });


  it('should escape tag names', function(){
    fl('m', {'a,b': 1}, {v:1}, 0).should.be.equal('m,a\\,b=1 v=1 0'); 
    fl('m', {'a=b': 1}, {v:1}, 0).should.be.equal('m,a\\=b=1 v=1 0'); 
    fl('m', {'a b': 1}, {v:1}, 0).should.be.equal('m,a\\ b=1 v=1 0');
    fl('m', {' ab': 1}, {v:1}, 0).should.be.equal('m,\\ ab=1 v=1 0');
    fl('m', {'ab ': 1}, {v:1}, 0).should.be.equal('m,ab\\ =1 v=1 0');
    fl('m', {' ab ': 1}, {v:1}, 0).should.be.equal('m,\\ ab\\ =1 v=1 0');
    fl('m', {'   ': 1}, {v:1}, 0).should.be.equal('m,\\ \\ \\ =1 v=1 0');
  });


  it('should escape tag values', function(){
    fl('m', {'t': 'a,b'}, {v:1}, 0).should.be.equal('m,t=a\\,b v=1 0');
    fl('m', {'t': 'a=b'}, {v:1}, 0).should.be.equal('m,t=a\\=b v=1 0');
    fl('m', {'t': 'a b'}, {v:1}, 0).should.be.equal('m,t=a\\ b v=1 0');
    fl('m', {'t': ' ab'}, {v:1}, 0).should.be.equal('m,t=\\ ab v=1 0');
    fl('m', {'t': 'ab '}, {v:1}, 0).should.be.equal('m,t=ab\\  v=1 0');
    fl('m', {'t': ' ab '}, {v:1}, 0).should.be.equal('m,t=\\ ab\\  v=1 0');
    fl('m', {'t': '   '}, {v:1}, 0).should.be.equal('m,t=\\ \\ \\  v=1 0');
  });

  it('should escape field names', function(){
    fl('m', {}, {'a,b': 1}, 0).should.be.equal('m a\\,b=1 0');
    fl('m', {}, {'a=b': 1}, 0).should.be.equal('m a\\=b=1 0');
    fl('m', {}, {'a b': 1}, 0).should.be.equal('m a\\ b=1 0');
    fl('m', {}, {' ab': 1}, 0).should.be.equal('m \\ ab=1 0');
    fl('m', {}, {'ab ': 1}, 0).should.be.equal('m ab\\ =1 0');
    fl('m', {}, {' ab ': 1}, 0).should.be.equal('m \\ ab\\ =1 0');
    fl('m', {}, {'   ': 1}, 0).should.be.equal('m \\ \\ \\ =1 0');
  });

  it('should format integer field values', function(){
    fl('m', {}, {'v': new Integer(1)}, 0).should.be.equal('m v=1i 0');
    fl('m', {}, {'v': new Integer(0)}, 0).should.be.equal('m v=0i 0');
    fl('m', {}, {'v': new Integer(-1)}, 0).should.be.equal('m v=-1i 0');
  });

  it('should format float field values', function(){
    fl('m', {}, {'v': 1}, 0).should.be.equal('m v=1 0');
    fl('m', {}, {'v': 0}, 0).should.be.equal('m v=0 0');
    fl('m', {}, {'v': -1}, 0).should.be.equal('m v=-1 0');
    fl('m', {}, {'v': 1.2}, 0).should.be.equal('m v=1.2 0');
    fl('m', {}, {'v': -1.2}, 0).should.be.equal('m v=-1.2 0');
  });

  it('should format boolean field values', function(){
    fl('m', {}, {'v': true}, 0).should.be.equal('m v=t 0');
    fl('m', {}, {'v': false}, 0).should.be.equal('m v=f 0');
  });

  it('should format string field values', function(){
    fl('m', {}, {'v': ''}, 0).should.be.equal('m v="" 0');
    fl('m', {}, {'v': 'f'}, 0).should.be.equal('m v="f" 0');
    fl('m', {}, {'v': 't'}, 0).should.be.equal('m v="t" 0');
    fl('m', {}, {'v': '0'}, 0).should.be.equal('m v="0" 0');
    fl('m', {}, {'v': ' '}, 0).should.be.equal('m v=" " 0');
    fl('m', {}, {'v': '"'}, 0).should.be.equal('m v="\\"" 0');
    fl('m', {}, {'v': '\\"'}, 0).should.be.equal('m v="\\\\"" 0');
  });

  it('should include timestamp if it is provided', function(){
    fl('m', {}, {'v': 1}, 0).should.be.equal('m v=1 0');
    fl('m', {}, {'v': 1}, 1).should.be.equal('m v=1 1');
    
    var ns = new Date() * 1000000;
    fl('m', {}, {'v': 1}, ns).should.be.equal('m v=1 ' + ns);
  });

  it('should omit timestamp if it is not provided', function(){
    fl('m', {}, {'v': 1}).should.be.equal('m v=1');
    fl('m', {}, {'v': 1}, null).should.be.equal('m v=1');
    fl('m', {}, {'v': 1}, undefined).should.be.equal('m v=1');
  });

});
