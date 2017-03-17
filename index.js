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

function blob(remote, filename, options) {
  let body = {
      remote          : remote
    , filename        : filename
    , branch          : options.branch
    , token           : options.token
    , populate        : options.populate
  };

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/blob'), { body : body, json : true }))
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

function hotreload(remote, filename, content, options) {
  let body = {
      remote          : remote
    , filename        : filename
    , content         : content
    , branch          : options.branch
    , token           : options.token
    , populate        : options.populate
  };

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/blob/hotreload'), { body : body, json : true }))
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

function ls(remote, options) {
  let body = {
      remote          : remote
    , token           : options.token
    , branch          : options.branch
    , populate        : options.populate
  };

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/ls'), { body : body, json : true }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function pull(remote, options) {
  let body = {
      remote          : remote
    , token           : options.token
    , branch          : options.branch
    , populate        : options.populate
  };

  return Promise
          .resolve(rp.post(urljoin(url || _.get(options, 'url'), '/pull'), { body : body, json : true }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

function archive(remote, options = {}) {
  let body = {
      remote          : remote
    , token           : options.token
    , branch          : options.branch
  };

  let headers = {};
  if (options.etag) {
    headers['If-None-Match'] = options.etag    
  }

  return request({
              url     : urljoin(url || _.get(options, 'url'), '/archive')
            , method  : 'POST' 
            , body    : body
            , headers : headers
            , json    : true
          });
}

module.exports = {
    blob      : blob
  , hotreload : hotreload
  , ls        : ls
  , pull      : pull
  , archive   : archive
};