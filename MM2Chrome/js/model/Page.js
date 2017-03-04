/* global mm, Lockr */

function Page(id_, mmTree) {
    if(typeof id_ === 'undefined' || id_ === null || id_ < 1) throw "Page must be loaded with id. Id must be greater than 0.";
    if(typeof mmTree === 'undefined' || mmTree === null) mmTree = mm().mmTree;
    
    this.id = id_;

    this.title = "";
    this.titleLoaded = false;

    this.body = "";
    this.bodyLoaded = false;

    this.tags = [];
    this.tagsLoaded = false;

    this.children = [];
    this.childrenLoaded = false;

    this.parents = [];
    this.parentsLoaded = false;

    this.structureModified = false;
    this.contentModified = false;
    
    this.callbacks = [];
    
    var potentialLocalMe = Lockr.get("page_"+this.id, null);
    if(potentialLocalMe !== null) {
        this.update(potentialLocalMe, mmTree);
        //console.log("Page loaded from localStorage #"+this.id);
    }
    else {
        console.log('Key "page_'+this.id+'" does not exist in local storage');
    }
    //console.log("Page creation");
    
    this.callbacks.push(function(eventType, me, data) {
        this.safeSave(false);
    });
}

Page.prototype.isFullyLoaded = function () {
    return this.titleLoaded && this.bodyLoaded && this.tagsLoaded && this.childrenLoaded && this.parentsLoaded;
};

Page.prototype.isModified = function () {
    return this.structureModified || this.contentModified;
};

Page.prototype.isNewPage = function () {
    throw new "Cannot directly create new pages!";
};

Page.prototype.getDomId = function () {
    return "page-"+this.id;
};

//loading & updating functions
Page.prototype.update = function (pageAjaxData, mmTree) {
    if(typeof mmTree === 'undefined' || mmTree === null) mmTree = mm().mmTree;
    
    if (this.isModified())
        throw "Cannot update page. It was modified. Save changes before updating";
    if (pageAjaxData.hasOwnProperty("title")) {
        this.title = pageAjaxData.title;
        this.titleLoaded = true;
    }
    if (pageAjaxData.hasOwnProperty("body")) {
        this.body = pageAjaxData.body;
        this.bodyLoaded = true;
    }
    if (pageAjaxData.hasOwnProperty("tags")) {
        this.tags = pageAjaxData.tags;
        this.tagsLoaded = true;
    }
    
    /*if (pageAjaxData.hasOwnProperty("children")) {
        this.children = [];
        for (var i = 0; i < pageAjaxData.children.length; i++) {
            if(!this.hasChildOfId(pageAjaxData.children[i].id)) this.children[i] = mm().mmTree.getPageById(pageAjaxData.children[i].id);
        }
        this.childrenLoaded = true;
    }*/

    if (pageAjaxData.hasOwnProperty("parents")) {
        this.parents = [];
        for (var i = 0; i < pageAjaxData.parents.length; i++) {
            this._addParent(mmTree.getOrInitPageWithId(pageAjaxData.parents[i].id));
        }
        this.parentsLoaded = true;
    }
    this.safeSave(true);
};

Page.prototype.hasChildOfId = function (id_) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id+"" === id_+"")
            return true;
    }
    return false;
};

Page.prototype.hasParentOfId = function (id_) {
    for (var i = 0; i < this.parents.length; i++) {
        if (this.parents[i].id+"" === id_+"")
            return true;
    }
    return false;
};

/*Page.prototype.update_clearParents = function () {
    this.parents = [];
    this.parentsLoaded = true;
};

Page.prototype.update_clearChildren = function () {
    this.children = [];
    this.childrenLoaded = true;
};*/

Page.prototype._addParent = function (page) {
    if (!this.hasParentOfId(page.id)) {
        this.parents.push(page);
        this.parentsLoaded = true;
        
        if(!page.hasChildOfId(this.id)) {
            page.children.push(this);
            page.children.sort(function(a, b) {
                return a.title.localeCompare(b.title);
            });
            page.childrenLoaded = true;
        }
    }
};

//editing functions
Page.prototype.changeTitle = function (newTitle) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousTitle = this.title+"";
    this.title = newTitle;
    this.contentModified = true;
    this.trigger('titleChanged', {previous: previousTitle, current: this.title+""});
};

Page.prototype.changeBody = function (newBody) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousBody = this.body+"";
    this.body = newBody;
    this.contentModified = true;
    this.trigger('bodyChanged', {previous: previousBody, current: this.body+""});

};

Page.prototype.changeTags = function (newTags) {
    if (!this.isFullyLoaded())
        throw "Page must be fully loaded before modifications";
    var previousTags = this.tags.splice();
    this.tags = newTags;
    this.contentModified = true;
    this.trigger('tagsChanged', {previous: previousTags, current: this.tags.splice()});
};

/*Page.prototype.changeParents = function (newParents) {
    if (!(this.parentsLoaded && this.childrenLoaded))
        throw "Page must have parents and children loaded before structure modifications";
    var previousParents = this.parents.splice();
    this.parents = [];
    this.parents = newParents;
    this.structureModified = true;
    this.trigger('parentsChanged', {previous: previousParents, current: this.parents.splice()})
};*/
/*
Page.prototype.removeParent = function (parent) {
    if (!(this.parentsLoaded && this.childrenLoaded))
        throw "Page must have parents ("+this.parentsLoaded+") and children ("+this.childrenLoaded+") loaded before structure modifications";
    console.log("Remove parent "+parent.id);
    var previousParents = this.parents.splice();
    for (var i = 0; i < this.parents.length; i++) {
        if (this.parents[i].id === parent.id)
            this.parents.splice(i, 1);
    }
    parent.removeChild(this.id);
    this.structureModified = true;
    this.trigger('parentsChanged', {type: 'remove', target: parent, previous: previousParents, current: this.parents.splice()})
};

Page.prototype.moveBetweenParents = function (sourceParent, targetParent) {
    if (!(this.parentsLoaded && this.childrenLoaded))
        throw "Page must have parents ("+this.parentsLoaded+") and children ("+this.childrenLoaded+") loaded before structure modifications";
    console.log("Move page from parent "+sourceParent.id+" to parent "+targetParent.id);
    var previousParents = this.parents.splice();
    for (var i = 0; i < this.parents.length; i++) {
        if (this.parents[i].id === sourceParent.id)
            this.parents.splice(i, 1);
    }
    sourceParent.removeChild(this.id);
    this.parents.push(targetParent);
    this.structureModified = true;
    this.trigger('parentsChanged', {type: 'move', source: sourceParent, target: targetParent, previous: previousParents, current: this.parents.splice()})
};

Page.prototype.addParent = function (parent) {
    if (!(this.parentsLoaded && this.childrenLoaded))
        throw "Page must have parents ("+this.parentsLoaded+") and children ("+this.childrenLoaded+") loaded before structure modifications";
    console.log("Add parent "+parent.id);
    if(!this.hasParentOfId(parseInt(parent.id))) {
        var previousParents = this.parents.splice();
        this.parents.push(parent);
        this.trigger('parentsChanged', {type: 'add', target: parent, previous: previousParents, current: this.parents.splice()})
    }
    parent.addChild(this.id);
    this.structureModified = true;
};

//changing children is only for tree reorganisation. Normally children are changed by changing their parents.
Page.prototype.addChild = function (page) {
    if (!this.hasChildOfId(page.id)) {
        this.children.push(page);
    }
};

Page.prototype.removeChild = function (page) {
    if (this.hasChildOfId(page.id)) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].id === page.id) {
                this.children.splice(i, 1);
            }
        }
    }
};
*/
//saving editions
Page.prototype.getSaveObject = function (isLocal) {
    if(typeof isLocal === 'undefined' || isLocal === null) isLocal = false;
    
    var save = new Object();
    
    if (this.titleLoaded) {
        save.title = this.title;
    }
    if (this.bodyLoaded) {
        save.body = (isLocal? this.body : this.body.replace("\n", "[newline]"));
    }
    if (this.tagsLoaded) {
        if(isLocal) save.tags = this.tags;
        else save.tagsnames = this.tags.join(",");
    }

    if (this.parentsLoaded) {
        if(isLocal) {
            save.parents = [];
            for (var i = 0; i < this.parents.length; i++)
            save.parents.push({id: this.parents[i].id});
        }
        else {
        save.parentsids = "";
        for (var i = 0; i < this.parents.length; i++)
            save.parentsids += this.parents[i].id + ",";
        }
    }

    return save;
};

Page.prototype.safeSave = function (isOnlyLocal) {
    if(isOnlyLocal) {
        var saveObj = this.getSaveObject(true);
        Lockr.set("page_"+this.id, saveObj);
    }
};

Page.prototype.markSaved = function (saveData) {
    var markSavedLog = "MK_SAVED:";
    if (this.structureModified) {
        markSavedLog+= " structure:{";
        if (saveData.hasOwnProperty("parents")) {
            if (saveData.parents.length === this.parents.length) {
                markSavedLog += "length_ok, ";
                var saveCorrect = true;
                for (var i = 0; i < saveData.parents.length; i++) {
                    console.log("Checking parent "+parseInt(saveData.parents[i].id));
                    if (!this.hasParentOfId(parseInt(saveData.parents[i].id))) {
                        saveCorrect = false;
                        console.log("The page "+this.id+" has not "+parseInt(saveData.parents[i].id)+" in parents: ");
                    }
                }
                if (saveCorrect) {
                    markSavedLog += "parents_identical";
                    this.structureModified = false;
                }
            }
        }
        markSavedLog+= "}";
    } else if (this.contentModified) {
        markSavedLog+= " content:{";
        if (saveData.hasOwnProperty("title") && this.title === saveData.title
                && saveData.hasOwnProperty("body") && this.body === saveData.body
                && saveData.hasOwnProperty("tags") && this.tags === saveData.tags) {
            this.contentModified = false;
            markSavedLog+= "correct";
        }
        else markSavedLog+= "incorrect";
        markSavedLog+= "}";
    } else {
        throw "Trying to markSaved unmodified page!";
    }
    console.log(markSavedLog);
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
    
    /*childPath_.unshift(page.id);
     
     if(page.id === 1) {
     return childPath_
     }
     else {
     
     }*/
};

//events
Page.prototype.onChange = function (callback) {
    this.callbacks.push(callback);
};

Page.prototype.on = function (desiredEventType, callback) {
    this.callbacks.push(function(eventType, page, data) {
        if(eventType === desiredEventType) {
            callback(page, data);
        }
    });
};

Page.prototype.trigger = function (eventType, data) {
    for(var i = 0;i < this.callbacks.length;i++) {
        this.callbacks[i](eventType, this, data);
    }
};

/*
 CREATE PROCEDURE get_paths_procedure(
 IN current_page_id INT,
 IN children_path VARCHAR (253)
 )
 BEGIN
 DECLARE my_parent_id INT;
 DECLARE bDone INT;
 DECLARE curs CURSOR FOR SELECT parent_id FROM pages_parents WHERE page_id=current_page_id;
 DECLARE CONTINUE HANDLER FOR NOT FOUND SET bDone = 1;
 
 
 IF current_page_id = 1 THEN
 INSERT INTO paths VALUES (CONCAT((SELECT title FROM pages WHERE id=current_page_id), '$$$', children_path));
 ELSE
 OPEN curs;
 SET bDone = 0;
 read_loop: LOOP
 FETCH curs INTO my_parent_id;
 IF bDone THEN
 LEAVE read_loop;
 END IF;
 #            INSERT INTO paths VALUES (my_parent_id);
 #            INSERT INTO paths VALUES (CONCAT((SELECT title FROM pages WHERE id=parent_id), '$$$', children_path));
 CALL get_paths_procedure(my_parent_id, CONCAT((SELECT title FROM pages WHERE id=current_page_id), '$$$', children_path));
 END LOOP;
 CLOSE curs;
 END IF;
 END$$
 * 
 */