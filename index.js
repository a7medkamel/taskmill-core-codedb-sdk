"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , _               = require('lodash')
  , rp              = require('request-promise')
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
          .resolve(rp.post(urljoin(url || options.url, '/blob'), { body : body, json : true }))
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
          .resolve(rp.post(urljoin(url || options.url, '/ls'), { body : body, json : true }))
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
          .resolve(rp.post(urljoin(url || options.url, '/pull'), { body : body, json : true }))
          .catch(errors.StatusCodeError, (err) => {
            throw new Error('not found');
          });
}

module.exports = {
    blob  : blob
  , ls    : ls
  , pull  : pull
};