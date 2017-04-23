"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , _               = require('lodash')
  , rp              = require('request-promise')
  , request         = require('request')
  , urljoin         = require('url-join')
  , errors          = require('request-promise/errors')
  ;

const url = config.has('codedb')? config.getUrl('codedb') : undefined;

function blob(remote, filename, options = {}) {
  let { branch, populate, token, bearer } = options;

  let body    = { remote, filename, token, branch, populate }
    , headers = {}
    ;

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/blob'), { body, json : true, headers }))
          .then((result) => {
            let ret = _.pick(result, 'content', 'manual', 'branch', 'path', 'repository');

            ret.remote = result.repository.remote;
            // ret.private = result.repository.private;

            return ret;
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function hotreload(remote, filename, content, options = {}) {
  let { branch, populate, token, bearer } = options;

  let body    = { remote, filename, content, token, branch, populate }
    , headers = {}
    ;

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/blob/hotreload'), { body, json : true, headers }))
          .then((result) => {
            let ret = _.pick(result, 'content', 'manual', 'branch', 'path', 'repository');

            ret.remote = result.repository.remote;
            // ret.private = result.repository.private;

            return ret;
          })
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function ls(remote, options = {}) {
  let { branch, populate, token, bearer } = options;

  let body    = { remote, token, branch, populate }
    , headers = {}
    ;

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/ls'), { body, json : true, headers }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function pull(remote, options = {}) {
  let { branch, populate, token, bearer } = options;

  let body    = { remote, token, branch, populate }
    , headers = {}
    ;

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/pull'), { body, json : true, headers }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function sha(remote, options = {}) {
  let { branch, token, bearer } = options;

  let body    = { remote, token, branch }
    , headers = {}
    ;

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/sha'), { body, json : true, headers }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function archive(remote, options = {}) {
  let { branch, make, token, bearer } = options;

  let body    = { remote, token, branch, make }
    , headers = {}
    ;

  if (options.ifnonematch) {
    headers['If-None-Match'] = options.ifnonematch    
  }

  if (bearer) {
    headers['Authorization'] = bearer;
  }

  return request({
              url     : urljoin(url || _.get(options, 'url'), '/archive')
            , method  : 'POST' 
            , body
            , headers
            , json    : true
          });
}

module.exports = {
    blob      : blob
  , hotreload : hotreload
  , ls        : ls
  , pull      : pull
  , sha       : sha
  , archive   : archive
};