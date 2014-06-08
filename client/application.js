Tables = new Meteor.Collection("tables");
Orders = new Meteor.Collection("orders");
Items = new Meteor.Collection('items');
OrderedItems = new Meteor.Collection('orderedItems');
Menus = new Meteor.Collection('menus');

var tablesHandle = Meteor.subscribe('tables');
var itemsHandle = Meteor.subscribe('items');
var ordersHande = Meteor.subscribe('orders');
var menusHandle = Meteor.subscribe('menus');

// Tables

Template.tables.loading = function () {
  return !tablesHandle.ready();
};

Template.tables.events = {
    'click #order': function tableOrder(e, template) {
        var order = Orders.findOne({table_id: this._id, printed: false});
        if (!order) newOrder(this);
        else Router.go('order', {_id: order._id});
    }
};


// Items
Template.items.events = {
    'click #save': function() {
        Menus.update(this.menu._id, {$set: {currency: $('#currency').val(),
        vat: $('#vat').val()}})
    },
    'click #add': function() {
        Items.insert({name: $('#name').val(), price: $('#price').val(), 
            currency: this.menu.currency});
    },
    'click #delete': function() {
        Items.remove(this._id);
    }
};

Template.item.events = {
    'click #add': function() {
        Items.update(this._id, {$push: {flavours: $('#flavour').val()}});
    },
    'click #remove': function(e, template) {
        Items.update(template.data._id, {$pull: {flavours: this+""}});
    }
}

// Table
Template.table.events = {
    'click #new': function(){newOrder(this.table)}, 
    'click #remove': function removeTable() {
        if(confirm('Really delete this table?')) {
            Tables.remove(this.table._id);
            Router.go('admin');
        }
    }
};

// Admin

Template.admin.events = {
    'click #addTable': function() {
        Tables.insert({name: $('#table').val()});
    }
};


// Orders

function newOrder(table) {
    var order = Orders.insert({table_id: table._id, printed: false});        
    Router.go('order', {_id: order});
};

Template.order.events = {
    'click #add': function addItem(e, template) {
        OrderedItems.insert({order_id: template.data.order._id, item: this });

    },
    'click #remove': function removeItem() {
        OrderedItems.remove(this._id); 
    },
    'click #print': function printOrder() {
        if (this.order.printed) return;
        var printItems = OrderedItems.find({order_id: this.order._id, printed: {$ne: true}});
        printItems.forEach(function (item) {
             OrderedItems.update(item._id, {$set: {printed: true}});
        });
        Meteor.call('printOrder', this.order);
        console.log(printItems);
    },
    'click #removeOrder': function removeOrder() {
        if(!this.printed) Orders.remove(this.order._id);
        Router.go('tables');
    }
};

Meteor.methods({
    printOrder: function(order) {
        order.printed = true;
    }
});

Template.order.sum = function() {
    var sum = 0;
    OrderedItems.find().forEach(function (item) {
        sum = sum + parseFloat(item.item.price);
    });
    return sum;
};

Router.map(function() {
    this.route('tables', {
        path: '/',
        waitOn: function() {
            Meteor.subscribe('orders');
            Meteor.subscribe('tables');
        },
        data: function() {
            return { tables: Tables.find({}, {sort: {name: 1}}), orders: Orders.find({}) };
        }
    });
    this.route('items', {
        path: '/items',
        waitOn: function() {
            Meteor.subscribe('menus');
            Meteor.subscribe('items');
            Menus.findOne();
        },
        data: function() {
            var menu = Menus.findOne();
            return {
                menu: menu,
                items: Items.find()
            }
        }
    });
    this.route('item', {
        path: '/items/:_id',
        waitOn: function() {
            return Meteor.subscribe('items');
        },
        data: function() {
            return Items.findOne(this.params._id);
        }
    });
    this.route('table', {
        path: '/table/:_id',
        waitOn: function() {
            return Meteor.subscribe('orders');
            },
        data: function() {
            return { table: Tables.findOne(this.params._id), 
                orders: Orders.find({table_id: this.params._id}, {sort: {created: -1}}) };
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
            var orderedItems = OrderedItems.find(
                {order_id: this.params._id}, 
                {sort: {created: -1}}
                );
            return { order: Orders.findOne(this.params._id), 
                items: items, ordered: orderedItems };
            }
        });
    this.route('admin', {
        path: '/admin',
        waitOn: function() {
            Meteor.subscribe('tables');
        },
        data: function() {
            return { tables: Tables.find({}, {sort: {name: 1}}) };
        }
    });

});

Meteor.startup(function () {
});


