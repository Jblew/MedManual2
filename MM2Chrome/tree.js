/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree, mm */

$(document).ready(function () {
    var isEditor = typeof findGetParameter("editor") !== 'undefined' && findGetParameter("editor") !== null;
    
    var pageId = findGetParameter("pageId");
    if(typeof pageId === 'undefined' || pageId === null || parseInt(pageId) < 1) pageId = null;
    
    if(isEditor) {
        var page = (pageId !== null? mm().mmTree.getPageById(pageId) : null);
        if(typeof page === 'undefined') page = null;
        var pageEditor = new PageEditor(page);
        $("#editor-container").html(pageEditor.getHtml());
        pageEditor.init();
        
        pageEditor.onChange(function(isModified) {
            document.title = (isModified? "* " : "") + (pageEditor.titleInput.getValue()) + " – MM2 Editor";
        });
        document.title = (pageEditor.titleInput.getValue()) + " – MM2 Editor";
        
        $(document).on('keypress', function(e) {
            if(e.ctrlKey && e.key === "s") {
                pageEditor.save();
            }
        });
        
        window.pageEditor = pageEditor;
    }
    else {
        var treeEditor = new TreeEditor("#editor-container");
        if(mm().mmTree.isTreeLoaded()) treeEditor.updateTree();
    }
    
    $(document).on('keypress', function(e) {
            if(e.ctrlKey && e.key === "n") {
                PageEditor.openInNewWindow(null);
            }
        });
});