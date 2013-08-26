var util = require('util'),
    Doc = require('crdt').Doc,
    Changes = require('changes');

module.exports = function (options) {
};

var CouchDBDoc = module.exports.CouchDBDoc = function (options) {
  var self = this;

  Doc.call(self);

  self.map = options.map;

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

  self.changes = new Changes(opts);

  if (view) {
    self.changes.on('views:all', self._onView.bind(self));
  }

  self.changes.on('change', self._onChange.bind(self));
};
util.inherits(CouchDBDoc, Doc);

CouchDBDoc.prototype.listen = function (callback) {
  this.changes.listen(callback);
};

CouchDBDoc.prototype.queryAndListen = function (callback) {
  this.changes.queryAndListen(callback);
};

CouchDBDoc.prototype._onView = function (docs) {
  var self = this;

  function set(doc) {
    self.set(doc.id, doc.doc);
  }

  if (self.map) {
    docs.map(self.map).forEach(set);
  }
  else {
    docs.forEach(set);
  }
};

CouchDBDoc.prototype._onChange = function (change) {
  var self = this;

  if (!change.id || !change.doc) {
    return;
  }

  change = self.map ? self.map(change) : change;
  if (change.deleted) {
    return self.rm(change.id);
  }

  self.set(change.id, change.doc);
};
