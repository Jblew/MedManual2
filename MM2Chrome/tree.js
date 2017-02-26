$(document).ready(function () {
    mmRequestPost('pages/index', 'get', {}, function (data, isSuccess, errorData) {
        if (isSuccess) {
            var treeHtml = "<ul>";
            treeHtml += _getNodeHtml(data);
            treeHtml += "</ul>";
            $("#tree-container").html(treeHtml);
        } else {
            setMsgBar('Could not get tree. Error: ' + errorData, 'error');
        }
    });
});

function _getNodeHtml(page) {
    var out = "<li>"
            + "<strong><a href=\"/pages/view/" + page.id + "\">" + page.title + "</a></strong>"
            + " "
            + "(<a href=\"/pages/edit/" + page.id + "\">Edit</a>)"
            + "<ul>";

    for (var i = 0; i < page.children.length; i++) {
        out += _getNodeHtml(page.children[i]);
    }

    out += "</ul>";
    return out;
}