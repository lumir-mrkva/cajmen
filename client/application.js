Tables = new Meteor.Collection("tables");
Orders = new Meteor.Collection("orders");
Items = new Meteor.Collection('items');


Template.tables.tables = function () {
  return Tables.find({}, {sort: {name: 1}});
};

var tablesHandle = Meteor.subscribe('tables');
var itemsHandle = Meteor.subscribe('items');

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
        console.log('inserting item');
        Items.insert({name: $('#name').val(), price: $('#price').val()});
    },
    'click #delete': function() {
        Items.remove(this._id);
    }
};

Router.map(function() {
    this.route('tables', {path: '/'});
    this.route('items', {path: '/items'});
    this.route('table', {
        path: '/table/:_id',
        data: function() {
            return Tables.findOne(this.params._id);
            }
        });
});

Meteor.startup(function () {
});


