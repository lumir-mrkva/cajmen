// Tables
Tables = new Meteor.Collection('tables');

// Publish complete set of lists to all clients.
Meteor.publish('tables', function () {
  return Tables.find();
});


// Orders
Orders = new Meteor.Collection('orders');

Meteor.publish('orders', function (table_id) {
  check(table_id, String);
  return Orders.find({table_id: table_id});
});

//Items
Items = new Meteor.Collection('items');

Meteor.publish('items', function () {
  return Items.find({});
});

//OrderedItems
OrderedItems = new Meteor.Collection('orderedItems');

Meteor.publish('orderedItems', function(order_id) {
    return OrderedItems.find({order_id: order_id});
});
