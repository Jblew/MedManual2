/* global mm, Lockr */

function MedmanualTree() {
    this.upToDate = false;
    this.treeLoaded = false;
    this.flatPages = new Object();
    this.onTreeChangeCallbacks = [];

    this.treeRoot = new Page(1, this); //treeRoot placeholder

    if (!this.treeRoot.titleLoaded) {
        this.treeRoot.title = "Wait for tree to load...";
        this.treeRoot.id = 1;
    }
}

MedmanualTree.prototype.isUpToDate = function () {
    return this.upToDate;
};

MedmanualTree.prototype.isTreeLoaded = function () {
    return this.treeLoaded;
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

MedmanualTree.prototype.getOrInitPageWithId = function (id) {
    if (typeof id === 'undefined' || id === null || id < 1)
        throw "Cannot get or init page with improper id (id=" + id + "). Id mus be also greater than 0";
    if (!this.flatPages.hasOwnProperty(id + "")) {
        this.flatPages[id + ""] = new Page(id, this);
    }
    return this.flatPages[id + ""];
};

//tree loading
MedmanualTree.prototype.init = function () {
    console.log("MedmanualTree.init()");
    var savedItems = Lockr.getAll(true);
    for (var i in savedItems) {
        var tuple = savedItems[i];
        var key = Object.keys(tuple)[0];
        if (key.startsWith("page_")) {
            var id = parseInt(key.substring(5));
            //console.log("Page #" + id + " could be loaded from localStorage");
            this.getOrInitPageWithId(id);
            //console.log("Page #" + id + " was initialised");
        }
    }
    this.upToDate = true;
    this.treeLoaded = true;
    this.treeRoot = this.getPageById(1);
    console.log({msg: "Tree loaded from localStorage", flatTree: this.flatPages});
    this._triggerTreeChanged();

    var that = this;
    that.load(function () {
        that._triggerTreeChanged();
    });
    //}, 3500);

};

MedmanualTree.prototype.load = function (callback) {
    var that = this;

    mmRequestPost('pages/ajaxFlatTree', 'get', {}, function (data, isSuccess, errorData) {
        if (isSuccess) {
            that.parseAndLoadData(data, null);
            console.log("Tree reloaded!");
            that.upToDate = true;
            that.treeLoaded = true;
            if (callback !== null)
                callback(that.treeRoot);
        } else {
            mm().getErrorLogger().error('Could not get tree. Error: ' + errorData);
        }
    });
};

MedmanualTree.prototype.parseAndLoadData = function (data, editedPage) {
    if (editedPage !== null)
        console.log("Parse and load data editedPage=" + editedPage.id);
    if (data.hasOwnProperty("pages")) {
        for (var i = 0; i < data.pages.length; i++) {
            var pageAjaxData = data.pages[i];
            pageAjaxData.id = parseInt(pageAjaxData.id);
            if (editedPage !== null && parseInt(editedPage.id) === pageAjaxData.id) {
                console.log("Marking page saved!");
                editedPage.markSaved(pageAjaxData);
            }

            this.getOrInitPageWithId(pageAjaxData.id).update(pageAjaxData, this);
        }
    }

    if (data.hasOwnProperty("tree")) {
        throw "Structured tree update is deprecated!";

    } else if (data.hasOwnProperty("flatTree")) {
        this._loadFlatTreePages(data.flatTree);
        //var updatedTree = this._buildTreeFromFlatTree(data.flatTree, childrenOfParents, parentsOfChildren, this.getPageById(1));
        this.treeRoot = this.getPageById(1);
        this.treeLoaded = true;
        this.upToDate = true;
        console.log("Loaded treeRoot");
        this._triggerTreeChanged();
    }
};

/*MedmanualTree.prototype._createFlatPagesFromTree = function (pageAjaxData) {
 if (this.getPageById(pageAjaxData.id) === null) {
 this.flatPages[pageAjaxData.id + ""] = new Page(pageAjaxData.id);
 } else {
 this.getPageById(pageAjaxData.id).update_clearParents();
 }
 
 for (var i = 0; i < pageAjaxData.children.length; i++) {
 this._createFlatPagesFromTree(pageAjaxData.children[i]);
 }
 };*/

/*MedmanualTree.prototype._buildTree = function (pageAjaxData) {
 var page = this.getPageById(pageAjaxData.id);
 page.update(pageAjaxData, this);
 for (var i = 0; i < pageAjaxData.children.length; i++) {
 var child = this._buildTree(pageAjaxData.children[i]);
 child.update_addParent(page);
 }
 return page;
 };*/

MedmanualTree.prototype._loadFlatTreePages = function (flatTreePages) {
    var groupedById = {};

    for (var i in flatTreePages) {
        var pageAjaxData = flatTreePages[i];
        if (!groupedById.hasOwnProperty("" + pageAjaxData.id)) {
            pageAjaxData.parents = [];
            groupedById["" + pageAjaxData.id] = pageAjaxData;
        }
        if (typeof pageAjaxData.parent_id !== 'undefined' && pageAjaxData.parent_id !== null) {
            groupedById["" + pageAjaxData.id].parents.push({id: pageAjaxData.parent_id});
        }
    }

    for (var key in groupedById) {
        var pageAjaxData = groupedById[key];
        var page = this.getOrInitPageWithId(pageAjaxData.id);
        page.update(pageAjaxData);
    }
};

/*MedmanualTree.prototype._buildTreeFromFlatTree = function (flatTreePages, childrenOfParents, parentsOfChildren, page) {
 var pageAjaxData = null;
 for (var i = 0; i < flatTreePages.length; i++) {
 if (flatTreePages[i].id !== null && parseInt(flatTreePages[i].id) === parseInt(page.id)) {
 pageAjaxData = flatTreePages[i];
 }
 }
 pageAjaxData.children = [];
 pageAjaxData.parents = [];
 if (childrenOfParents.hasOwnProperty(pageAjaxData.id + ""))
 pageAjaxData.children = childrenOfParents[pageAjaxData.id + ""];
 if (parentsOfChildren.hasOwnProperty(pageAjaxData.id + ""))
 pageAjaxData.parents = parentsOfChildren[pageAjaxData.id + ""];
 
 
 page.update(pageAjaxData, this);
 for (var i = 0; i < page.children.length; i++) {
 this._buildTreeFromFlatTree(flatTreePages, childrenOfParents, parentsOfChildren, page.children[i]);
 }
 return page;
 };*/

//editing
MedmanualTree.prototype.unlinkPageFromParent = function (page, parent, callback) {
    /*if (page.hasParentOfId(parent.id)) {
     console.log("Removing parent " + parent.id);
     page.removeParent(parent);
     this.savePage(page, callback);
     } else {
     throw "Page does not belong to this parent";
     callback(true);
     }*/
    throw "Unlinking from parent is not yet implemented";
};

MedmanualTree.prototype.addChildToPage = function (page, child, callback) {
    /*if (!child.hasParentOfId(page.id)) {
     console.log("Removing parent " + parent.id);
     child.addParent(page);
     this.savePage(child, callback);
     } else {
     throw "Page does not belong to this parent";
     callback(false);
     }*/
    throw "Adding child to page is not yet implemented";
};

MedmanualTree.prototype.savePage = function (page, callback) {
    /*var saveData = page.getSaveObject();
     
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
     });*/
    throw "Saving page is not yet implemented";
};

MedmanualTree.prototype.saveNewPage = function (saveData, callback) {
    var that = this;
    mmRequestJson('pages/jsonSave/new', saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            console.log(data);
            that.parseAndLoadData(data, null);
            var newPage = that.getPageById(data.pages[0].id);
            that._triggerTreeChanged();
            callback(true, newPage);
        } else {
            callback(false, 'Could not save new page. Error: ' + errorData);
        }
    });
};


//events
MedmanualTree.prototype._triggerTreeChanged = function () {
    for (var i = 0; i < this.onTreeChangeCallbacks.length; i++) {
        this.onTreeChangeCallbacks[i]();
    }
};

MedmanualTree.prototype.onTreeChange = function (callback) {
    this.onTreeChangeCallbacks.push(callback);
};

//mmRequestPost(url, method, dataIn, callback)