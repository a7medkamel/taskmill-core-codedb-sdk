"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , _               = require('lodash')
  , rp              = require('request-promise')
  , request         = require('request')
  , urljoin         = require('url-join')
  , errors          = require('request-promise/errors')
  , SizeLimitError  = require('./lib/error/size-limit')
  , NotFoundError   = require('./lib/error/not-found')
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

  return rp
          .post(urljoin(url || _.get(options, 'url'), '/blob'), { body, json : true, headers })
          .promise()
          .then((result) => {
            let ret = _.pick(result, 'content', 'manual', 'branch', 'path', 'stat', 'ast', 'markdown', 'block');

            ret.remote = result.repository.remote;
            // ret.private = result.repository.private;

            return ret;
          })
          .catch(errors.StatusCodeError, (reason) => {
            let { name, message } = (reason.error || {});

            if (name == 'BLOB_SIZE_ERROR') {
              throw new SizeLimitError(message);
            }

            throw new NotFoundError('not found');
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

function build(remote, options = {}) {
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

  return rp
          .post(urljoin(url || _.get(options, 'url'), '/build'), { body, headers, json : true })
          .promise();
}

module.exports = {
    blob
  , build
  , ls
  , pull
  , sha
  , archive
};
