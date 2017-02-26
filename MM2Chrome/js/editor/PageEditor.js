function PageEditor() {

}


/**
 * Static functions:
 */

PageEditor.openInNewWindow = function (page) {
    window.open(
            'editor.html?pageId='+page.id,
            "", "height=800,width=600"
            );
};