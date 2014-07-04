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
        if (!order) newOrder(this, template.data.menu);
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

function newOrder(table, menu) {
    var order = Orders.insert({table_id: table._id, 
        currency: menu.currency, vat: menu.vat, printed: false});        
    Router.go('order', {_id: order});
};

Template.order.events = {
    'click #add': function addItem(e, template) {
        var item = OrderedItems.insert({order_id: template.data.order._id, item: this });
        if (this.flavours && this.flavours.length > 0) {
            Router.go('flavours', {_id : item, order: template.data.order._id});
        }
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
    },
    'click #ok': function ok() {
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

Template.flavours.events = {
    'click #ok': function okFlavours() {
        var flavours = $(':checked').map(function(){ return $(this).val();}).get();
        OrderedItems.update(this.item._id, {$set: {"item.flavours": flavours}});
        Router.go('order', {_id: this.order._id});
    }
}

Router.map(function() {
    this.route('tables', {
        path: '/',
        waitOn: function() {
            Meteor.subscribe('orders');
            Meteor.subscribe('tables');
            Meteor.subscribe('menus');
        },
        data: function() {
            return { tables: Tables.find({}, {sort: {name: 1}}), orders: Orders.find({}), 
                menu: Menus.findOne() };
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
            Meteor.subscribe('menus');
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
                items: items, ordered: orderedItems, menu: Menus.findOne() };
            }
        });
    this.route('flavours', {
        path: '/order/:order/item/:_id',
        waitOn: function() {
            Meteor.subscribe('orders');
            Meteor.subscribe('orderedItems', this.params.order);
        },
        data: function() {
            return { item: OrderedItems.findOne(this.params._id), 
                order: Orders.findOne(this.params.order) };
        }
    })
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


