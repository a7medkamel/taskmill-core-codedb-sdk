"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , rp              = require('request-promise')
  , man             = require('taskmill-core-man')
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
  };

  return Promise
          .resolve(rp.post(urljoin(url || options.url, '/blob'), { body : body, json : true }))
          .then((result) => {
            return {
                content : result.content
              , manual  : man.get(result.content)
              , remote  : result.repository.remote
              , private : result.repository.private
              , branch  : result.branch
              , path    : result.path
            };
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