'use strict';
const httpRequst = require('./request');
const html = require('html');
const cheerio = require('cheerio');
const _ = require('lodash');

exports.format = format;
exports.analyze = analyze;
exports.diffTree = diffTree;
exports.getDiffHtml = getDiffHtml;

/**
 * [format 格式化html返回]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
function* format(url) {
  let res = yield httpRequst.get(url);
  if (!res.text) {
    return;
  }
  return html.prettyPrint(res.text);
}

/**
 * [analyze 分析html]
 * @param  {[type]} url  [description]
 * @return {[type]}      [description]
 */
function* analyze(url) {
  let text = url;
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    let res = yield httpRequst.get(url);
    text = res.text;
  }
  let $ = cheerio.load(text);
  let domTree = {
    type: 'html',
    children: []
  };

  let analyzeData = {
    link: 0,
    script: 0,
    img: 0,
    total: 0,
    tree: domTree
  };

  function loop(domList, arr) {
    // 是否全部一样
    let isSame = true;
    let prevDomDesc;

    _.forEach(domList, function(dom, i) {
      let name = dom.name;
      if (!_.isUndefined(analyzeData[name])) {
        analyzeData[name]++;
      }
      analyzeData.total++;


      let tmp = _.pick(dom, 'type name'.split(' '));
      let attr = JSON.stringify(dom.attribs);
      if (attr !== '{}') {
        tmp.attr = attr;
      }
      arr.push(tmp);
      if (!prevDomDesc) {
        prevDomDesc = JSON.stringify(tmp);
      } else if (isSame) {
        isSame = prevDomDesc === JSON.stringify(tmp);
      }

      dom = $(dom);
      let domChildren = dom.children();
      if (domChildren.length) {
        tmp.children = [];
        let isChildrenSame = loop(domChildren, tmp.children);
        isSame = isSame && isChildrenSame;
      }
    });
    if (isSame && arr.length > 1) {
      arr.length = 1;
    }
    return isSame;
  }
  loop($('html').children(), domTree.children);
  return analyzeData;
}

/**
 * [diffTree description]
 * @param  {[type]} currentTree  [description]
 * @param  {[type]} originalTree [description]
 * @return {[type]}              [description]
 */
function diffTree(currentTree, originalTree) {
  let paths = [];
  let diffPaths = [];

  function loop(cur, ori, paths) {
    _.forEach(cur, function(v, k) {
      if (k !== 'children') {
        if (v !== ori[k]) {
          diffPaths.push(paths);
        }
      }
    });

    if ((cur.children && !ori.children) || (!cur.children && ori.children)) {
      // 原来的dom tree有children，新的没有, 原来的dom tree没有children，新的有
      diffPaths.push(paths);
    } else if (cur.children && ori.children) {
      if (cur.children.length !== ori.children.length) {
        diffPaths.push(paths);
      } else {
        _.forEach(cur.children, function(tmp, i) {
          let tmpPaths = _.clone(paths);
          tmpPaths.push(i);
          loop(tmp, ori.children[i], tmpPaths);
        });
      }
    }
  }
  loop(currentTree, originalTree, paths);
  return diffPaths;
}

/**
 * [getDiffHtml description]
 * @param  {[type]} text [description]
 * @param  {[type]} pathsArr   [description]
 * @return {[type]}         [description]
 */
function getDiffHtml(text, pathsArr) {
  let htmlArr = [];
  _.forEach(pathsArr, function(paths) {
    let $ = cheerio.load(text);
    let result = $('html');
    _.forEach(paths, function(index) {
      result = result.children().eq(index);
    });
    htmlArr.push(result.html());
  });
  return htmlArr;
}
