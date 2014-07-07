Settings = new Meteor.Collection('settings');

Meteor.publish('settings', function() {
    return Settings.find();
})

// Tables
Tables = new Meteor.Collection('tables');

Meteor.publish('tables', function () {
  return Tables.find();
});

// Orders
Orders = new Meteor.Collection('orders');

Orders.allow({
    insert: function(userId, doc) {  
        var settings = Settings.findOne();
        var orderCount = settings.orderCount;
        doc.created = new Date().valueOf();   
        doc.number = ++orderCount;
        Settings.update(settings._id, {$set : {orderCount: orderCount}});
        return true; 
    },
    remove: function() {
        return true;
    }
}); 

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
    }
});  

Meteor.publish('orderedItems', function(order_id) {
    if (order_id) {
        return OrderedItems.find({order_id: order_id});
    } else {
        return OrderedItems.find({});
    }   
});

Meteor.publish('bestItems', function(table){
    var self = this;
    var items = OrderedItems.find({printed: true}).fetch();
    var count = _.countBy(items, function(item) {return item.item._id});
    var sort = [];
    for (var item in count) sort.push([item, count[item]]);
    sort.sort(function(a,b) {return b[1]-a[1]});
    sort.forEach(function(i) {
        var id = i[0];
        var item = OrderedItems.findOne({ "item._id" : id });
        self.added('bestItems', id, {item: item.item, count: i[1], renevue: i[1]*item.item.price} );
    });
    this.ready();
});

Meteor.methods({
    printOrder: function(order) {
        var items = OrderedItems.find({order_id: order._id});
        var table = Tables.findOne(order.table_id);
        var total = 0;
        var currency = null;
        var pb = new PrintBuilder;
        pb.addLn('order #' + order.number,  order._id );
        pb.addLn('table ' + table.name, moment(order.created).format('d.M.YYYY H:mm:ss'));
        pb.hr();
        items.forEach(function(item){
            var flavours = item.item.flavours;
            var fl = '';
            if (flavours) {
                fl = ' - ';
                flavours.forEach(function(flavour) {
                    fl = fl + flavour + ',';        
                });
                fl = fl.slice(0, -1);
            }
            pb.addLn(item.item.name + fl, ' ' + item.item.price + ',-');
            total = total + parseFloat(item.item.price);
            currency = item.item.currency;
        });
        pb.hr();
        pb.addLn('total sum', total + ',- ' + currency);
        var s = pb.build();
        console.log(s);
        Star.print(s, true);
        Orders.update(order._id, {$set: {printed: true}});
    }, 
    getSettings: function() {
      return { orderNum: Orders.counter };
    },
    setSettings: function(settings) {
      Orders.counter = settings.orderNum;
    }
});
