'use strict';
const html = require('./lib/html');
const co = require('co');
const fs = require('fs');

co(function*() {
  let str = yield html.format('http://test.gf.com.cn/portal/index');
  let data = yield html.analyze(str);
  // fs.writeFile('./domTree.json', JSON.stringify(data.tree, null, 2));
  // let original = fs.readFileSync('./domTree.json');
  // let diffPaths = html.diffTree(data.tree, JSON.parse(original));
  // console.dir(diffPaths);
}).catch(function(err) {
  console.error(err);
});
