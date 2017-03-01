/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree, mm */

var treeEditorUid = 0;
function TreeEditor(containerSelector_) {
    this.mmTree = mm().mmTree;
    this.containerSelector = containerSelector_;
    this.id = "tree-editor"+treeEditorUid;
    
    var that = this;
    this.mmTree.onTreeChange(function() {
        that.updateTree();
    });
}

TreeEditor.prototype.init = function () {

};
TreeEditor.prototype.updateTree = function () {
    var links = [];
    var treeHtml = "<ul>";
    treeHtml += this._getNodeHtml(this.mmTree.getTreeRoot(), links, null);
    treeHtml += "</ul>";
    $(this.containerSelector).html(treeHtml);
    for (var i = 0; i < links.length; i++)
        links[i].initCallback();
};

TreeEditor.prototype._getNodeHtml = function (page, links, callingParent) {
    var dropdown;
    var that = this;
    var editPageLink = new Link("Edit page").withIcon("edit").withCallback(function () {
        PageEditor.openInNewWindow(page);
    });
    var inlineEditLink = new Link("Inline edit").withIcon("edit").withCallback(function () {
        
        var inlineEditor = new PageEditor(page);
        dropdown.get$().after(inlineEditor.getHtml());
        inlineEditor.init();
    });
    var editParentsLink = new Link("Edit parents").withIcon("home").withCallback(function () {
        that.showEditParentsDialog(page);
    });
    var addChildLink = new Link("Add child").withIcon("leaf").withCallback(function () {
        that.showAddChildDialog(page);
    });
    var removeFromParentLink = new Link("Remove from this parent").withIcon("home").withCallback(function () {
        if (callingParent !== null) {
            that.showRemoveFromParentDialog(page, callingParent);
        }
    });
    links.push(editPageLink);
    links.push(editParentsLink);
    links.push(addChildLink);
    links.push(removeFromParentLink);
    links.push(inlineEditLink);

    dropdown = new Dropdown(page.title)
            .addItem(editPageLink.getHtml())
            .addItem(inlineEditLink.getHtml())
            .addItem(editParentsLink.getHtml())
            .addItem(addChildLink.getHtml())
            .addItem(removeFromParentLink.getHtml())
            .addSeparator();

    if (page.parents.length > 0) {
        dropdown.addHeader("Parents");
        for (var i = 0; i < page.parents.length; i++) {
            dropdown.addItem("&nbsp;&nbsp;&nbsp;" + page.parents[i].title);
        }
    }

    if (page.children.length > 0) {
        dropdown.addHeader("Children");
        for (var i = 0; i < page.children.length; i++) {
            dropdown.addItem("&nbsp;&nbsp;&nbsp;" + page.children[i].title);
        }
    }

    var out = "<li>" + dropdown.getHtml() + "<ul>";

    for (var i = 0; i < page.children.length; i++) {
        out += this._getNodeHtml(page.children[i], links, page);
    }

    out += "</ul></li>";
    return out;
};

TreeEditor.prototype.showEditParentsDialog = function (page) {
    var that = this;
    var modal = new Modal("Edit parents of \"" + page.title + "\" (#" + page.id + ")");
    modal.withContent("");

    var cancelButton = new Link("Cancel").withCallback(function () {
        modal.close();
    });

    var saveButton = new Link("Save").withCallback(function () {
        that.mmTree.unlinkPageFromParent(page, parent, function () {
            console.log("Unlinked");
            modal.close();
        });
    });

    modal.addButton(cancelButton.getButtonHtml('default'));
    modal.addButton(saveButton.getButtonHtml('primary'));
    modal.show();

    cancelButton.initCallback();
    saveButton.initCallback();
};

TreeEditor.prototype.showAddChildDialog = function (page) {
    var that = this;
    var modal = new Modal("Add child to \"" + page.title + "\" (#" + page.id + ")");
    var content = "";

    var pageSelector = new PageSelector(this.mmTree, null);
    content += "<div>Select page: ";
    content += pageSelector.getHtml();
    content += " </div>";

    content += "<hr />";

    var newInput = new Input().name("newpage");
    content += "<div>or Create new page (type title): ";
    content += newInput.getHtml();
    content += " </div>";

    modal.withContent(content);

    var addChild = function (callback) {
        try {
            if (pageSelector.getSelectedPage() !== null) {
                var newChild = pageSelector.getSelectedPage();
                that.mmTree.addChildToPage(page, newChild, function (success) {
                    if (success) {
                        callback(newChild);
                    } else {
                        modal.displayError("Error: could not save");
                    }
                });
            } else if (newInput.getValue().trim() !== "") {
                var newPage = new Page(null);
                newPage.parents.push(page);
                newPage.parentsLoaded = true;
                newPage.title = newInput.getValue();
                newPage.titleLoaded = true;
                that.mmTree.saveNewPage(newPage, function (success, createdPage) {
                    if (success) {
                        callback(createdPage);
                    } else {
                        modal.displayError("Error: could not create new page: "+createdPage);
                    }
                });
            } else
                modal.displayError("Please specify the child");
        } catch (msg) {
            modal.displayError("Error: " + msg);
        }

    };

    var cancelButton = new Link("Cancel").withCallback(function () {
        modal.close();
    });

    var addAndQuitButton = new Link("Add child").withCallback(function () {
        addChild(function (child) {
            if (child !== null)
                modal.close();
        });

    });

    var addAndEditButton = new Link("Add & edit child").withCallback(function () {
        addChild(function (child) {
            if (child !== null) {
                PageEditor.openInNewWindow(child);
                modal.close();
            }
        });
    });

    modal.addButton(cancelButton.getButtonHtml('default'));
    modal.addButton(addAndEditButton.getButtonHtml('info'));
    modal.addButton(addAndQuitButton.getButtonHtml('primary'));
    modal.show();

    cancelButton.initCallback();
    addAndQuitButton.initCallback();
    addAndEditButton.initCallback();
    pageSelector.init();
};

TreeEditor.prototype.showRemoveFromParentDialog = function (page, parent) {
    var that = this;
    var modal = new Modal("Remove #" + page.id + " from parent #" + parent.id + "?")
            .withContent("Are you sure, you want to remove page"
                    + " <strong>" + page.title + "</strong>(#" + page.id + ") from its parent "
                    + " <strong>" + parent.title + "</strong>(#" + parent.id + ") ?");

    var cancelButton = new Link("Cancel").withCallback(function () {
        modal.close();
    });

    var unlinkButton = new Link("Unlink parent").withCallback(function () {
        that.mmTree.unlinkPageFromParent(page, parent, function () {
            console.log("Unlinked");
            modal.close();
        });
    });

    modal.addButton(cancelButton.getButtonHtml('default'));
    modal.addButton(unlinkButton.getButtonHtml('danger'));
    modal.show();

    cancelButton.initCallback();
    unlinkButton.initCallback();
};