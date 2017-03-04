/* global Lockr */

function MM() {
    this.initWindow();
    this.mmTree = new MedmanualTree();
    this.mmTree.init();    
};

function mm() {
    if(typeof window.mm_ !== 'undefined') {
        return window.mm_;
    }
    else if(window.opener !== null && typeof window.opener.mm_ !== 'undefined') {
        window.mm_ = window.opener.mm_;
        console.log("mm obtained from parent window");
        window.mm_.initWindow();
        return window.mm_;
    }
    else {
        window.mm_ = new MM();
        window.mm_.initWindow();
        return window.mm_;
    }
};

MM.prototype.getErrorLogger = function() {
    if(typeof window.mmErrorLogger_ === 'undefined') {
        window.mmErrorLogger_ = new ErrorLogger();
    }
    return window.mmErrorLogger_;
};

MM.prototype.initWindow = function() {
    this.getErrorLogger();
    Lockr.prefix = "mm";
};