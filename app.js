'use strict';
const html = require('./lib/html');
const co = require('co');
const fs = require('fs');
const JsDiff = require('diff');
// const prettydiff = require('prettydiff');

co(function*() {
  let str = fs.readFileSync('./examples/index.html', 'utf8');
  let data = yield html.analyze(str);
  // fs.writeFile('./domTree.json', JSON.stringify(data.tree, null, 2));
  let original = fs.readFileSync('./domTree.json');
  let pathsArr = html.diffTree(data.tree, JSON.parse(original));
  let diffHtmlArr = html.getDiffHtml(str, pathsArr);
  let originalHtml = fs.readFileSync('./examples/original.html', 'utf8');
  let originalDiffHtmlArr = html.getDiffHtml(originalHtml, pathsArr);
  let diff = JsDiff.diffLines(diffHtmlArr[0], originalDiffHtmlArr[0]);
  // console.dir(str);
  // console.dir('***************');
  // console.dir(originalHtml);
  console.dir(diffHtmlArr[0]);
  console.dir(originalDiffHtmlArr[0]);
  diff.forEach(function(part) {
    console.dir(part);
  });
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
