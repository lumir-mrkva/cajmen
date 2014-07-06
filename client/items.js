Router.route('items', {
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
            items: Items.find({}, {sort:{color:-1}})
        };
    }
});

Template.items.events = {
    'click #save': function() {
        Menus.update(this.menu._id, {$set: {currency: $('#currency').val(),
        vat: $('#vat').val()}})
    },
    'click #add': function() {
        Items.insert({name: $('#name').val(), price: $('#price').val(), 
            currency: this.menu.currency, color: $('#colorPicker .colorInput').val()});
    },
    'click #delete': function() {
        Items.remove(this._id);
    }
};

Template.items.rendered = function() {
    $('#colorPicker').tinycolorpicker();
};

Router.route('item', {
    path: '/items/:_id',
    waitOn: function() {
        return Meteor.subscribe('items');
    },
    data: function() {
        return Items.findOne(this.params._id);
    }
});

Template.item.events = {
    'click #add': function() {
        Items.update(this._id, {$push: {flavours: $('#flavour').val()}});
    },
    'click #remove': function(e, template) {
        Items.update(template.data._id, {$pull: {flavours: this+""}});
    }
};