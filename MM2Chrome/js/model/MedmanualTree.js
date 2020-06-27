/* global mm, Lockr */

function MedmanualTree() {
    this.upToDate = false;
    this.treeLoaded = false;
    this.flatPages = new Object();
    this.onTreeChangeCallbacks = [];

    this.treeRoot = null;
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
    //console.log({msg: "Tree loaded from localStorage", flatTree: this.flatPages});
    this._triggerTreeChanged();

    var that = this;
    this.load(function () {//load only structure
        that._triggerTreeChanged();
        that.load(function () {//full pages load
            that._triggerTreeChanged();

            setTimeout(function () {//start uploading agent
                that.saveWorker(that, null);
            }, 1000);
        }, true);
    }, false); //load only structure


};

MedmanualTree.prototype.load = function (callback, isFull) {
    var that = this;
    this.saveWorker(this, function () {
        mmRequestPost('pages/ajaxFlatTree' + (isFull ? '/full' : ''), 'get', {}, function (data, isSuccess, errorData) {
            if (isSuccess) {
                that.parseAndLoadData(data, null);
                that.upToDate = true;
                that.treeLoaded = true;
                if (callback !== null)
                    callback(that.treeRoot);
            } else {
                mm().getErrorLogger().error('Could not get tree. Error: ' + errorData);
            }
        });
    });
};

MedmanualTree.prototype.parseAndLoadData = function (data, editedPage) {
    if (data.hasOwnProperty("pages")) {
        for (var i = 0; i < data.pages.length; i++) {
            var pageAjaxData = data.pages[i];
            pageAjaxData.id = parseInt(pageAjaxData.id);
            if (editedPage !== null && parseInt(editedPage.id) === pageAjaxData.id) {
                editedPage.markSaved(pageAjaxData);
            }
            try {
                this.getOrInitPageWithId(pageAjaxData.id).update(pageAjaxData, this);
            } catch (msg) {
                console.log("Cannot update page at the moment: " + msg);
            }
        }
    }

    if (data.hasOwnProperty("flatTree")) {
        this._loadFlatTreePages(data.flatTree);
        //var updatedTree = this._buildTreeFromFlatTree(data.flatTree, childrenOfParents, parentsOfChildren, this.getPageById(1));
        this.treeRoot = this.getPageById(1);
        this.treeLoaded = true;
        this.upToDate = true;
        this._triggerTreeChanged();
    }
};

MedmanualTree.prototype.getModifiedPages = function () {
    var modifiedPages = [];
    for (var k in this.flatPages) {
        if (this.flatPages[k].isModified())
            modifiedPages.push(this.flatPages[k]);
    }
    return modifiedPages;
};

MedmanualTree.prototype.saveWorker = function (that, doneCallback) {
    var modifiedPages = that.getModifiedPages();
    //mm().getWindowManager().everyWindow(function (window) {
    //    $(".unsaved-pages-counter", window.document).text(modifiedPages.length + "");
    //});
    $(".unsaved-pages-counter").text(modifiedPages.length + "");

    if (modifiedPages.length > 0) {
        that.uploadPage(modifiedPages[0], function (isSuccess) {
            if (isSuccess)
                setTimeout(function () {
                    that.saveWorker(that, doneCallback);
                }, 50);
            else
                setTimeout(function () {
                    that.saveWorker(that, doneCallback);
                }, 11000);
        });
    } else {
        if (typeof doneCallback !== 'undefined' && doneCallback !== null)
            doneCallback();
        else {
            setTimeout(function () {
                that.saveWorker(that, null);
            }, 2500);
        }
    }
};

MedmanualTree.prototype.uploadPage = function (page, callback) {
    var saveData = page.getSaveObject(false);

    var that = this;
    mmRequestJson('pages/jsonSave/' + page.id, saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
            that.parseAndLoadData(data, page);
            callback(true);
        } else {
            console.error('Could not save page. Error: ' + errorData);
            callback(false);
        }
    });
};

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
        try {
            page.update(pageAjaxData, this);
        } catch (msg) {
            console.log("Cannot update page at the moment: " + msg);
        }
    }
};

MedmanualTree.prototype.saveNewPage = function (saveData, callback) {
    var that = this;
    mmRequestJson('pages/jsonSave/new', saveData, function (data, isSuccess, errorData) {
        if (isSuccess) {
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

MedmanualTree.prototype.triggerTreeStructureChanged = function () {
    this._triggerTreeChanged();
};

MedmanualTree.prototype.onTreeChange = function (callback) {
    this.onTreeChangeCallbacks.push(callback);
};

//mmRequestPost(url, method, dataIn, callback)