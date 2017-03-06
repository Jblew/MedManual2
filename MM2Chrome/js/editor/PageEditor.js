/* global WindowManager, mm, Backdrop, rangy */

var pageEditorUid = 0;

function PageEditor(page_) {
    this.page = page_;

    this.id = "page-editor-" + pageEditorUid;
    pageEditorUid++;

    this.titleInput = new Input().type("multiline-adapt").class("page-title").value((this.page === null ? "" : this.page.title));
    this.parentsForm = new ParentsForm(mm().mmTree, (this.page === null ? null : this.page), "parentsids");
    this.tagsInput = new Input().type("text").placeholder("Tags");
    this.markdownEditor = new MarkdownEditor();
    this.dropUploader = new ImageDropUploader().onUpload(function (htmlToInsert) {
        var rangyAnchor = $(rangy.getSelection().anchorNode);
        console.log(rangyAnchor);
        if (rangyAnchor.hasClass("md-editor"))
            rangyAnchor.append(htmlToInsert);
        else if (rangyAnchor.is("div"))
            rangyAnchor.after(htmlToInsert);
        else
            rangyAnchor.closest("div").after(htmlToInsert);
    });

    var that = this;
    this.saveButton = new Link("Save").withIcon("floppy-disk").withCallback(function () {
        that.save();
    });

    var unloadPrompter = function() {return "Are you sure? There are unsaved changes!";};
    this.changeCallbacks = [function(isModified) {
            if(isModified) {
            $(window).on('beforeunload', unloadPrompter);
        }
        else {
            $(window).unbind('beforeunload', unloadPrompter);
        }
    }];
}

PageEditor.prototype.onChange = function (callback) {
    this.changeCallbacks.push(callback);
};

PageEditor.prototype.getHtml = function () {
    return ''
            + '<div class=\"page-editor-wrapper\" id="' + this.id + '-wrapper">'
            + ' <div class=\"page-editor-main\" id="' + this.id + '-main">'
            //+ '     <a class="close" aria-label="Close" id="'+this.id+'-close"><span aria-hidden="true">&times;</span></a>'
            + '     '
            + '     ' + this.titleInput.getHtml()
            + '     '
            + '     <div id="' + this.id + '-collapser" class="editor-details-collapser"></div>'
            + '     <div id="' + this.id + '-details" class="collapse in">'
            + '         ' + this.parentsForm.getHtml()
            + '         <div class="children-field ' + this.id + '-children-field"></div>'
            + '         ' + this.tagsInput.getHtml()
            + '     </div>'
            + '     '
            + '     ' + this.markdownEditor.getHtml()
            + '     <div class="children-field ' + this.id + '-children-field"></div>'
            + '     ' + this.saveButton.getButtonHtml("primary")
            + ' </div>'
            + '</div>';
};

PageEditor.prototype.init = function () {
    var that = this;

    this.titleInput.init();
    this.parentsForm.init();
    this.markdownEditor.init();
    if (this.page !== null && this.page.isFullyLoaded()) {
        this.markdownEditor.setContent(this.page.body);
        this.tagsInput.setValue(this.page.tags.join(", "));
    }
    this.saveButton.initCallback();
    this.dropUploader.init(this.markdownEditor.getContenteditable$());

    if (this.page !== null && !this.page.isFullyLoaded()) {
        Backdrop.show();
        var that = this;
        this.page.on('update', function (page, data) {
            if (page.isFullyLoaded()) {
                Backdrop.hide();
                this.markdownEditor.setContent(this.page.body);
                this.tagsInput.setValue(this.page.tags.join(", "));
            }
        });

        this.page.on('childrenChanged', function (page, data) {
            that._updateChildrenField();
        });
    }

    this._initChangeCallbacks();

    $('#' + this.id + '-collapser').on('click', function () {
        $('#' + that.id + '-details').collapse('toggle');
    });

    this._updateChildrenField();
    
};

PageEditor.prototype.save = function () {
    if (this.page === null) {
        var saveData = {title: this.titleInput.getValue(), body: this.markdownEditor.getMarkdown(), tagsnames: this.tagsInput.getValue(), parentsids: this.parentsForm.getParentsIdsStr()};

        var that = this;
        mm().mmTree.saveNewPage(saveData, function (isSuccess, page_) {
            if (isSuccess) {
                that.page = page_;
                that.setSaved();
            }
        });
    } else {
        this.page.changeTitle(this.titleInput.getValue());
        this.page.changeBody(this.markdownEditor.getMarkdown());
        var tags = this.tagsInput.getValue().split(",");
        var tagsTrimmed = [];
        for (var k in tags) {
            tagsTrimmed.push(tags[k].trim());
        }
        this.page.changeTags(tagsTrimmed);
        this.page.changeParents(this.parentsForm.getSelectedParents(), mm().mmTree);
        this.setSaved();
    }
};

PageEditor.prototype.close = function () {
    $("#" + this.id + "-wrapper").remove();
};

PageEditor.prototype._initChangeCallbacks = function () {
    var that = this;
    var commonCallback = function () {
        for (var k in that.changeCallbacks) {
            that.changeCallbacks[k](true);
        }
        that._updateChildrenField();
    };
    this.titleInput.onValueChange(commonCallback);
    this.tagsInput.onValueChange(commonCallback);
    this.markdownEditor.onContentChange(commonCallback);
    this.parentsForm.onChange(commonCallback);
};

PageEditor.prototype.isModified = function () {
    return this.titleInput.isModified()
            && this.tagsInput.isModified()
            && this.markdownEditor.isModified()
            && this.parentsForm.isModified();
};

PageEditor.prototype.setSaved = function () {
    this.titleInput.setSaved();
    this.tagsInput.setSaved();
    this.markdownEditor.setSaved();
    this.parentsForm.setSaved();

    for (var k in this.changeCallbacks) {
        this.changeCallbacks[k](false);
    }
};

PageEditor.prototype._updateChildrenField = function () {
    var childrenField$ = $('.' + this.id + '-children-field');
    var that = this;
    childrenField$.each(function (i, elem) {
        var html = "Children: ";

        var pageLinks = [];

        if (that.page !== null) {
            for (var k in that.page.children) {
                var pageLink = new PageLink(null, that.page.children[k]);
                pageLinks.push(pageLink);
                html += pageLink.getHtml() + ", ";
            }
        }

        $(elem).html(html);
        for (var k in pageLinks)
            pageLinks[k].init();
    });
};

/**
 * Static functions:
 */

PageEditor.openInNewWindow = function (page) {
    mm().getWindowManager().open('tree.html?editor=true&pageId=' + page.id, 600, 800);
};

