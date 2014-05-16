// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Tables.find().count() === 0) {
    var data = [ "Nejakej stul", "Druhej Stul", "Dalsi stul" ];

    var timestamp = (new Date()).getTime();

    for (var i = 0; i < data.length; i++) {
      Tables.insert({name: data[i]});
    }
  }
});
