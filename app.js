'use strict';
const html = require('./lib/html');
const co = require('co');
const fs = require('fs');
const JsDiff = require('diff');
const _ = require('lodash');

co(function*() {
  let originalHtml = fs.readFileSync(
    './examples/original.html', 'utf8');
  let currentHtml = fs.readFileSync('./examples/index.html',
    'utf8');
  let result = html.getDiffView(currentHtml, originalHtml);
  result = _.escape(result).replace(/&lt;JT\-ADD&gt;/g,
    '<span class="add">').replace(/&lt;\/JT\-ADD&gt;/g, '</span>');
  fs.writeFile('./diff.html',
    '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style>.add{color:red}</style></head><body><pre>' +
    result +
    '</pre></body></html>');

  return;


  let currentData = {};
  currentData.html = html.format(fs.readFileSync('./examples/index.html',
    'utf8'));
  currentData.analyze = yield html.analyze(currentData.html);



  let originalData = {};
  originalData.html = html.format(fs.readFileSync(
    './examples/original.html', 'utf8'));
  originalData.analyze = yield html.analyze(originalData.html);

  let pathArr = html.diffTree(currentData.analyze.tree, originalData.analyze
    .tree);
  console.dir(pathArr);

  _.forEach(pathArr, function(path) {
    let curHtml = html.getHtml(currentData.html, path);
    let oriHtml = html.getHtml(originalData.html, path);
    let diffResult = JsDiff.diffLines(oriHtml, curHtml);
    // console.dir(curHtml);
    // console.dir(oriHtml);
    // console.dir(diffResult);
    let code = _.escape(currentData.html);
    _.forEach(diffResult, function(item) {
      if (item.added) {
        let v = _.escape(item.value);
        code = code.replace(v, '<span class="add">' + v + '</span>');
      }
    });
    fs.writeFile('./diff.html',
      '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style>.add{color:red}</style></head><body><pre>' +
      code +
      '</pre></body></html>');
    // console.dir(currentData.html);
    // console.dir(JsDiff.diffLines(curHtml, oriHtml));
  });


  fs.writeFile('./1.html', currentData.html);
  fs.writeFile('./2.html', originalData.html);



  // let testData = {};
  // testData.html = yield html.format('http://test.gf.com.cn/portal/index');
  // testData.analyze = yield html.analyze(testData.html);
  //
  // let storeData = {};
  // storeData.html = yield html.format('http://t1.gf.com.cn/portal/index');
  // storeData.analyze = yield html.analyze(storeData.html);
  //
  // let pathsArr = html.diffTree(storeData.analyze.tree, testData.analyze.tree);
  //
  // console.dir(pathsArr);
  // fs.writeFile('./1.html', html.getDiffHtml(testData.html, pathsArr).join(
  //   '\n'));
  // fs.writeFile('./2.html', html.getDiffHtml(storeData.html, pathsArr).join(
  //   '\n'));



  // let testDiffHtmlArr = html.getDiffHtml(testData.html, pathsArr);
  // console.dir(testDiffHtmlArr);

  // let str = fs.readFileSync('./examples/index.html', 'utf8');
  // let data = yield html.analyze(str);
  // // fs.writeFile('./domTree.json', JSON.stringify(data.tree, null, 2));
  // let original = fs.readFileSync('./domTree.json');
  // let pathsArr = html.diffTree(data.tree, JSON.parse(original));
  // let diffHtmlArr = html.getDiffHtml(str, pathsArr);
  // let originalHtml = fs.readFileSync('./examples/original.html', 'utf8');
  // let originalDiffHtmlArr = html.getDiffHtml(originalHtml, pathsArr);
  // let diff = JsDiff.diffLines(diffHtmlArr[0], originalDiffHtmlArr[0]);
  // // console.dir(str);
  // // console.dir('***************');
  // // console.dir(originalHtml);
  // console.dir(diffHtmlArr[0]);
  // console.dir(originalDiffHtmlArr[0]);
  // diff.forEach(function(part) {
  //   console.dir(part);
  // });
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
