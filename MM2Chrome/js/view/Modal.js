var modalOpened = false;
var modalUid = 0;

function Modal(title) {
    if (modalOpened)
        throw "Cannot open more than one modal at time!";
    this.title = title;
    this.content = "";
    this.buttonsHtml = "";
    this.id = "modal-" + modalUid;
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

Modal.prototype.show = function () {
    var html = '<div class="modal fade" tabindex="-1" role="dialog" id="' + this.id + '">'
            + ' <div class="modal-dialog" role="document">'
            + '     <div class="modal-content">'
            + '         <div class="modal-header">'
            + '             <a class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></a>'
            + '             <h4 class="modal-title">' + this.title + '</h4>'
            + '         </div>'
            + '         '
            + '         <div class="modal-body"><p>' + this.content + '</p></div>'
            + '         '
            + '         '
            + '         <div class="modal-footer">'
            + '             ' + this.buttonsHtml
            + '         </div>'
            + '     </div>'
            + ' </div>'
            + '</div>';

    $(html).appendTo("body");

    $("#" + this.id).modal('show');
    $("#" + this.id).on('hidden.bs.modal', function (e) {
        modalOpened = false;
        $("#" + this.id).remove();
    });
};

Modal.prototype.close = function () {
    if (modalOpened) {
        $("#" + this.id).modal('hide');
    }
};