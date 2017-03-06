/* global PageEditor, mm */

$(document).ready(function () {
    var pageSelector = new PageSelector(mm().mmTree, null);
    $("#top-search-container").html(pageSelector.getHtml());
    pageSelector.init();
    pageSelector.onPageChange(function() {
        if(pageSelector.getSelectedPage() !== null) {
            PageEditor.openInNewWindow(pageSelector.getSelectedPage());
        }
    });
   $("#"+pageSelector.id+" > .easy-autocomplete").css("width", "200px");
    /*$("#top-search-box").easyAutocomplete({
        url: function (phrase) {
            return "http://medmanual2.jblew.pl/pages/ajaxFindPage?term=" + base64_encode(phrase);
        },
        getValue: "title",
        requestDelay: 50,
        list: {
            onChooseEvent: function () {
                var selData = $("#top-search-box").getSelectedItemData();
                if (editMode) {
                    window.open(
                            '/pages/edit/' + selData.id,
                            "", "height=800,width=600"
                            );
                } else {
                    window.location.href = '/pages/view/' + selData.id;
                }
            }
        }
    });*/
});

