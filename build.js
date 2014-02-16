
var filter = require('./lib/filter');
var fs = require('fs');
var path = require('path');

filter.init();

var _buff = new Buffer(4096);
var copyFileSync = function(srcFile, destFile) {
  var bytesRead, fdr, fdw, pos;
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, _buff, 0, 4096, pos);
    fs.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
}

function process_dir(uri, target) {
	files = fs.readdirSync(uri);
	var folder_created = false;
	files.forEach(function (c) {
		var new_path = path.join(uri, c);
		var new_target = path.join(target, c);

		if (path.extname(c) == '.markdown') {
			if (!folder_created) {
				try {
					fs.mkdirSync(target);
				} catch (_) {}
				folder_created = true;
			}
			var content = fs.readFileSync(new_path);
			content = filter.process(new_path.replace('.markdown', '').substring(4), content.toString());
			fs.writeFileSync(new_target.replace('.markdown', '.html'), content);
			console.log("Processed: " + new_target);
		} else {
			var stat = fs.statSync(new_path);
			if (stat.isDirectory()) {
				process_dir(new_path, new_target);
			}
		}
	});
}

function process_copy_dir(uri, target) {
	files = fs.readdirSync(uri);

	try {
		fs.mkdirSync(target);
	} catch (_) {}

	files.forEach(function (c) {
		var new_path = path.join(uri, c);
		var new_target = path.join(target, c);

		var stat = fs.statSync(new_path);

		if (stat.isDirectory()) {
			process_copy_dir(new_path, new_target);
		} else {
			copyFileSync(new_path, new_target);
		}
	});
}

try {
	fs.mkdirSync('build');
} catch (_) {}

// Clean up
try {
		fs.unlinkSync('build/index.html');
	} catch (_) {} // in case it doesn't exist

// Copy blob
process_copy_dir('blob', 'build');

// Build page
process_dir('data', 'build');

// Create index page
if (fs.existsSync('build/Main_Page.html') && !fs.existsSync('build/index.html'))
	try {
		copyFileSync('build/Main_Page.html', 'build/index.html');
	} catch (_) {} // in case it doesn't exist
