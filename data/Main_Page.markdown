Hello, and welcome to '''InnoWiki'''!

Congratulation, you are now running smoothly! To get started, please continue
reading this document.

'''InnoWiki''' is a system designed for simplicity. It is aimed to be a
wiki-like system where content contributors use `git` or other DVCS to modify
wiki page. It can also be used as static site generator, but the feature in
that regard is very limited.

InnoWiki is created mainly because I want to host some documents which will
include both source code (requires syntax highlighting) and mathematics formula
(requires MathJax/etc.). The current wiki system (notably MediaWiki) is too
complicated and cmubersome for such a simple task, and I cannot find any
solution that I liked, so I created this.

Managing documents
-------------------------------------------------------------------------------

 - Documents are stored in `data` folder.
 - Page title are automatically generated from file name by replaceing all
   underscores (`_`) with space (` `)
 - Letter cases are kept as-is.
 - All document must have `.markdown` file extension.
 - You can use any editor you want.

Syntax
-------------------------------------------------------------------------------

Even though this this system is called ''wiki'', Markdown format is much easier
to work with than Wiki format. However, Markdown format do have limitation. The
markdown parser used by this engine is modified a little, mainly the syntax for
'''bold''' and ''italic'' text has been changed to Wiki format, because the
old syntax likes to sabotage inline LaTeX that may be used heavily in Wiki
system:

Type       | Markdown command | InnoWiki command
:---------:|:----------------:|:-----------------:
'''Bold''' | `**Bold text**`  | `'''Bold text'''`
''Italic'' | `*Italic text*`  | `''Italic text''`

Another added format is ``[[Wikilink]]``. You can use this format to link to
any page in the wiki, and it works almost exactly the same way as on WikiMedia

Command         | Display       | Target
:---------------|:--------------|:----------------
`[[Wikilink]]`  | [[Wikilink]]  | `Wikilink.html`
`[[Wiki]]link`  | [[Wiki]]link  | `Wiki.html`
`[[Link|Text]]` | [[Link|Text]] | `Link.html`
`[[Link (a)|]]` | [[Link (a)|]] | `Link_(a).html`
`[[Link, a|]]`  | [[Link, a|]]  | `Link,_a.html`

It is recommended to use wikilink to link all your page, in case URL or
naming schema changed in future version. (Unlikely, but possible)

For example of Wikilink: [[Subgroup]]

Usage
-------------------------------------------------------------------------------

Place all your document in `data` directory. Place all your assets in `blob`
directory. You can start server for testing purpose by running:

	$ node server.js

Note this this server is '''NOT''' aimed to be run in production environment.
It is slow and synchronous, and is not secure at all.

To run on production server, please build the entire website by running:

	$ node build.js

It will build and package all files into `build` directory. Upload entire
content of this folder to any server of your choice. You can also browse this
locally assuming that you did not use any CDN to host the CSS/Javascript used
in the page.

Template
-------------------------------------------------------------------------------

The main template file is `data/template.html`. You can modify this any way you
want: adding sidebar, footer, image etc. However, when you do external linking,
it is good idea to use relative path to make it also work locally (without
web server).

Three variables will be replaced by engine:

 - `($root)` will be replace by relative path to root of website e.g. `../`
 - `($title)` will be replaced by page title.
 - `($content)` will be replaced by page content.

You can see the example template for more information.

Modifying
-------------------------------------------------------------------------------

The code is not very long and should not be hard to modify.

 - `lib/filter.js`: This is main processing file that do all text processing.
   It internally use `marked` and `highlight.js` NPM package.
 - `build.js` and `server.js`: This is external interface. Please also note that
    parameter passing must be sync between two scripts to processing function.

Note that both `marked` and `highlight.js` are not installed via NPM
repository. The `marked` library is modified to work with this Wiki formatting:

 - Allow overriding of internal regular expession (to change the bold and
   italic syntax)
 - Patched the table regular expression (is hardcoded) to force space before
   and after pipe (`|`) to allow wikilink inside table.

`highlight.js` is distributed locally because the author (myself) added more
languages and is not going to wait for it to be added to main repo. You can
change it with your build easily though. (the `lib/hljs` folder structure is
same as `node_modules/highlight.js/lib` in NPM-based installation, just
overwrite it.)

License
-------------------------------------------------------------------------------

'''The MIT License (MIT)'''

Copyright &copy; 2014 innocenat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
