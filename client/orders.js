Router.route('order', {
    path: '/order/:_id',
    waitOn: function() {
        Meteor.subscribe('menus');
        Meteor.subscribe('items');
        Meteor.subscribe('orders');
        Meteor.subscribe('orderedItems', this.params._id);
        Meteor.subscribe('tables');
    },
    data: function() {
        var items = Items.find({}, {sort:{color:-1}});
        var orderedItems = OrderedItems.find(
            {order_id: this.params._id}, 
            {sort: {created: -1}}
        );
        var order = Orders.findOne(this.params._id);
        var table = order ? Tables.findOne(order.table_id) : null;

        return { 
            order: order, 
            table: table, 
            items: items, 
            ordered: orderedItems, 
            menu: Menus.findOne()
        };
    }
});

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
    'click #print': function printOrder(e, template) {
        if (this.order.printed) return;
        var printItems = OrderedItems.find({order_id: this.order._id, printed: {$ne: true}});
        if (printItems.count() == 0) return;
        printItems.forEach(function (item) {
             OrderedItems.update(item._id, {$set: {printed: true}});
        });
        Meteor.call('printOrder', this.order);
        console.log(printItems);
    },
    'click #removeOrder': function removeOrder() {
        if(!this.order.printed) Orders.remove(this.order._id);
        Router.go('tables');
    },
    'click #ok': function ok() {
        Router.go('tables');
    }
};

Router.route('flavours', {
    path: '/order/:order/item/:_id',
    waitOn: function() {
        Meteor.subscribe('orders');
        Meteor.subscribe('orderedItems', this.params.order);
    },
    data: function() {
        return { item: OrderedItems.findOne(this.params._id), 
            order: Orders.findOne(this.params.order) };
    }
});

Template.flavours.events = {
    'click #ok': function okFlavours() {
        var flavours = $(':checked').map(function(){ return $(this).val();}).get();
        OrderedItems.update(this.item._id, {$set: {"item.flavours": flavours}});
        Router.go('order', {_id: this.order._id});
    }
}

Template.order.sum = function() {
    var sum = 0;
    OrderedItems.find().forEach(function (item) {
        sum = sum + parseFloat(item.item.price);
    });
    return sum;
};

Router.route('orders', {
    path: '/order/',
    waitOn: function() {
        Meteor.subscribe('orders');
        Meteor.subscribe('orderedItems', null);
        Meteor.subscribe('tables');
    },
    data: function() {
        return Orders.find({printed: true}, {sort: {created: -1}, limit: 20});
    }
});

Template.orders.filters = function() {
    var filters = {tables: Session.get('table_filter'), 
    items: Session.get('item_filter')};
    if (filters.items || filters.tables) return filters;
};

Template.orders.events = {
    'click #clearFilters': function clearFilters() {
        Session.set('table_filter',null);
        Session.set('item_filter',null);
    },
    'click .table-name': filterTables,
    'tap .table-name': filterTables,
    'click .item': filterItems,
    'tap .item': filterItems,
    'click .title.left': order,
    'tap .title.left': order
};

function filterTables() {
    Session.set('table_filter', this.table().color);
};

function filterItems() {
    Session.set('item_filter',this.item.color);
};

function order() {
    Router.go('order',{_id: this._id});
};