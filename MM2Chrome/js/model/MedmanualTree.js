function MedmanualTree(errorLogger_) {
    this.upToDate = false;
    this.treeRoot = null;
    this.flatPages = new Object();
    this.errorLogger = errorLogger_;
}

MedmanualTree.prototype.isUpToDate = function () {
    return this.upToDate;
};

MedmanualTree.prototype.getTreeRoot = function () {
    return this.treeRoot;
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
            that.parseAndLoadData(data, null);
            that.upToDate = true;
            callback(that.treeRoot);
        } else {
            this.errorLogger.error('Could not get tree. Error: ' + errorData);
        }
    });
};

MedmanualTree.prototype.parseAndLoadData = function (data, editedPage) {
    if (data.hasOwnProperty("pages")) {
        for (var i = 0; i < data.pages.length; i++) {
            var pageAjaxData = data.pages[i];
            
            if(editedPage !== null && editedPage.id === pageAjaxData.id) {
                editedPage.markSaved(pageAjaxData);
            }

            if (this.getPageById(pageAjaxData.id) === null) {
                this.flatPages[pageAjaxData.id + ""] = new Page(pageAjaxData.id);
            }

            this.flatPages[pageAjaxData.id + ""].update(pageAjaxData, this);
        }
    }

    if (data.hasOwnProperty("tree")) {
        this._createFlatPagesFromTree(data.tree);
        var updatedTree = this._buildTree(data.tree);
        this.treeRoot = updatedTree;
        this.upToDate = true;
        console.log("Loaded treeRoot");
    }
};

MedmanualTree.prototype._createFlatPagesFromTree = function (pageAjaxData) {
    if (this.getPageById(pageAjaxData.id) === null) {
        this.flatPages[pageAjaxData.id + ""] = new Page(pageAjaxData.id);
    }
    else {
        this.getPageById(pageAjaxData.id).update_clearParents();
    }
    
    for (var i = 0; i < pageAjaxData.children.length; i++) {
        this._createFlatPagesFromTree(pageAjaxData.children[i]);
    }
};

MedmanualTree.prototype._buildTree = function (pageAjaxData) {
    var page = this.getPageById(pageAjaxData.id);
    page.update(pageAjaxData, this);
    for (var i = 0; i < pageAjaxData.children.length; i++) {
        var child = this._buildTree(pageAjaxData.children[i]);
        child.update_addParent(page);
    }
    return page;
};

//editing
MedmanualTree.prototype.unlinkPageFromParent = function(page, parent, callback) {
    if(page.hasParentOfId()) {
        page.removeParent();
        this.savePage(page, callback);
    }
    else callback(true);
};

MedmanualTree.prototype.savePage = function(page, callback) {
    var saveData = page.getSaveObject();
    
    var that = this;
    mmRequestPost('pages/jsonSave', 'post', saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            that.parseAndLoadData(data, page);
            callback(true);
        } else {
            this.errorLogger.error('Could not get tree. Error: ' + errorData);
            callback(false);
        }
    });
};



//mmRequestPost(url, method, dataIn, callback)