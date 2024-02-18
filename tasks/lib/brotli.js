'use strict';

const fs = require('fs');
const zlib = require('zlib');
const step = require('h5.step');
const uglify = require('uglify-es');

const {options, files} = require(process.argv[2]);

step(
  function()
  {
    for (let i = 0; i < 4; ++i)
    {
      processNext(this.group());
    }
  },
  function(err)
  {
    fs.unlinkSync(process.argv[2]);

    if (err)
    {
      throw err;
    }
  }
);

function processNext(done)
{
  if (files.length === 0)
  {
    return done();
  }

  const file = files.shift();

  step(
    function()
    {
      fs.readFile(file.src, this.next());
    },
    function(err, uncompressed)
    {
      if (err)
      {
        return this.skip(err);
      }

      zlib.brotliCompress(uncompressed, options, this.next());
    },
    function(err, compressed)
    {
      if (err)
      {
        return this.skip(err);
      }

      fs.writeFile(file.dst + '.br', compressed, this.parallel());
    },
    function(err)
    {
      if (err)
      {
        done(err);
      }
      else
      {
        processNext(done);
      }
    }
  );
}
