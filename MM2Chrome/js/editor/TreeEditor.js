/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree */

function TreeEditor(mmTree_, containerSelector_) {
    this.mmTree = mmTree_;
    this.containerSelector = containerSelector_;
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
    var that = this;
    var editPageLink = new Link("Edit page").withIcon("edit").withCallback(function () {
        PageEditor.openInNewWindow(page);
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

    var dropdown = new Dropdown(page.title)
            .addItem(editPageLink.getHtml())
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

};

TreeEditor.prototype.showAddChildDialog = function (page) {

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
        modal.close();
    });

    modal.addButton(cancelButton.getButtonHtml('default'));
    modal.addButton(unlinkButton.getButtonHtml('danger'));
    modal.show();
    
    cancelButton.initCallback();
    unlinkButton.initCallback();
};