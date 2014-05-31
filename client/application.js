Tables = new Meteor.Collection("tables");
Orders = new Meteor.Collection("orders");
Items = new Meteor.Collection('items');
OrderedItems = new Meteor.Collection('orderedItems');


Template.tables.tables = function () {
  return Tables.find({}, {sort: {name: 1}});
};

var tablesHandle = Meteor.subscribe('tables');
var itemsHandle = Meteor.subscribe('items');
var ordersHande = Meteor.subscribe('orders');

// Tables

Template.tables.loading = function () {
  return !tablesHandle.ready();
};


Template.tables.events(okCancelEvents(
  '#new-table',
  {
    ok: function (text, evt) {
      var id = Tables.insert({name: text});
      evt.target.value = "";
    }
  }));


// Items

Template.items.items = function() {
    return Items.find({});
};

Template.items.events = {
    'click #add': function() {
        Items.insert({name: $('#name').val(), price: $('#price').val()});
    },
    'click #delete': function() {
        Items.remove(this._id);
    }
};

Template.table.events = {
    'click #new': function newOrder() {
        var order = Orders.insert({table_id: this.table._id});        
        Router.go('order', {_id: order});
    },
    'click #remove': function removeTable() {
        if(confirm('Really delete this table?')) {
            Tables.remove(this.table._id);
            Router.go('tables');
        }
    }
};

Template.order.events = {
    'click #add': function addItem(e, template) {
        OrderedItems.insert({order_id: template.data.order._id, item: this });

    },
    'click #remove': function removeItem() {
        OrderedItems.remove(this._id); 
    },
    'click #print': function printOrder() {
        var printItems = OrderedItems.find({order_id: this.order._id, printed: {$ne: true}});
        printItems.forEach(function (item) {
             OrderedItems.update(item._id, {$set: {printed: true}});
        });
        console.log(printItems);
    },
    'click #removeOrder': function removeOrder() {
        Orders.remove(this.order._id);
        Router.go('table', {_id: this.order.table_id});
    }
};

Template.order.sum = function() {
    var sum = 0;
    OrderedItems.find().forEach(function (item) {
        sum = sum + parseInt(item.item.price);
    });
    return sum;
};

Router.map(function() {
    this.route('tables', {path: '/'});
    this.route('items', {path: '/items'});
    this.route('table', {
        path: '/table/:_id',
        waitOn: function() {
            return Meteor.subscribe('orders');
            },
        data: function() {
            return { table: Tables.findOne(this.params._id), orders: Orders.find({table_id: this.params._id}, {sort: {created: -1}}) };
            }
        });
    this.route('order', {
        path: '/order/:_id',
        waitOn: function() {
            Meteor.subscribe('orders');
            Meteor.subscribe('orderedItems', this.params._id);
            },
        data: function() {
            var items = Items.find({});
            var orderedItems = OrderedItems.find({order_id: this.params._id}, {sort: {created: -1}});
            return { order: Orders.findOne(this.params._id), items: items, ordered: orderedItems };
            }
        });
});

Meteor.startup(function () {
});


