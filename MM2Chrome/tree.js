/* global PageEditor, ErrorLogger, Link, Page, MedmanualTree, mm */

$(document).ready(function () {
    var treeEditor = new TreeEditor("#tree-container");
    if(mm().mmTree.isTreeLoaded()) treeEditor.updateTree();
});