function Page(id_) {
    this.id = id_;
    this.title = "";
    this.body = "";
    this.tags = [];
    this.children = [];
    this.parents = [];
}

Page.prototype.update = function (pageAjaxData, medmanualTree) {
    if (pageAjaxData.hasOwnProperty("title"))
        this.title = pageAjaxData.title;
    if (pageAjaxData.hasOwnProperty("body"))
        this.body = pageAjaxData.body;
    if (pageAjaxData.hasOwnProperty("tags"))
        this.body = pageAjaxData.tags;
    if (pageAjaxData.hasOwnProperty("children")) {
        this.children = [];
        for (var i = 0; i < pageAjaxData.children.length; i++) {
            this.children[i] = medmanualTree.getPageById(pageAjaxData.children[i].id);
        }
    }
    
    if (pageAjaxData.hasOwnProperty("parents")) {
        this.parents = [];
        for (var i = 0; i < pageAjaxData.parents.length; i++) {
            this.addParent(medmanualTree.getPageById(pageAjaxData.parents[i].id));
        }
    }
};

Page.prototype.hasChildOfId = function(id_) {
    for(var i = 0;i < this.children.length;i++) {
        if(this.children[i].id === id_) return true;
    }
    return false;
};

Page.prototype.hasParentOfId = function(id_) {
    for(var i = 0;i < this.parents.length;i++) {
        if(this.parents[i].id === id_) return true;
    }
    return false;
};

Page.prototype.clearParents = function() {
    this.parents = [];
};

Page.prototype.addParent = function (page) {
    if(!this.hasParentOfId(page.id)) this.parents.push(page);
};

Page.prototype.addChild = function (page) {
    if(!this.hasChildOfId(page.id)) this.children.push(page);
};