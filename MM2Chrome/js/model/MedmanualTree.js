function MedmanualTree(errorLogger_, onTreeChangeCallback_) {
    this.upToDate = false;
    this.treeRoot = null;
    this.flatPages = new Object();
    this.errorLogger = errorLogger_;
    this.onTreeChangeCallback = onTreeChangeCallback_;
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
        if(this.onTreeChangeCallback !== null) this.onTreeChangeCallback();
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
    console.log("Page: ");
    console.log(page);
    console.log("Parent: ");
    console.log(parent);
    
    if(page.hasParentOfId(parent.id)) {
        console.log("Removing parent "+parent.id);
        page.removeParent(parent);
        this.savePage(page, callback);
    }
    else {
        console.log("Page does not belong to this parent");
        callback(true);
    }
};

MedmanualTree.prototype.savePage = function(page, callback) {
    var saveData = page.getSaveObject();
    
    var that = this;
    mmRequestPost('pages/jsonSave/'+page.id, 'post', saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            console.log("Got response from jsonSave");
            console.log(data);
            that.parseAndLoadData(data, page);
            callback(true);
        } else {
            console.log('Could not get tree. Error: ' + errorData);
            callback(false);
        }
    });
};



//mmRequestPost(url, method, dataIn, callback)