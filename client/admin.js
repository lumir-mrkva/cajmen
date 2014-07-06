Router.map(function() {
    this.route('admin', {
        path: '/admin',
        waitOn: function() {
            Meteor.subscribe('tables');
        },
        data: function() {
            return { tables: Tables.find({}, {sort: {name: 1}}) };
        }
    });
    this.route('stats', {
        path: '/stats',
        waitOn: function() {
            Meteor.subscribe('bestItems','yfbXvxDPB9g5hLeA8');
            Meteor.subscribe('orderedItems', null);
        },
        data: function() {
            var items = BestItems.find({},{sort:{renevue:-1}});
            return { 
                items: OrderedItems.find({printed: null}), 
                bestItems: items 
            };
        }
    });
});

Template.admin.events = {
    'click #addTable': function() {
        Tables.insert({name: $('#table').val()});
    }
};

Meteor.methods({
    printOrder: function(order) {
        order.printed = true;
    }
});

Template.stats.totalRenevue = function() {
    var sum = 0;
    BestItems.find().forEach(function (item) {
        sum = sum + parseFloat(item.renevue);
    });
    return sum;
};