/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree */

$(document).ready(function () {
    var errorLogger = new ErrorLogger();
    var mmTree = new MedmanualTree(errorLogger);
    mmTree.getOrLoadTree(function (treeRoot) {
        var treeEditor = new TreeEditor(mmTree);
        treeEditor.init("#tree-container");
    });
});