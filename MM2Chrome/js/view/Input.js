var inputUid = 0;

function Input() {
    this.type_ = "text";
    this.name_ = "";
    this.value_ = "";
    this.class_ = "";
    this.id = "input"+inputUid;
    inputUid++;
}

Input.prototype.type = function(v) {
    this.type_ = v;
    return this;
};

Input.prototype.name = function(v) {
    this.name_ = v;
    return this;
};

Input.prototype.value = function(v) {
    this.value_ = v;
    return this;
};

Input.prototype.class = function(v) {
    this.class_ = v;
    return this;
};

Input.prototype.getId = function(v) {
    return this.id;
};

Input.prototype.get$ = function() {
    return $("#"+this.id);
};

Input.prototype.getValue = function() {
    return this.get$().val();
};

Input.prototype.getHtml = function() {
    return '<input id="'+this.id+'" class="'+this.class_+'" name='+this.name_+'"""\n\
        +" type="'+this.type_+'" value="'+this.value_+'" />';
};