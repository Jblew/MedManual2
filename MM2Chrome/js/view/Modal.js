var modalOpened = false;
var modalUid = 0;

function Modal(title) {
    if (modalOpened)
        throw "Cannot open more than one modal at time!";
    this.title = title;
    this.content = "";
    this.buttonsHtml = "";
    this.id = "modal-" + modalUid;
    this._hasCloseButton = true;
    this._blockClose = false;
    modalUid++;

    modalOpened = true;
}

Modal.prototype.withContent = function (html) {
    this.content = html;
    return this;
};

Modal.prototype.addButton = function (html) {
    this.buttonsHtml += html;
    return this;
};

Modal.prototype.hasCloseButton = function (isCloseButton) {
    this._hasCloseButton = isCloseButton;
    return this;
};

Modal.prototype.blockClose = function (v) {
    this._blockClose = v;
    return this;
};

Modal.prototype.show = function () {
    var html = '<div class="modal fade" tabindex="-1" role="dialog" id="' + this.id + '">'
            + ' <div class="modal-dialog" role="document">'
            + '     <div class="modal-content">'
            + '         <div class="modal-header">'
            + (this._hasCloseButton ? '<a class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></a>' : '')
            + '             <h4 class="modal-title">' + this.title + '</h4>'
            + '         </div>'
            + '         <div class="modal-body">'
            + (this.content !== "" ? '<p>' + this.content + '</p>' : '')
            + '         <div class=\"modal-error\" id="' + this.id + '-error"></div>'
            + '         </div>'
            + '         <div class="modal-footer">'
            + '             ' + this.buttonsHtml
            + '         </div>'
            + '     </div>'
            + ' </div>'
            + '</div>';

    $(html).appendTo("body");

    $("#" + this.id).modal('show');
    $("#" + this.id).on('hidden.bs.modal', function (e) {
        if (!this._blockClose) {
            modalOpened = false;
            $("#" + this.id).remove();
        }
        else {
           $("#" + this.id).modal('show'); 
        }
    });
};

Modal.prototype.displayError = function (msg) {
    $("#" + this.id + "-error").html(msg);
};

Modal.prototype.close = function () {
    if (modalOpened) {
        this._blockClose = false;
        $("#" + this.id).modal('hide');
    }
};