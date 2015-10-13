'use strict';
const html = require('../lib/html');
const co = require('co');
const fs = require('fs');
const JsDiff = require('diff');
const _ = require('lodash');

co(function* () {
  let originalHtml = fs.readFileSync(
    './original.html', 'utf8');
  let currentHtml = fs.readFileSync('./index.html',
    'utf8');
  let result = html.getDiffView(currentHtml, originalHtml);
  fs.writeFile('./diff.html',
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style>.jtDiffAdd{color:green}.jtDiffRemove{color:red}</style></head><body><pre>' +
    result +
    '</pre></body></html>');

}).catch(function (err) {
  console.error(err.stack);
});
