var editMode = false;
$(document).ready(function () {
    $("#top-search-box").easyAutocomplete({
        url: function (phrase) {
            return "http://medmanual2.jblew.pl/pages/ajaxFindPage?term=" + phrase;
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
    });
});

