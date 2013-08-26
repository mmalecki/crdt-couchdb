var Doc = require('crdt').Doc,
    CouchDBDoc = require('../').CouchDBDoc;

var dest = new Doc(),
    destStream = dest.createStream(),
    doc,
    docStream;

doc = new CouchDBDoc({
  url: 'http://localhost:5984/crdt',
  view: 'app/app',
  filter: 'app/app'
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
