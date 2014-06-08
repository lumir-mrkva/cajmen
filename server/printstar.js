var process = Npm.require('child_process');

Star = {
	print: function(data, cut) {
		var lpr = process.spawn('lpr');
		lpr.stdin.write(data);
		lpr.stdin.end();
		if (cut) this.cut();
	},
	cut: function() {
		var lpr = process.spawn('lpr',['-o','raw']);
		lpr.stdin.write(new Buffer([27,100,48]));
		lpr.stdin.end();
	}
}
