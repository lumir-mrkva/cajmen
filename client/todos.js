// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Tables = new Meteor.Collection("tables");
Orders = new Meteor.Collection("orders");


// Tables
Template.tables.tables = function () {
  return Tables.find({}, {sort: {name: 1}});
};

var tablesHandle = Meteor.subscribe('tables');

Template.tables.loading = function () {
  return !tablesHandle.ready();
};

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

// Attach events to keydown, keyup, and blur on "New list" input box.
Template.tables.events(okCancelEvents(
  '#new-table',
  {
    ok: function (text, evt) {
      var id = Tables.insert({name: text});
      evt.target.value = "";
    }
  }));

////////// Tracking selected list in URL //////////

var TodosRouter = Backbone.Router.extend({
  routes: {
    ":table_id": "main"
  },
  main: function (table_id) {
    var oldList = Session.get("table_id");
    if (oldList !== table_id) {
      Session.set("list_id", table_id);
      Session.set("tag_filter", null);
    }
  },
  setTable: function (table_id) {
    this.navigate(table_id, true);
  }
});

Router = new TodosRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
