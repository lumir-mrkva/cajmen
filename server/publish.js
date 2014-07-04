// Tables
Tables = new Meteor.Collection('tables');

// Publish complete set of lists to all clients.
Meteor.publish('tables', function () {
  return Tables.find();
});


// Orders
Orders = new Meteor.Collection('orders');

Orders.counter = 0;

Orders.allow({
      insert: function(userId, doc) {   
         doc.created = new Date().valueOf();   
         doc.number = ++Orders.counter;
         return true; 
      },
      remove: function() {
          return true;
      }}); 

Meteor.publish('orders', function () {
  return Orders.find({});
});

//Menus
Menus = new Meteor.Collection('menus');

Meteor.publish('menus', function() {
    return Menus.find({});
});

//Items
Items = new Meteor.Collection('items');

Meteor.publish('items', function () {
  return Items.find({});
});

//OrderedItems
OrderedItems = new Meteor.Collection('orderedItems');

OrderedItems.allow({
      insert: function(userId, doc) {   
         doc.created = new Date().valueOf();   
         return true; 
      },
      update: function() {
          return true;
      },
      remove: function() {
          return true;
      }}); 

Meteor.publish('orderedItems', function(order_id) {
    check(order_id, String);
    return OrderedItems.find({order_id: order_id});
});

Meteor.methods({
    printOrder: function(order) {
        Orders.update(order._id, {$set: {printed: true}});
        var items = OrderedItems.find({order_id: order._id});
        var pb = new PrintBuilder;
        pb.addLn('order #' + order.number, '(' + order._id + ')');
        pb.addLn(' ', moment(order.created).format());
        pb.hr();
        items.forEach(function(item){
            var flavours = item.item.flavours;
            var fl = '';
            if (flavours) flavours.forEach(function(flavour) {
                fl = fl + ' - ' + flavour;        
            });
            pb.addLn(item.item.name + fl);
        })
        var s = pb.build();
        console.log(s);
        Star.print(s, true);
    }
});
