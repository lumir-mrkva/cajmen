Orders.helpers({
	table: function() {
		var filter = {_id: this.table_id};
		if (Session.get('table_filter')) {
			filter['color'] = Session.get('table_filter')
		}
		return Tables.findOne(filter);
	},
	items: function() {
		var filter = {order_id: this._id};
		if (Session.get('item_filter')) {
			filter['item.color'] = Session.get('item_filter');
		}
		return OrderedItems.find(filter,
				{sort: {"item.color": -1}});
	}
});
