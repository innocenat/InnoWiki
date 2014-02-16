
;(function() {

var fs = require('fs');
var path = require('path');
var util = require('util');

var marked = require('./marked');
var hljs = require('./hljs');
var config = {
	data: './data',
	template: 'template.html'
};

var page_list = [];
var template = "";

var renderer = new marked.Renderer;

renderer.table = function(header, body) {
  return '<table class="table table-striped table-bordered">\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

marked.setOptions({
	gfm: true,
	tables: true,
	breaks: true,
	smartLists: true,
	smartypants: true,
	pedantic: false,
	sanitize: false,
	highlight: function (code, lang) {
		if (lang)
			return hljs.highlight(lang, code).value;
		else
			return hljs.highlightAuto(code).value;
	},
	langPrefix: 'lang-',

	inline_ext: {
		text: /^[\s\S]+?(?=[\\<!\[_*`']| {2,}\n|$)/,
		strong: /^'''([\s\S]+?)'''(?!')/,
		em: /^''([\s\S]+?)''/
	},

	renderer: renderer
});

function scan_page_list() {
	page_list = [];

	process_dir_sync(config.data, '');
	template = fs.readFileSync(path.join(config.data, config.template), { encoding: 'utf-8' });
}

function process_dir_sync(uri, base) {
	files = fs.readdirSync(uri);

	files.forEach(function (c) {
		if (path.extname(c) == '.markdown') {
			page_list.push((base + "/" + path.basename(c, '.markdown')).substring(1));
		} else {
			var new_path = path.join(uri, c);
			var new_base = base + '/' + c;

			var stat = fs.statSync(new_path);
			if (stat.isDirectory()) {
				process_dir_sync(new_path, new_base);
			}
		}
	});
}

function process_wikilink(page, text) {
	var regex = /\[\[(.+?)(?:(\|)(.*?))?\]\](.*?)(?!\w)/g;
	var result;

	var split_rgex = /(<code[\S\s]*?\/code>)/gmi;
	var splitted_text = text.split(split_rgex);

	var response = '';
	var to_root = get_to_root(page);

	for (var i = 0; i < splitted_text.length; i++) {
		var cur_text = splitted_text[i];
		if (i%2 == 0) {
			while ((result = regex.exec(cur_text)) != null) {
				var source = result[0];
				var link_text = result[3] ? result[3] : result[1];

				if (result[2] && result[2] == '|' && !result[3]) {
					link_text = link_text.split(/[\(,]/)[0].replace(/_+$/g, '');
				}

				link_text += result[4];
				link_text = link_text.trim();

				var target = result[1].trim().replace(/\s/g, '_');
				var target_page = to_root + target; // In case we may implement hierarchy-based linking
				var target_link = target_page + '.html';

				var exist = page_list.indexOf(target) != -1;

				cur_text = cur_text.replace(source, util.format('<a href="%s" title="%s" class="wikilink%s">%s</a>', target_link, link_text, exist ? "" : " wikilink-notexist", link_text));
			}
		}
		response += cur_text;
	}
	return response;
}

function get_to_root(uri) {
	var relative = path.relative(uri.substring(1), '');
	return relative.substring(0, relative.length-2).replace(/\\/g, '/');
}

function process_text(page, str) {
	var content = process_wikilink(page, marked(str));
	var title = path.basename(page).replace(/_/g, ' ');
	var to_root = get_to_root(page);
	return template.replace(/\(\$root\)/g, to_root).replace(/\(\$title\)/g, title).replace(/\(\$content\)/g, content);
}

module.exports = {
	process: process_text,
	init: scan_page_list,
	set: function(k, v) {
		config[k] = v;
	}
};

})();
