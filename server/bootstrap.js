// if the database is empty on server start, create some sample data.

var tables = 6;
var menu = [ "Kc", 21 ];
var items = [ 
    [ "dymka", 121 ],
    [ "ryze", 50 ],
    [ "caj caj caj", 70 ],
    [ "tung ting", 88 ],
    [ "masala", 60 ]
];

Meteor.startup(function () {
  if (Tables.find().count() === 0) {
    for (var i = 1; i <= tables; i++) {
      Tables.insert({name: i+""});
    }
  }
  if (Menus.find().count() === 0) {
     var m = Menus.insert({vat: menu[1], currency: menu[0]}); 
     for (var i = 0; i < items.length; i++) {
       Items.insert({name: items[i][0], price: items[i][1], currency: menu[0]});
     }
  }
});
