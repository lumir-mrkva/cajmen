// Tables
Tables = new Meteor.Collection('tables');

// Publish complete set of lists to all clients.
Meteor.publish('tables', function () {
  return Tables.find();
});


// Orders
Orders = new Meteor.Collection('orders');

// Publish all items for requested list_id.
Meteor.publish('orders', function (table_id) {
  check(table_id, String);
  return Todos.find({table_id: table_id});
});

Items = new Meteor.Collection('items');

Meteor.publish('items', function (item_id) {
  check(item_id, String);
  return Todos.find({item_id: item_id});
});
