/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree, mm */

$(document).ready(function () {
    var isEditor = typeof findGetParameter("editor") !== 'undefined' && findGetParameter("editor") !== null;
    
    var pageId = findGetParameter("pageId");
    if(typeof pageId === 'undefined' || pageId === null || pageId < 1) pageId = 0;
    
    if(isEditor) {
        var page = mm().mmTree.getPageById(pageId);
        if(typeof page === 'undefined') page = null;
        var pageEditor = new PageEditor(page);
        $("#editor-container").html(pageEditor.getHtml());
        pageEditor.init();
        pageEditor.onChange(function(isModified) {
            document.title = (isModified? "* " : "") + (pageEditor.titleInput.getValue()) + " – MM2 Editor";
        });
        document.title = (pageEditor.titleInput.getValue()) + " – MM2 Editor";
    }
    else {
        var treeEditor = new TreeEditor("#editor-container");
        if(mm().mmTree.isTreeLoaded()) treeEditor.updateTree();
    }
});