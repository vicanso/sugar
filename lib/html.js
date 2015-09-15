'use strict';
const httpRequst = require('./request');
const html = require('html');
const cheerio = require('cheerio');
const _ = require('lodash');
const JsDiff = require('diff');

exports.format = format;
exports.analyze = analyze;
exports.diffTree = diffTree;
exports.getDiffHtml = getDiffHtml;
exports.getHtml = getHtml;
exports.getDiffView = getDiffView;

/**
 * [format 格式化html返回]
 * @param  {[type]} text [description]
 * @return {[type]}     [description]
 */
function format(text) {
  return html.prettyPrint(text, {
    indent_size: 2,
    max_char: 0
  });
}

/**
 * [get description]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
function* get(url) {
  let res = yield httpRequst.get(url);
  return res.text;
}

/**
 * [analyze 分析html]
 * @param  {[type]} text  [description]
 * @return {[type]}      [description]
 */
function analyze(text) {
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
      delete attr.title;
      delete attr.alt;
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
 * [getHtml description]
 * @param  {[type]} $  [description]
 * @param  {[type]} paths [description]
 * @return {[type]}       [description]
 */
function getHtml($, path) {
  let node = getNode($, path)
  return $.html(node, {
    decodeEntities: false
  });
}

/**
 * [getNode description]
 * @param  {[type]} $    [description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
function getNode($, path) {
  let result = $('html');
  _.forEach(path, function(index) {
    result = result.children().eq(index);
  });
  return result;
}

/**
 * [getDiffHtml description]
 * @param  {[type]} $ [description]
 * @param  {[type]} pathArr   [description]
 * @return {[type]}         [description]
 */
function getDiffHtml($, pathArr) {
  let htmlArr = [];
  _.forEach(pathArr, function(path) {
    htmlArr.push(getHtml($, path));
  });
  return htmlArr;
}


/**
 * [getDiffView description]
 * @param  {[type]} currentHtml  [description]
 * @param  {[type]} originalHtml [description]
 * @return {[type]}              [description]
 */
function getDiffView(currentHtml, originalHtml) {
  currentHtml = format(currentHtml);
  originalHtml = format(originalHtml);
  let $cur = cheerio.load(currentHtml);
  let $ori = cheerio.load(originalHtml);
  let currentAnalyze = analyze(currentHtml);
  let originalAnalyze = analyze(originalHtml);
  // 获取两个html的差异
  let diffPathArr = diffTree(currentAnalyze.tree, originalAnalyze.tree);
  // 找出差异dom中的html，确认哪一天有变化
  _.forEach(diffPathArr, function(path) {
    let curHtml = getHtml($cur, path);
    let oriHtml = getHtml($ori, path);
    let diffResult = JsDiff.diffLines(oriHtml, curHtml);


    let diffHtmlArr = _.map(diffResult, function(item) {
      if (item.added) {
        return '<JT-ADD>' + item.value + '</JT-ADD>';
      } else if (item.removed) {
        return '<JT-REMOVE>' + item.value + '</JT-REMOVE>';
      } else {
        return item.value;
      }
    });
    let dom = getNode($cur, path)[0];
    dom.type = 'directive';
    dom.data = diffHtmlArr.join('');
  });
  return $cur.html();
  // console.dir(diffPathArr);
  // console.dir(currentDoc.html());
}
