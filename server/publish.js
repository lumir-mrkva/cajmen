// Tables
Tables = new Meteor.Collection('tables');

// Publish complete set of lists to all clients.
Meteor.publish('tables', function () {
  return Tables.find();
});


// Orders
Orders = new Meteor.Collection('orders');

Orders.allow({
      insert: function(userId, doc) {   
         doc.created = new Date().valueOf();   
         return true; 
      }}); 

Meteor.publish('orders', function () {
  return Orders.find({});
});

//Items
Items = new Meteor.Collection('items');

Meteor.publish('items', function () {
  return Items.find({});
});

//OrderedItems
OrderedItems = new Meteor.Collection('orderedItems');

Meteor.publish('orderedItems', function(order_id) {
    check(order_id, String);
    return OrderedItems.find({order_id: order_id});
});
