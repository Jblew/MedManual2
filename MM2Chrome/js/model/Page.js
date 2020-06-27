/* global mm, Lockr */

function Page(id_, mmTree) {
    if (typeof id_ === 'undefined' || id_ === null || id_ < 1)
        throw "Page must be loaded with id. Id must be greater than 0.";
    if (typeof mmTree === 'undefined' || mmTree === null)
        mmTree = mm().mmTree;

    this.id = id_;

    this.title = "";
    this.titleLoaded = false;

    this.body = "";
    this.bodyLoaded = false;

    this.tags = [];
    this.tagsLoaded = false;

    this.children = [];

    this.parents = [];
    this.parentsLoaded = false;

    this.structureModified = false;
    this.contentModified = false;

    this.callbacks = [];

    var potentialLocalMe = Lockr.get("page_" + this.id, null);
    if (potentialLocalMe !== null) {
        this.update(potentialLocalMe, mmTree);
        //console.log("Page loaded from localStorage #"+this.id);
    } else {
        console.log('Key "page_' + this.id + '" does not exist in local storage');
    }
    //console.log("Page creation");

    var that = this;
    this.callbacks.push(function (eventType, me, data) {
        that.safeSave(false);
    });
}

Page.prototype.isFullyLoaded = function () {
    return this.titleLoaded && this.bodyLoaded && this.tagsLoaded && this.parentsLoaded;
};

Page.prototype.isModified = function () {
    return this.structureModified || this.contentModified;
};

Page.prototype.isNewPage = function () {
    throw new "Cannot directly create new pages!";
};

Page.prototype.getDomId = function () {
    return "page-" + this.id;
};

//loading & updating functions
Page.prototype.update = function (pageAjaxData, mmTree) {
    if (typeof mmTree === 'undefined' || mmTree === null)
        mmTree = mm().mmTree;

    if (this.isModified())
        throw "Cannot update page. It was modified (structureModified="+this.structureModified+", contentModified="+this.contentModified+"). Save changes before updating";
    if (pageAjaxData.hasOwnProperty("title")) {
        this.title = pageAjaxData.title;
        this.titleLoaded = true;
    }
    if (pageAjaxData.hasOwnProperty("body")) {
        this.body = pageAjaxData.body;
        this.bodyLoaded = true;
    }
    if (pageAjaxData.hasOwnProperty("tags")) {
        this.tags = [];
        if(pageAjaxData.tags.length > 0) {
            if(typeof pageAjaxData.tags[0] === 'object') {
                for(var i = 0;i < pageAjaxData.tags.length;i++) {
                    this.tags.push(pageAjaxData.tags[i].tag);
                }
            }
            else this.tags = pageAjaxData.tags;
        }
        
        this.tagsLoaded = true;
    }
    if (pageAjaxData.hasOwnProperty("structureModified")) {
        this.structureModified = pageAjaxData.structureModified;
    }
    if (pageAjaxData.hasOwnProperty("contentModified")) {
        this.contentModified = pageAjaxData.contentModified;
    }

    if (pageAjaxData.hasOwnProperty("parents")) {
        this.parents = [];
        for (var i = 0; i < pageAjaxData.parents.length; i++) {
            this._addParent(mmTree.getOrInitPageWithId(pageAjaxData.parents[i].id));
        }
        this.parentsLoaded = true;
    }
    this.safeSave(true);
    this.trigger('update', {});
};

Page.prototype.hasChildOfId = function (id_) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id + "" === id_ + "")
            return true;
    }
    return false;
};

Page.prototype.hasParentOfId = function (id_) {
    for (var i = 0; i < this.parents.length; i++) {
        if (this.parents[i].id + "" === id_ + "")
            return true;
    }
    return false;
};

Page.prototype._addParent = function (page) {
    if (!this.hasParentOfId(page.id)) {
        this.parents.push(page);
        this.parentsLoaded = true;

        if (!page.hasChildOfId(this.id)) {
            page.children.push(this);
            page.children.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            page.trigger('childrenChanged', {});
        }
    }
};

//editing functions
Page.prototype.changeTitle = function (newTitle) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousTitle = this.title + "";
    this.title = newTitle;
    this.contentModified = true;
    this.safeSave(false);
    this.trigger('titleChanged', {previous: previousTitle, current: this.title + ""});
};

Page.prototype.changeBody = function (newBody) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousBody = this.body + "";
    this.body = newBody;
    this.contentModified = true;
    this.safeSave(false);
    this.trigger('bodyChanged', {previous: previousBody, current: this.body + ""});

};

Page.prototype.changeTags = function (newTags) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousTags = this.tags.slice();
    this.tags = newTags;
    this.contentModified = true;
    this.safeSave(false);
    this.trigger('tagsChanged', {previous: previousTags, current: this.tags.slice()});
};

Page.prototype.changeParents = function (newParents, mmTree) {
    if (!(this.parentsLoaded))
        throw "Page must have parents and children loaded before structure modifications";
    var previousParents = this.parents.slice();

    this.parents = newParents.slice();

    var addedParents = newParents.filter(function (el) {
        return previousParents.indexOf(el) < 0;
    });
    var removedParents = previousParents.filter(function (el) {
        return newParents.indexOf(el) < 0;
    });

    for (var k in addedParents) { //add children to added parents
        var parent = addedParents[k];
        if (!parent.hasChildOfId(this.id)) {
            parent.children.push(this);
            parent.children.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            parent.trigger('childrenChanged', {});
        }
    }

    for (var k in removedParents) {//remove child from removed parents
        var parent = removedParents[k];
        if (parent.hasChildOfId(this.id)) {
            for (var i = 0; i < parent.children.length; i++) {
                if (parent.children[i].id === this.id)
                    parent.children.splice(i, 1);
            }
            parent.trigger('childrenChanged', {});
        }
    }

    this.structureModified = true;
    this.safeSave(false);
    mmTree.triggerTreeStructureChanged();
    this.trigger('parentsChanged', {type: 'change', previous: previousParents, current: this.parents.slice()});

};

Page.prototype.addParent = function (parent, mmTree) {
    var newParents = this.parents.slice();
    newParents.push(parent);
    //console.log("");
    this.changeParents(newParents, mmTree);
};

Page.prototype.removeParent = function (parent, mmTree) {
    var newParents = this.parents.slice();
    for (var i = 0; i < newParents.length; i++) {
        if (newParents[i].id === parent.id)
            newParents.splice(i, 1);
    }
    this.changeParents(newParents, mmTree);
};

Page.prototype.moveBetweenParents = function (previousParent, newParent, mmTree) {
    var newParents = this.parents.slice();
    for (var i = 0; i < newParents.length; i++) {
        if (newParents[i].id === previousParent.id)
            newParents.splice(i, 1);
    }
    newParents.push(newParent);
    this.changeParents(newParents, mmTree);
};


//saving editions
Page.prototype.getSaveObject = function (isLocal) {
    if (typeof isLocal === 'undefined' || isLocal === null)
        isLocal = false;

    var save = new Object();

    if (this.titleLoaded) {
        save.title = this.title;
    }
    if (this.bodyLoaded) {
        save.body = (isLocal ? this.body : this.body.replace("\n", "[newline]"));
    }
    if (this.tagsLoaded) {
        if (isLocal)
            save.tags = this.tags;
        else
            save.tagsnames = this.tags.join(",");
    }

    if (this.parentsLoaded) {
        if (isLocal) {
            save.parents = [];
            for (var i = 0; i < this.parents.length; i++)
                save.parents.push({id: this.parents[i].id});
        } else {
            save.parentsids = "";
            for (var i = 0; i < this.parents.length; i++)
                save.parentsids += this.parents[i].id + ",";
        }
    }

    if (isLocal) {
        save.structureModified = this.structureModified;
        save.contentModified = this.contentModified;
    }

    return save;
};

Page.prototype.safeSave = function (isOnlyLocal) {
    var saveObj = this.getSaveObject(true);
    Lockr.set("page_" + this.id, saveObj);

    if (!isOnlyLocal) {
        //modified pages are saved in mmTree object with cyclic worker
    }
};

Page.prototype.markSaved = function (saveData) {
    if (this.structureModified) {
        if (saveData.hasOwnProperty("parents")) {
            if (saveData.parents.length === this.parents.length) {
                var saveCorrect = true;
                for (var i = 0; i < saveData.parents.length; i++) {
                    if (!this.hasParentOfId(parseInt(saveData.parents[i].id))) {
                        saveCorrect = false;
                    }
                }
                if (saveCorrect) {
                    this.structureModified = false;
                    this.safeSave(true);
                }
            }
        }
    }
    if (this.contentModified) {
        var _body = this.body;
        if(_body.endsWith("\n")) _body = _body.substr(0, _body.length-1);
        saveData.tags = saveData.tags.map(function(v) {
            if(typeof v === 'object') return v.tag;
            else return v;
        });
        
        if (saveData.hasOwnProperty("title") && this.title === saveData.title
                && saveData.hasOwnProperty("body") && _body === saveData.body
                && saveData.hasOwnProperty("tags") && this.tags.join(",") === saveData.tags.join(",")) {
            this.contentModified = false;
            this.safeSave(true);
        }
        else {
            throw "Content structure improper: "
            +(this.title !== saveData.title? "title("+this.title+"="+saveData.title+"), " : "")
            +(_body !== saveData.body? "body("+_body+"="+saveData.body+"), " : "")
            +(this.tags !== saveData.tags? "tags("+this.tags+"="+saveData.tags+"), " : "");
        }
    }
};

//parents paths
Page.prototype.getParentPaths = function () {
    var paths_ = [];
    this._getPaths(this, [], paths_);
    return paths_;
};

Page.prototype._getPaths = function (page, childrenPath_, paths_) {
    var childrenPath = childrenPath_.slice();
    if (parseInt(page.id) === 1) {
        childrenPath.unshift(page);
        paths_.push(childrenPath);
    } else {
        childrenPath.unshift(page);
        for (var i = 0; i < page.parents.length; i++) {
            var parent = page.parents[i];
            this._getPaths(parent, childrenPath, paths_);
        }
    }
};

//events
Page.prototype.onChange = function (callback) {
    this.callbacks.push(callback);
};

Page.prototype.on = function (desiredEventType, callback) {
    this.callbacks.push(function (eventType, page, data) {
        if (eventType === desiredEventType) {
            callback(page, data);
        }
    });
};

Page.prototype.trigger = function (eventType, data) {
    for (var i = 0; i < this.callbacks.length; i++) {
        this.callbacks[i](eventType, this, data);
    }
};