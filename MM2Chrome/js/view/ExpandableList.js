var expandableListUid = 0;

function ExpandableList(headerHtml_) {
    this.inHtml = "";
    this.headerHtml = headerHtml_;
    this.id = expandableListUid;
    expandableListUid++;
}

ExpandableList.prototype.withContent = function(content_) {
    this.inHtml = content_;
    return this;
};

ExpandableList.prototype.getHtml = function() {
    return "<div class=\"expandablelist-header\" id=\"exlist-header-"+this.id+"\">"
            +"<span id=\"exlist-expander-"+this.id+"\" class=\"glyphicon\"></span> "
            +this.headerHtml+"</div>"
            +"<ul id=\"exlist-innerul-"+this.id+"\">"+this.inHtml+"</ul>";
};

ExpandableList.prototype.init = function() {
    
};