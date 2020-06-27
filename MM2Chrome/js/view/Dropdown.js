var dropdownUid = 0;

function Dropdown(label_) {
    this.label = label_;
    this.menuLinks = [];
    this.id = "dropdown-"+dropdownUid;
    dropdownUid++;
}

Dropdown.prototype.addItem = function(html) {
    this.menuLinks.push('<li>'+html+'</li>');
    return this;
};

Dropdown.prototype.addDisabledItem = function(html) {
    this.menuLinks.push('<li class="disabled">'+html+'</li>');
    return this;
};

Dropdown.prototype.addHeader = function(html) {
    this.menuLinks.push('<li class="dropdown-header">'+html+'</li>');
    return this;
};

Dropdown.prototype.addSeparator = function() {
    this.menuLinks.push('<li role="separator" class="divider"></li>');
    return this;
};

Dropdown.prototype.get$ = function() {
    return $("#"+this.id);
};

Dropdown.prototype.getHtml = function () {
    var out = '<div class="dropdown" id="'+this.id+'">'
            + ' <span class="dropdown-toggle" data-toggle="dropdown">'
            + '     ' + this.label + '<span class="caret"></span>'
            + ' </span>'
            + ' <ul class="dropdown-menu">';

    for (var i = 0; i < this.menuLinks.length; i++) {
        out += this.menuLinks[i];
    }

    out += '    </ul>'
            + '</div>';
    return out;
};