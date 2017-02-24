var editMode = false;
$(document).ready(function () {
    $("#top-search-box").easyAutocomplete({
        url: function (phrase) {
            return "http://medmanual2.jblew.pl/pages/ajaxFindPage?term=" + phrase;
        },
        getValue: "title",
        requestDelay: 500,
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

function setMsgBar(msg, type) {
    $("#msg-bar").text(msg);
    if(type == "error") {
        $("#msg-bar").addClass("error");
        $("#msg-bar").removeClass("success");
        $("#msg-bar").removeClass("info");
    }
    else if(type == "error") {
        $("#msg-bar").removeClass("error");
        $("#msg-bar").addClass("success");
        $("#msg-bar").removeClass("info");
    }
    else if(type == "info") {
        $("#msg-bar").removeClass("error");
        $("#msg-bar").removeClass("success");
        $("#msg-bar").addClass("info");
    }
    $("#msg-bar").show();
    setTimeout(function() {
        $("#msg-bar").hide();
    }, 5000);
}
$(document).ready(function() {
    $("#msg-bar").on('click', function() {
        $("#msg-bar").hide();
    });
});