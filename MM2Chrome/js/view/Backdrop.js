function Backdrop() {

}

Backdrop.show = function () {
    if ($("#backdrop-mm").length < 1) {
        $(document.body).append('<div class="modal-backdrop fade in" id="backdrop-mm" style="display:none;"></div>');
    }
    $("#backdrop-mm").show();
};

Backdrop.hide = function () {
    $("#backdrop-mm").hide();
};