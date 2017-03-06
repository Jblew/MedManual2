var imagedropuploaderUid = 0;

function ImageDropUploader() {
    this.callback = null;
    this.id = "idu-" + imagedropuploaderUid;
    imagedropuploaderUid++;
}

ImageDropUploader.prototype.onUpload = function (callback) {
    this.callback = callback;
    return this;
};

ImageDropUploader.prototype.init = function (elem$) {
    var that = this;
    elem$.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })
            .on('dragover dragenter', function () {
                elem$.addClass('is-dragover');
            })
            .on('dragleave dragend drop', function () {
                elem$.removeClass('is-dragover');
            })
            .on('drop', function (e) {
                var droppedFiles = e.originalEvent.dataTransfer.files;
                for (var index = 0; index < droppedFiles.length; index++) {
                    var file = droppedFiles[index];
                    var id = that.id + "-img-awaiter" + (new Date().getTime()) + "-" + index;
                    that.callback("<div id=\"" + id + "\">![" + file.name + "](Sending file...)</div>");
                    console.log("Starting upload");

                    var data = new FormData();
                    data.append('upload', file);
                    mmRequestUpload('pages/saveFile/', 'POST', data, function (data, isSuccess, errorObj) {
                        if (isSuccess) {
                            $("#" + id).text("![" + file.name + "](" + data.url + ")");
                            elem$.trigger('reparse');
                        } else {
                            $("#" + id).text("![" + file.name + "](Error: " + errorObj + ")");
                            console.log('ERRORS: ' + errorObj);
                        }
                    });
                    /*$.ajax({
                     url: '/pages/saveFile/',
                     type: 'POST',
                     data: data,
                     cache: false,
                     dataType: 'json',
                     processData: false, // Don't process the files
                     contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                     success: function (data, textStatus, jqXHR)
                     {
                     if (typeof data.error === 'undefined')
                     {
                     console.log(data);
                     $("#" + id).text("![" + file.name + "](" + data.url + ")");
                     elem$.trigger('paste');
                     } else
                     {
                     $("#" + id).text("![" + file.name + "](Error: " + data.error + ")");
                     console.log('ERRORS: ' + data.error);
                     }
                     },
                     error: function (jqXHR, textStatus, errorThrown)
                     {
                     $("#" + id).text("![" + file.name + "](Error:" + textStatus + ")");
                     console.log('ERRORS: ' + textStatus);
                     }
                     });*/
                }

                /*var rangyAnchor = $(rangy.getSelection().anchorNode);
                 if (rangyAnchor.is("div"))
                 rangyAnchor.after(out);
                 else
                 rangyAnchor.closest("div").after(out);*/
            });
};