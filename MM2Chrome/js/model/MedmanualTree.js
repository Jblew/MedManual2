function MedmanualTree(errorLogger_) {
    this.upToDate = false;
    this.treeRoot = null;
    this.flatPages = new Object();
    this.errorLogger = errorLogger_;
}

MedmanualTree.prototype.isUpToDate = function () {
    return this.upToDate;
};

MedmanualTree.prototype.getTree = function () {
    return this.tree;
};

MedmanualTree.prototype.getPageById = function(id) {
    if (this.flatPages.hasOwnProperty(id + "")) {
        return this.flatPages[id+""];
    }
    else {
        return null;
    }
};

MedmanualTree.prototype.getOrLoadTree = function (callback_) {
    var callback = callback_;
    if (!this.isUpToDate()) {
        this.load(function (treeData) {
            callback(treeData);
        });
    } else
        callback(this.treeRoot);
};

MedmanualTree.prototype.load = function (callback) {
    var that = this;
    
    mmRequestPost('pages/index', 'get', {}, function (data, isSuccess, errorData) {
        if (isSuccess) {
            that.parseAndLoadData(data);
            that.upToDate = true;
            callback(that.treeRoot);
        } else {
            this.errorLogger.error('Could not get tree. Error: ' + errorData);
        }
    });
};

MedmanualTree.prototype.parseAndLoadData = function (data) {
    if (data.hasOwnProperty("pages")) {
        for (var i = 0; i < data.pages.length; i++) {
            var pageAjaxData = data.pages[i];

            if (this.getPageById(pageAjaxData.id) === null) {
                this.flatPages[pageAjaxData.id + ""] = new Page();
            }

            this.flatPages[pageAjaxData.id + ""].update(pageAjaxData, this);
        }
    }

    if (data.hasOwnProperty("tree")) {
        this._createFlatPagesFromTree(data.tree);
        var updatedTree = this._buildTree(data.tree);
        this.treeRoot = updatedTree;
        console.log("Loaded treeRoot");
    }
};

MedmanualTree.prototype._createFlatPagesFromTree = function (pageAjaxData) {
    if (this.getPageById(pageAjaxData.id) === null) {
        this.flatPages[pageAjaxData.id + ""] = new Page();
    }
    else {
        this.getPageById(pageAjaxData.id).clearParents();
    }
    
    for (var i = 0; i < pageAjaxData.children.length; i++) {
        this._createFlatPagesFromTree(pageAjaxData.children[i]);
    }
};

MedmanualTree.prototype._buildTree = function (pageAjaxData) {
    var page = this.getPageById(pageAjaxData.id).update(pageAjaxData, this);
    for (var i = 0; i < pageAjaxData.children.length; i++) {
        var child = this._buildTree(pageAjaxData.children[i]);
        child.addParent(page);
    }
    return page;
};