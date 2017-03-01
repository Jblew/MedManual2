function MM() {
    this.mmTree = new MedmanualTree();
    this.mmTree.getOrLoadTree(function (treeRoot) {
    });
};

function mm() {
    if(typeof window.mm_ !== 'undefined') {
        return window.mm_;
    }
    else if(typeof window.opener.mm_ !== 'undefined') {
        window.mm_ = window.opener.mm_;
        console.log("mm obtained from parent window");
        return window.mm_;
    }
    else {
        window.mm_ = new MM();
        return window.mm_;
    }
};

MM.prototype.getErrorLogger = function() {
    if(typeof window.mmErrorLogger_ === 'undefined') {
        window.mmErrorLogger_ = new ErrorLogger();
    }
    return window.mmErrorLogger_;
};