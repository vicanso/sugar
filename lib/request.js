'use strict';
const request = require('superagent');
const _ = require('lodash');
const util = require('util');
const fs = require('fs');
exports.get = get;
exports.timeout = 10 * 1000;


/**
 * [get 请求数据]
 * @param  {[type]} url     [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
function* get(url, headers) {
  let req = request.get(url);
  _.forEach(headers, function(v, k) {
    req.set(k, v);
  });
  return yield handle(req);
}


/**
 * [handle description]
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
function* handle(req) {
  let res = {};
  let start = Date.now();
  try {
    res = yield new Promise(function(resolve, reject) {
      req.timeout(exports.timeout).end(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (err) {
    throw err;
  } finally {
    let statusCode = res.statusCode || 0;
    let length = _.get(res, 'headers.content-length') || _.get(res,
      'text.length') || 0;
    let use = Date.now() - start;
    let str = util.format('request "%s %s" %d %d %dms', req.method, req.url,
      statusCode, length, use);
    console.info(str);
  }
  return res;
}
