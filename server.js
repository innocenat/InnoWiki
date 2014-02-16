var filter = require('./lib/filter');
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');

var map = {
	'.ico': 'image/x-icon',
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
	'.png': 'image/png',
	'.txt': 'text/plain'
};

filter.init();

function process_dynamic(uri, res) {
	uri = uri.replace('.html', '');
	uri = path.normalize(uri);
	var md_file = path.join('data', uri + ".markdown");
	fs.readFile(md_file, function (err, data) {
		if (err) {
			process_not_found(res);
			return;
		}
		res.setHeader('Content-type', 'text/html');

		// Re-init to allow easier testing
		filter.init();

		data = filter.process(uri, data.toString());
		res.write(data, function () {
			res.end();
		});
	});
}

function process_request(uri, res) {
	var mime = map[path.extname(uri)];

	// Default path
	if (uri == '/')
		uri = 'Main_Page.html';

	var blob_file = path.join('blob', uri)
	var fileStream = fs.createReadStream(blob_file);
	fileStream.on('error', function() {
		process_dynamic(uri, res);
	});
	fileStream.on('end', function() {
		res.end();
	});
	fileStream.on('open', function () {
		res.setHeader('Content-type', mime);
	});
	fileStream.pipe(res);
}

function process_not_found(res) {
	res.statusCode = 404;
	res.write("<h1>Not found</h1>");
	res.end();
}

var server = http.createServer();
server.listen(8080, 'localhost');
server.on('request', function(req, res) {
	var url_p = url.parse(req.url, true);
	process_request(url_p.pathname, res);
});
