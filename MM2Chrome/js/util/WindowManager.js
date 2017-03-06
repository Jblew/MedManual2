function WindowManager() {
    this.windows = [window];
    this.windowUid = 0;
}


WindowManager.prototype.open = function (url, width, height) {
    var top = window.screenTop + 50;
    var left = window.screenLeft + 50;
    var newWindow = window.open(url, "MedManual Editor "+this.windowUid, 'scrollbars=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
    this.windowUid++;

    this.windows.push(newWindow);
    var that = this;
    /*$(newWindow).on('beforeunload', function () {
        for (var k in that.windows) {
            if (that.windows[k] === newWindow)
                that.windows.slice(k, 1);
        }
        return null;
    });*/

    //window.focus();
    return newWindow;
};

WindowManager.prototype.getWindows = function () {
    return this.windows;
};

WindowManager.prototype.everyWindow = function (f) {
    for (var k in this.windows) {
        f(this.windows[k]);
    }
};