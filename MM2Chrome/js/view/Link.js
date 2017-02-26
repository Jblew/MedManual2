var linksUidIncrementer = 0;

function Link(text_) {
    this.text = text_;
    this.onClickCallback = null;
    this.id = "link-"+linksUidIncrementer;
    linksUidIncrementer++;
}

Link.prototype.withIcon = function(iconName) {
    this.text = "<span class=\"glyphicon glyphicon-"+iconName+"\" aria-hidden=\"true\"></span> "+this.text;
    return this;
};

Link.prototype.withCallback = function(onClickCallback_) {
    this.onClickCallback = onClickCallback_;;
    return this;
};

Link.prototype.getHtml = function() {
    return "<a id=\""+this.id+"\">"+this.text+"</a>";
};

Link.prototype.getButtonHtml = function(appearance) {
    return "<a class=\"btn btn-"+appearance+"\" id=\""+this.id+"\" role=\button\">"+this.text+"</a>";
};

Link.prototype.initCallback = function() {
    if(this.onClickCallback !== null) $("#"+this.id).on('click', this.onClickCallback);
};
