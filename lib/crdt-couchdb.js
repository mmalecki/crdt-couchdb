var util = require('util'),
    Doc = require('crdt').Doc,
    Changes = require('changes');

module.exports = function (options) {
  return new CouchDBDoc(options);
};

var CouchDBDoc = module.exports.CouchDBDoc = function (options) {
  var self = this;

  Doc.call(self);

  self.map = options.map;

  var view = options.view && options.view.split('/'),
      opts;

  opts = {
    url: options.url,
    timeout: options.timeout
  };

  if (typeof options.filter === 'function') {
    self.filter = options.filter;
  }
  else {
    opts.filter = options.filter;
  }

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

  function emit(id, doc) {
    self.set(id, doc);
  }

  if (self.filter) {
    docs = docs.filter(self.filter);
  }

  if (self.map) {
    docs.forEach(function (doc) {
      self.map(doc, emit);
    });
  }
  else {
    docs.forEach(function (doc) {
      emit(doc.id, doc.doc);
    });
  }
};

CouchDBDoc.prototype._onChange = function (change) {
  var self = this;

  function emit(id, doc) {
    if (change.deleted) {
      return self.rm(id);
    }

    self.set(id, doc);
  }

  if (!change.id || !change.doc) {
    return;
  }

  if (self.filter && !self.filter(change)) {
    return;
  }

  return self.map ? self.map(change, emit) : emit(change.id, change.doc);
};
