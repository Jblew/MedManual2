/* global rangy */

var mdEditorUid = 0;

function MarkdownEditor() {
    this.id = "mdeditor-" + mdEditorUid;
    mdEditorUid++;

    this.content = "";
    this.highlighters = false;

    var classApplierModule = rangy.modules.ClassApplier;
    if (rangy.supported && classApplierModule && classApplierModule.supported) {
        this.highlighters = true;
        this.boldApplier = rangy.createClassApplier("bold");
        this.italicApplier = rangy.createClassApplier("italic");
        this.linkApplier = rangy.createClassApplier("link", {
            onElementCreate: function (element, applier) {
                //$(element).on('DOMSubtreeModified', function() {

                //});
            }
        });
    }

    var that = this;
    this.restTimer = new CountdownTimer(500, function () {
        that._inRest();
    });

    this.savedContent = this.content;
    this.callbacks = [];
}

MarkdownEditor.prototype.onContentChange = function (callback) {
    var that = this;
    this.callbacks.push(callback);
};

MarkdownEditor.prototype.setContent = function (content_) {
    if (content_.charCodeAt(0) === 13) {
        content_ = content_.substring(2);
    }
    $('#' + this.id + '-contenteditable').html("<div>" + content_ + "</div>");
    this._processContent();
    this.setSaved();
};

MarkdownEditor.prototype.getHtml = function () {
    return ''
            + '<div id="' + this.id + '">'
            + ' <div id="' + this.id + '-contenteditable" class="md-editor" contenteditable>'
            + '     <div>Tutaj wpisz treść...</div>'
            + '     <div></div>'
            + ' </div>'
            + '</div>';

};

MarkdownEditor.prototype.getContenteditable$ = function () {
    return $('#' + this.id + '-contenteditable');
};

MarkdownEditor.prototype.init = function () {
    var that = this;

    $('#' + this.id + '-contenteditable').get(0).addEventListener("paste", function (e) {
        e.preventDefault();
        if (e.clipboardData) {
            content = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, content);
        } else if (window.clipboardData) {
            content = window.clipboardData.getData('Text');
            document.selection.createRange().pasteHTML(content);
        }

        that._processContent();
        that._inRest();
    });

    $('#' + this.id + '-contenteditable').on('reparse', function () {
        that._processContent();
        that._inRest();
    });

    $('#' + this.id + '-contenteditable').on('input', function () {
        //that._processContent();
        //console.log("Contenteditable: input");
        that._processLine($(rangy.getSelection().anchorNode).closest("div"));
        that.restTimer.resetCounter();
    });

    this._inRest();
};

MarkdownEditor.prototype._processContent = function () {
    var that = this;
    var lines = $('#' + this.id + '-contenteditable > div').toArray();
    for (var k in lines) {
        var div = $(lines[k]);
        that._processLine(div);
    }
};

MarkdownEditor.prototype._processLine = function (elem$) {
    var text = elem$.text();
    var lines = text.split("\n");
    if (lines.length > 1) {
        for (var k in lines) {
            var newLine$ = $("<div>" + lines[k] + "</div>").insertBefore(elem$);
            //console.log(newLine$);
            this._processLine(newLine$);
        }
        elem$.remove();
    } else {
        elem$.removeClass();
        elem$.removeAttr('style');
        if (text.startsWith("# "))
            elem$.addClass("h1");
        else if (text.startsWith("## "))
            elem$.addClass("h2");
        else if (text.startsWith("### "))
            elem$.addClass("h3");
        else if (text.startsWith("#### "))
            elem$.addClass("h4");
        else if (text.startsWith("##### "))
            elem$.addClass("h5");
        else if (text.startsWith("###### "))
            elem$.addClass("h6");
        else if (text.startsWith("![")) {
            var re = /\!\[[^\]]*\]\(([^\)]*)\)/g;
            var res = re.exec(text);
            if (res !== null && res.length > 1) {
                var url = res[1];
                if (!url.startsWith("http"))
                    url = "http://medmanual2.jblew.pl/" + url;
                elem$.addClass('img');
                elem$.css('background', '#dddddd url(' + url + ')');
                var img = new Image();
                img.onload = function () {
                    if (img.width > window.innerWidth) {
                        var newWidth = window.innerWidth;
                        var newHeight = img.height * newWidth / img.width;
                        elem$.css('height', newHeight + 40);
                        elem$.css('background-size', newWidth + 'px ' + newHeight + 'px');
                    } else
                        elem$.css('height', img.height + 40);
                };
                img.src = url;
            }
        } else if (text === "")
            elem$.addClass("emptyline");

        if (this.highlighters) {
            var that = this;

            //setTimeout(function() {
            //    that._highlight(/(\*\*.*\*\*)/g, that.boldApplier, elem$);
            //    rangy.getSelection().restoreCharacterRanges(elem$.get(0), savedSel);
            //    console.log("Highlight");
            //}, 500);
            //this._highlight(/(\*\*.*\*\*)/g, this.boldApplier, elem$);
            //this._highlight(/(_.*_)/g, this.italicApplier, elem$);
            //this._highlight(/[^!]\[(.*)\]/g, this.linkApplier, elem$);

        }
    }
};

MarkdownEditor.prototype._inRest = function () {
    this._highlight();
    if (this.isModified()) {
        for (var k in this.callbacks) {
            this.callbacks[k]();
        }
    }
};

MarkdownEditor.prototype._highlight = function () {
    var elem = $("#" + this.id + "-contenteditable").get(0);

    var savedSel = rangy.getSelection().saveCharacterRanges(elem);

    this.__highlight(/(\*\*.*\*\*)/g, this.boldApplier, elem);
    this.__highlight(/(_.*_)/g, this.italicApplier, elem);
    this.__highlight(/[^!]\[(.*)\]/g, this.linkApplier, elem);

    $(".link:not(.pagelink)").each(function (i, element) {
        var linkText = $(element).text().trim();
        if (linkText.length > 0) {
            var pageLink = new PageLink(linkText.substr(1, linkText.length - 2), null);
            pageLink.initOnElement($(element));
        }
    });


    rangy.getSelection().restoreCharacterRanges(elem, savedSel);
};

MarkdownEditor.prototype.__highlight = function (pattern, applier, scopeElem) {
    var range = rangy.createRange();
    var searchScopeRange = rangy.createRange();
    searchScopeRange.selectNodeContents(scopeElem);

    var options = {
        caseSensitive: false,
        wholeWordsOnly: false,
        withinRange: searchScopeRange,
        direction: "forward" // This is redundant because "forward" is the default
    };

    range.selectNodeContents(scopeElem);
    applier.undoToRange(range);

    while (range.findText(pattern, options)) {
        applier.applyToRange(range);
        range.collapse(false);
    }
};

MarkdownEditor.prototype.getMarkdown = function () {
    var text = "";
    $("#mdeditor-0-contenteditable > div").each(function (i, elem) {
        text += $(elem).text();
        text += "\n";
    });
    return text;
};

MarkdownEditor.prototype.setSaved = function () {
    this.savedContent = this.getMarkdown();
};

MarkdownEditor.prototype.isModified = function () {
    return this.savedContent !== this.getMarkdown();
};