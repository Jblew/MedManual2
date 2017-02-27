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

MedmanualTree.prototype.getPageById = function (id) {
    if (this.flatPages.hasOwnProperty(id + "")) {
        return this.flatPages[id + ""];
    } else {
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

    mmRequestPost('pages/ajaxFlatTree', 'get', {}, function (data, isSuccess, errorData) {
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
    if(editedPage !== null) console.log("Parse and load data editedPage="+editedPage.id);
    if (data.hasOwnProperty("pages")) {
        for (var i = 0; i < data.pages.length; i++) {
            var pageAjaxData = data.pages[i];
            pageAjaxData.id = parseInt(pageAjaxData.id);
            if (editedPage !== null && parseInt(editedPage.id) === pageAjaxData.id) {
                console.log("Marking page saved!");
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
        if (this.onTreeChangeCallback !== null)
            this.onTreeChangeCallback();
    } else if (data.hasOwnProperty("flatTree")) {
        var childrenOfParents = [];
        var parentsOfChildren = [];
        this._loadFlatTreePages(data.flatTree, childrenOfParents, parentsOfChildren);
        var updatedTree = this._buildTreeFromFlatTree(data.flatTree, childrenOfParents, parentsOfChildren, this.getPageById(1));
        this.treeRoot = updatedTree;
        this.upToDate = true;
        console.log("Loaded treeRoot");
        if (this.onTreeChangeCallback !== null)
            this.onTreeChangeCallback();
    }
};

MedmanualTree.prototype._createFlatPagesFromTree = function (pageAjaxData) {
    if (this.getPageById(pageAjaxData.id) === null) {
        this.flatPages[pageAjaxData.id + ""] = new Page(pageAjaxData.id);
    } else {
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

MedmanualTree.prototype._loadFlatTreePages = function (flatTreePages, childrenOfParents, parentsOfChildren) {
    for (var i = 0; i < flatTreePages.length; i++) {
        var pageAjaxData = flatTreePages[i];
        if (this.getPageById(pageAjaxData.id) === null) {
            this.flatPages[pageAjaxData.id + ""] = new Page(pageAjaxData.id);
        } else {
            this.getPageById(pageAjaxData.id).update_clearParents();
            this.getPageById(pageAjaxData.id).update_clearChildren();
        }
        if(pageAjaxData.parent_id !== null) {
            if(!childrenOfParents.hasOwnProperty(pageAjaxData.parent_id+"")) {
                childrenOfParents[pageAjaxData.parent_id+""] = [];
            }
            childrenOfParents[pageAjaxData.parent_id+""].push({id: pageAjaxData.id});
            
            if(!parentsOfChildren.hasOwnProperty(pageAjaxData.id+"")) {
                parentsOfChildren[pageAjaxData.id+""] = [];
            }
            parentsOfChildren[pageAjaxData.id+""].push({id: pageAjaxData.parent_id});
        }
    }
    return childrenOfParents;
};

MedmanualTree.prototype._buildTreeFromFlatTree = function (flatTreePages, childrenOfParents, parentsOfChildren, page) {    
    var pageAjaxData = null;
    for(var i = 0;i < flatTreePages.length;i++) {
        if(flatTreePages[i].id !== null && flatTreePages[i].id === page.id) {
            pageAjaxData = flatTreePages[i];
        }
    }
    pageAjaxData.children = [];
    pageAjaxData.parents = [];
    if(childrenOfParents.hasOwnProperty(pageAjaxData.id+"")) pageAjaxData.children = childrenOfParents[pageAjaxData.id+""];
    if(parentsOfChildren.hasOwnProperty(pageAjaxData.id+"")) pageAjaxData.parents = parentsOfChildren[pageAjaxData.id+""];
    
    
    page.update(pageAjaxData, this);
    for (var i = 0; i < page.children.length; i++) {
        this._buildTreeFromFlatTree(flatTreePages, childrenOfParents, parentsOfChildren, page.children[i]);
    }
    return page;
};

//editing
MedmanualTree.prototype.unlinkPageFromParent = function (page, parent, callback) {
    if (page.hasParentOfId(parent.id)) {
        console.log("Removing parent " + parent.id);
        page.removeParent(parent);
        this.savePage(page, callback);
    } else {
        throw "Page does not belong to this parent";
        callback(true);
    }
};

MedmanualTree.prototype.addChildToPage = function (page, child, callback) {
    if (!child.hasParentOfId(page.id)) {
        console.log("Removing parent " + parent.id);
        child.addParent(page);
        this.savePage(child, callback);
    } else {
        throw "Page does not belong to this parent";
        callback(false);
    }
};

MedmanualTree.prototype.savePage = function (page, callback) {
    var saveData = page.getSaveObject();

    var that = this;
    mmRequestJson('pages/jsonSave/' + page.id, saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            console.log("Got response from jsonSave");
            console.log(data);
            that.parseAndLoadData(data, page);
            callback(true);
        } else {
            throw 'Could not save page. Error: ' + errorData;
            callback(false);
        }
    });
};

MedmanualTree.prototype.saveNewPage = function (page, callback) {
    var saveData = page.getSaveObject();

    var that = this;
    mmRequestJson('pages/jsonSave/new', saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            console.log(data);
            that.parseAndLoadData(data);
            var newPage = this.getPageById(data.pages[0].id);
            callback(true, newPage);
        } else {
            callback(false, 'Could not save new page. Error: ' + errorData);
        }
    });
};


//mmRequestPost(url, method, dataIn, callback)