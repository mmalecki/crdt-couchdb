var util = require('util'),
    Doc = require('crdt').Doc,
    Changes = require('changes');

module.exports = function (options) {
};

var CouchDBDoc = module.exports.CouchDBDoc = function (options) {
  var self = this;

  Doc.call(self);

  var view = options.view && options.view.split('/'),
      opts;

  opts = {
    url: options.url,
    filter: options.filter,
    timeout: options.timeout
  };

  if (view) {
    opts.views = {
      all: {
        path: '_design/' + view[0] + '/_view/' + view[1],
        query: { include_docs: true }
      },
    };
  }

  console.dir(opts);
  self.changes = new Changes(opts);

  if (view) {
    self.changes.on('views:all', function (docs) {
      docs.forEach(function (doc) {
        self.set(doc.id, doc.doc);
      });
    });
  }

  self.changes.on('change', function (change) {
    if (change.id && change.doc) {
      if (change.deleted) {
        return self.rm(change.id);
      }

      self.set(change.id, change.doc);
    }
  });
};
util.inherits(CouchDBDoc, Doc);

CouchDBDoc.prototype.listen = function (callback) {
  this.changes.listen(callback);
};

CouchDBDoc.prototype.queryAndListen = function (callback) {
  this.changes.queryAndListen(callback);
};
