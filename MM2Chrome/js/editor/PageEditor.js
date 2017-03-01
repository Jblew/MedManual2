/* global WindowManager, mm */

var pageEditorUid = 0;

function PageEditor(page_) {
    this.page = page_;

    this.id = "page-editor-" + pageEditorUid;
    pageEditorUid++;

    this.titleInput = new Input().type("text").placeholder("Page title").value(this.page.title);
    this.parentsForm = new ParentsForm(mm().mmTree, this.page, "parentsids");
}

PageEditor.prototype.getHtml = function () {
    return ''
            + '<div class=\"page-editor-wrapper\" id="'+this.id+'-wrapper">'
            + ' <div class=\"page-editor-main\" id="'+this.id+'-main">'
            + '     <a class="close" aria-label="Close" id="'+this.id+'-close"><span aria-hidden="true">&times;</span></a>'
            + '     '
            + '     '+this.titleInput.getHtml()
            + '     '+this.parentsForm.getHtml();
            + ' </div>'
            + '</div>';
};

PageEditor.prototype.init = function () {
    var that = this;
    $("#"+this.id+"-close").on('click', function() {
        that.close();
    });
    
    this.parentsForm.init();
};

PageEditor.prototype.close = function () {
    $("#"+this.id+"-wrapper").remove();
};

/**
 * Static functions:
 */

PageEditor.openInNewWindow = function (page) {
    WindowManager.getInstance().open('editor.html?pageId=' + page.id, 600, 800);
};

