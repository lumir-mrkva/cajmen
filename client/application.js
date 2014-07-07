Settings = new Meteor.Collection('settings');
Tables = new Meteor.Collection("tables");
Orders = new Meteor.Collection("orders");
Items = new Meteor.Collection('items');
OrderedItems = new Meteor.Collection('orderedItems');
Menus = new Meteor.Collection('menus');
BestItems = new Meteor.Collection('bestItems');

Meteor.methods({
    printOrder: function(order) {
        order.printed = true;
    }
});

Meteor.startup(function () {
});