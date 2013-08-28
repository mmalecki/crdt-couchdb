# crdt-couchdb
A subclass of [`crdt`](https://github.com/dominictarr/crdt) which sources data
from CouchDB and updates them in real-time. It supports pre-fetching of views
and filtering of changes with CouchDB filters (using [`changes`](https://github.com/indexzero/changes)).

## Usage
```js
var Doc = require('crdt').Doc,
    CouchDBDoc = require('../').CouchDBDoc;

var dest = new Doc(),
    destStream = dest.createStream(),
    doc,
    docStream;

doc = new CouchDBDoc({
  url: 'http://localhost:5984/crdt',
  view: 'app/app',      // View you want to pre-fetch from (optional)
  filter: 'app/app',    // Filter you want to use for `_changes` feed (optional)
  map: function (doc) { // Map function (optional)
    emit(doc.subdomain, { host: doc.host });
  }
});
docStream = doc.createStream();

docStream.pipe(destStream).pipe(docStream);

doc.queryAndListen();

dest.on('row_update', function (row) {
  console.log('Update:');
  console.dir(row);
});

dest.on('create', function (row) {
  console.log('Create:');
  console.dir(row);
});
```
