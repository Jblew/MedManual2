function ErrorLogger() {
    this.msgBarSelector = "#msg-bar";
}

ErrorLogger.prototype.init = function() {
    $(msgBarSelector).on('click', function() {
        $(msgBarSelector).hide();
    });
};

ErrorLogger.prototype.setMsgBar = function (msg, type) {
    console.log("E.LOG("+type+"): "+msg);
    $(this.msgBarSelector).text(msg);
    if(type === "error") {
        $(this.msgBarSelector).addClass("error");
        $(this.msgBarSelector).removeClass("success");
        $(this.msgBarSelector).removeClass("info");
    }
    else if(type === "error") {
        $(this.msgBarSelector).removeClass("error");
        $(this.msgBarSelector).addClass("success");
        $(this.msgBarSelector).removeClass("info");
    }
    else if(type === "info") {
        $(this.msgBarSelector).removeClass("error");
        $(this.msgBarSelector).removeClass("success");
        $(this.msgBarSelector).addClass("info");
    }
    $(this.msgBarSelector).show();
    setTimeout(function() {
        $(this.msgBarSelector).hide();
    }, 5000);
};

ErrorLogger.prototype.error = function(msg) {
    this.setMsgBar(msg, 'error');
};

ErrorLogger.prototype.success = function(msg) {
    this.setMsgBar(msg, 'success');
};

ErrorLogger.prototype.info = function(msg) {
    this.setMsgBar(msg, 'info');
};