/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree */

$(document).ready(function () {
    var treeEditor = null;
    var errorLogger = new ErrorLogger();
    var mmTree = new MedmanualTree(errorLogger, function() {
        if(treeEditor !== null) {
            treeEditor.updateTree();
        }
    });
    treeEditor = new TreeEditor(mmTree, "#tree-container");
    mmTree.getOrLoadTree(function (treeRoot) {
    });
});