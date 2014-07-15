Router.route('tables', {
    path: '/',
    waitOn: function() {
        Meteor.subscribe('orders');
        Meteor.subscribe('tables');
        Meteor.subscribe('menus');
    },
    data: function() {
        return { 
            tables: Tables.find({}, {sort: {name: 1}}), 
            orders: Orders.find({}), 
            menu: Menus.findOne() };
    }
});

Template.tables.events = {
    'click #order': function tableOrder(e, template) {
        newOrder(this, template.data.menu);
    }
};

Router.route('table', {
    path: '/table/:_id',
    waitOn: function() {
        Meteor.subscribe('menus');
        Meteor.subscribe('orders');
        Meteor.subscribe('tables');
    },
    data: function() {
        return { 
            table: Tables.findOne(this.params._id), 
            orders: Orders.find({table_id: this.params._id}, {sort: {created: -1}}),
            menu: Menus.findOne() };
    }   
});

Template.table.events = {
    'click #new': function order() {
        newOrder(this.table, this.menu);        
    }, 
    'click #remove': function removeTable() {
        if(confirm('Really delete this table?')) {
            Tables.remove(this.table._id);
            Router.go('admin');
        }
    },
    'click #removeOrder': function removeOrder() {
        if(confirm('Really remove order ' + this._id + '?')) Orders.remove(this._id);
    },
    'click #print': function printOrder() {
        Meteor.call('printBill', this);
    },
};

function newOrder(table, menu) {
    var order = Orders.findOne({table_id: table._id, printed: false});
    var orderId = order ? order._id : Orders.insert({table_id: table._id, 
        currency: menu.currency, vat: menu.vat, printed: false});   
    Router.go('order', {_id: orderId});
};