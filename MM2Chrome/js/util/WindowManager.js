var windowManager_ = new WindowManager();

function WindowManager() {
};

WindowManager.prototype.open = function (url, width, height) {
    var top = window.screenTop + 50;
    var left = window.screenLeft+50;
    var newWindow = window.open(url, "MedManual Editor", 'scrollbars=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);

    window.focus();
    return newWindow;
};

WindowManager.getInstance = function () {
    return windowManager_;
};