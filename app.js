'use strict';
const html = require('./lib/html');
const co = require('co');
const fs = require('fs');
const prettydiff = require('prettydiff');

co(function*() {
  let str = yield html.format('http://test.gf.com.cn/portal/index');
  let data = yield html.analyze(str);
  // fs.writeFile('./domTree.json', JSON.stringify(data.tree, null, 2));
  let original = fs.readFileSync('./domTree.json');
  let pathsArr = html.diffTree(data.tree, JSON.parse(original));
  let diffHtmlArr = html.getDiffHtml(str, pathsArr);
  let originalHtml = fs.readFileSync('./examples/original.html', 'utf8');
  let originalDiffHtmlArr = html.getDiffHtml(originalHtml, pathsArr);
  // console.dir(diffHtmlArr);
  // console.dir(originalDiffHtmlArr);
  let output = prettydiff.api({
    source: diffHtmlArr[0],
    diff: originalDiffHtmlArr[0],
    lang: 'html'
  });
  fs.writeFile('./a.html', output);
  console.dir(output);
}).catch(function(err) {
  console.error(err.stack);
});



// var prettydiff = require("prettydiff"),
//     args       = {
//         source: "asdf",
//         diff  : "asdd",
//         lang  : "text"
//     },
//     output     = prettydiff.api(args);
