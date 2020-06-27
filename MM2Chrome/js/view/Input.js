var inputUid = 0;

function Input() {
    this.type_ = "text";
    this.placeholder_ = "";
    this.name_ = "";
    this.value_ = "";
    this.class_ = "";
    this.id = "input" + inputUid;
    this.modified = false;
    this.savedValue = "";
    inputUid++;
}

Input.prototype.type = function (v) {
    this.type_ = v;
    return this;
};

Input.prototype.placeholder = function (v) {
    this.placeholder_ = v;
    return this;
};

Input.prototype.name = function (v) {
    this.name_ = v;
    return this;
};

Input.prototype.value = function (v) {
    this.value_ = v;
    this.savedValue = v;
    return this;
};

Input.prototype.class = function (v) {
    this.class_ = v;
    return this;
};

Input.prototype.getId = function (v) {
    return this.id;
};

Input.prototype.get$ = function () {
    return $("#" + this.id);
};

Input.prototype.getValue = function () {
    //if (this.type_ === "multiline-adapt")
    //    return this.get$().text();
    //else
    return this.get$().val(); //textarea also has value
};

Input.prototype.setValue = function (v) {
    //if (this.type_ === "multiline-adapt")
    //    this.get$().text(v);
    //else
    this.get$().val(v);
    this.setSaved();
};

Input.prototype.setSaved = function () {
    var elem$ = this.get$();
    if (elem$.length > 0) {
        this.savedValue = this.getValue();
    } else
        this.savedValue = this.value_;
};

Input.prototype.isModified = function () {
    return this.get$().val() !== this.savedValue;
};

Input.prototype.onValueChange = function (callback) {
    var that = this;

    this.get$().on('keyup', function () {
        if (that.isModified())
            callback();
    });
};

Input.prototype.init = function (e) {
    var that = this;

    this.get$().on('keyup', function () {
        if (that.type_ === "multiline-adapt") {
            that.get$().css('height', '1px');
            that.get$().css('height', (that.get$().get(0).scrollHeight) + 'px');
        }
    });

    this.get$().on('keypress keyup', function (e) {
        if ((e.keyCode || e.which) === 13)
            e.preventDefault();
    });

    this.get$().css('height', '1px');
    this.get$().css('height', (this.get$().get(0).scrollHeight) + 'px');
};

Input.prototype.getHtml = function () {
    if (this.type_ === "multiline-adapt") {
        return '<textarea id="' + this.id + '" class="' + this.class_ + '" name=' + this.name_ + '"""\n\
            +">' + this.value_ + '</textarea>';
    } else {
        return '<input id="' + this.id + '" class="' + this.class_ + '" name=' + this.name_ + '"""\n\
            +" type="' + this.type_ + '" value="' + this.value_ + '" placeholder="' + this.placeholder_ + '" />';
    }
};