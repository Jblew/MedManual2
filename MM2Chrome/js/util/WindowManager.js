function WindowManager() {
    this.windows = [window];
}


WindowManager.prototype.open = function (url, width, height) {
    var top = window.screenTop + 50;
    var left = window.screenLeft + 50;
    var newWindow = window.open(url, "MedManual Editor", 'scrollbars=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);

    this.windows.push(newWindow);
    var that = this;
    newWindow.onbeforeunload = function () {
        for (var k in that.windows) {
            if (that.windows[k] === newWindow)
                that.windows.slice(k, 1);
        }
        return null;
    };

    window.focus();
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