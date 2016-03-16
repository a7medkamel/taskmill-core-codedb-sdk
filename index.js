"use strict";

var Promise         = require('bluebird')
  , config          = require('config-url')
  , rp              = require('request-promise')
  , man             = require('taskmill-core-man')
  , urljoin         = require('url-join')
  ;

const url = config.getUrl('codedb');

function blob(remote, filename, options) {
  let body = {
      remote          : remote
    , filename        : path
    , branch          : options.branch
    , token           : options.token
  };

  return Promise
          .resolve(rp.post(urljoin(url, '/blob'), { body : body, json : true }))
          .then((result) => {
            return {
                content : result.content
              , manual  : man.get(result.content)
              , remote  : result.repository.remote
              , private : result.repository.private
              , branch  : result.branch
              , path    : result.path
            };
          });
}

function ls(remote, options) {
  let body = {
      remote          : remote
    , token           : options.token
  };

  return Promise
          .resolve(rp.post(urljoin(url, '/ls'), { body : body, json : true }));
}

module.exports = {
    blob  : blob
  , ls    : ls
};