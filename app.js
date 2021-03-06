'use strict';
const html = require('./lib/html');
const co = require('co');
const fs = require('fs');
const _ = require('lodash');

co(function* () {
  let testHtml = yield html.get('http://test.gf.com.cn/portal/index');
  let t1Html = yield html.get('http://t1.gf.com.cn/portal/index');
  // fs.writeFile('./test.html', html.format(testHtml));
  // fs.writeFile('./t1.html', html.format(t1Html));
  let result = html.getDiffView(testHtml, t1Html);
  fs.writeFile('./diff.html',
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style>.jtDiffAdd{color:green}.jtDiffRemove{color:red}</style></head><body><pre>' +
    result +
    '</pre></body></html>');

}).catch(function (err) {
  console.error(err.stack);
});
