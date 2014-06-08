PrintBuilder = function(pageLength, pageWidth){
    this.s = '';
    this.lines = 0;
    this.pageLength = minLength;
    if (pageLength) this.pageLength = pageLength;

    this.pageWidth = 48;
    if (pageWidth) this.pageWidth = pageWidth;
    
    this.addLn = addLn;
    this.hr = hr;
    this.build = build;
    this.nl = nl;
}

function addLn(string, right) {
    var s = string;
    if (right) {
        s = pad(pageWidth - right.length, s) + right;
    }
    this.s = this.s + s;
    this.nl();
    return this;
}

function hr() {
    this.s = this.s + pad(this.pageWidth, null, '-'); 
    this.nl();
    return this;
}

function build() {
    while (this.lines < this.pageLength) this.nl();
    return this.s;
}

function nl() {
    this.lines++;
    this.s = this.s + '\n';
}

function pad(length, string, character) {
    if (!string) string = '';
    if (!length) length = pageWidth;
    if (!character) character = ' ';
    var s = string;
    if (s.length == length) return s;
    if (s.length < length) {
        var space = length - s.length;
        for (var i = 0; i < space; i++) {
            s = s + character;
        }
    } else {
        s = s.substring(0, length);
    }
    return s;
}

var pageWidth = 48;
var minLength = 15;
