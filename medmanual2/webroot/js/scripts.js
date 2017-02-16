function base64_encode(stringToEncode) { // eslint-disable-line camelcase
    //  discuss at: http://locutus.io/php/base64_encode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Bayron Guevara
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Rafał Kukawski (http://blog.kukawski.pl)
    // bugfixed by: Pellentesque Malesuada
    //   example 1: base64_encode('Kevin van Zonneveld')
    //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    //   example 2: base64_encode('a')
    //   returns 2: 'YQ=='
    //   example 3: base64_encode('✓ à la mode')
    //   returns 3: '4pyTIMOgIGxhIG1vZGU='
    if (typeof window !== 'undefined') {
        if (typeof window.btoa !== 'undefined') {
            return window.btoa(unescape(encodeURIComponent(stringToEncode)))
        }
    } else {
        return new Buffer(stringToEncode).toString('base64')
    }
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    var o1
    var o2
    var o3
    var h1
    var h2
    var h3
    var h4
    var bits
    var i = 0
    var ac = 0
    var enc = ''
    var tmpArr = []
    if (!stringToEncode) {
        return stringToEncode
    }
    stringToEncode = unescape(encodeURIComponent(stringToEncode))
    do {
        // pack three octets into four hexets
        o1 = stringToEncode.charCodeAt(i++)
        o2 = stringToEncode.charCodeAt(i++)
        o3 = stringToEncode.charCodeAt(i++)
        bits = o1 << 16 | o2 << 8 | o3
        h1 = bits >> 18 & 0x3f
        h2 = bits >> 12 & 0x3f
        h3 = bits >> 6 & 0x3f
        h4 = bits & 0x3f
        // use hexets to index into b64, and append result to encoded string
        tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
    } while (i < stringToEncode.length)
    enc = tmpArr.join('')
    var r = stringToEncode.length % 3
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
}


function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function setCaretPosition(element, offset) {
    var range = document.createRange();
    var sel = window.getSelection();

    //select appropriate node
    var currentNode = null;
    var previousNode = null;

    for (var i = 0; i < element.childNodes.length; i++) {
        //save previous node
        previousNode = currentNode;

        //get current node
        currentNode = element.childNodes[i];
        //if we get span or something else then we should get child node
        while (currentNode.childNodes.length > 0) {
            currentNode = currentNode.childNodes[0];
        }

        //calc offset in current node
        if (previousNode != null) {
            offset -= previousNode.length;
        }
        //check whether current node has enough length
        if (offset <= currentNode.length) {
            break;
        }
    }
    //move caret to specified offset
    if (currentNode != null) {
        range.setStart(currentNode, offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function editableIsCaret() {
    var sel = window.getSelection();
    return sel.rangeCount == 1 && sel.getRangeAt(0).collapsed;
}

function editableRange() {
    var sel = window.getSelection();
    return sel.getRangeAt(0);
}

function saveCaretPosition(context) {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    range.setStart(context, 0);
    var len = range.toString().length;

    return function restore(space, newline) {
        var pos = getTextNodeAtPosition(context, len, newline);
        //console.log("pos: ");
        //console.log(pos);
        selection.removeAllRanges();
        var range = new Range();
        var newposition = pos.position;
        range.setStart(pos.node, newposition);
        selection.addRange(range);

    }
}

function getTextNodeAtPosition(root, index, getNextElement) {
    var lastNode = null;

    var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, function next(elem) {
        if (index > elem.textContent.length) {
            index -= elem.textContent.length;
            lastNode = elem;
            return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT;
    });
    var c = treeWalker.nextNode();
    if (getNextElement) {
        var c2 = treeWalker.nextNode();
        if (c2 !== null) {
            c = c2;
        }
    }
    return {
        node: c ? c : root,
        position: c ? index : 0
    };
}

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

function insertTextAtCursor(text) {
    var range, sel = rangy.getSelection();
    if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.insertNode(document.createTextNode(text));
    }
}













function gEBI(id) {
    return document.getElementById(id);
}

var searchResultApplier;

function toggleItalicYellowBg() {
    searchResultApplier.toggleSelection();
}


function doSearch() {
    // Remove existing highlights
    var range = rangy.createRange();
    var caseSensitive = caseSensitiveCheckBox.checked;
    var searchScopeRange = rangy.createRange();
    searchScopeRange.selectNodeContents(document.body);

    var options = {
        caseSensitive: caseSensitive,
        wholeWordsOnly: wholeWordsOnlyCheckBox.checked,
        withinRange: searchScopeRange,
        direction: "forward" // This is redundant because "forward" is the default
    };

    range.selectNodeContents(document.body);
    searchResultApplier.undoToRange(range);

    // Create search term
    var searchTerm = searchBox.value;

    if (searchTerm !== "") {

        // Iterate over matches
        while (range.findText(searchTerm, options)) {
            // range now encompasses the first text match
            searchResultApplier.applyToRange(range);

            // Collapse the range to the position immediately after the match
            range.collapse(false);
        }
    }

    timer = null;
}


function initSnapToWords1() {
    gEBI("demo1").onmouseup = function() {
        rangy.getSelection().expand("word");
    };
}

function initSnapToWords2() {
    gEBI("demo2").onmouseup = function() {
        rangy.getSelection().expand("word", {
            wordOptions: {
                includeTrailingSpace: true
            }
        });
    };
}

function initSnapToWords3() {
    gEBI("demo3").onmouseup = function() {
        rangy.getSelection().expand("word", {
            wordOptions: {
                wordRegex: /[a-z0-9]+(['\-][a-z0-9]+)*/gi
            }
        });
    };
}

function initSnapToWords4() {
    gEBI("demo4").onmouseup = function() {
        rangy.getSelection().expand("word", {
            trim: true
        });
    };
}

function initSaveRestore() {
    var saveButton = gEBI("saveSelButton");
    var restoreButton = gEBI("restoreSelButton");
    var changeFormattingButton = gEBI("changeFormattingButton");
    var containerElement = gEBI("demo5");

    var savedSel = null;

    saveButton.disabled = false;

    saveButton.onclick = function() {
        savedSel = rangy.getSelection().saveCharacterRanges(containerElement);
        restoreButton.disabled = false;
    };

    restoreButton.onclick = function() {
        rangy.getSelection().restoreCharacterRanges(containerElement, savedSel);
    };

    var redItalicApplier = rangy.createClassApplier("redItalic");
    var textLength = rangy.innerText(containerElement).length;

    changeFormattingButton.disabled = false;
    changeFormattingButton.onclick = function() {
        // Randomly apply and unapply some formatting
        var start = Math.floor(Math.random() * textLength);
        var end = Math.floor(Math.random() * textLength);
        if (start > end) {
            var temp = end;
            end = start;
            start = temp;
        }
        var range = rangy.createRange();
        range.selectCharacters(containerElement, start, end);
        redItalicApplier.toggleRange(range);
    };
}

function initCaretMove() {
    var editableDiv = gEBI("demo6");
    var caretLeftButton = gEBI("caretLeftButton");
    var caretRightButton = gEBI("caretRightButton");

    caretLeftButton.onmousedown = function() {
        rangy.getSelection().move("character", -1);
        return false;
    };

    caretRightButton.onmousedown = function() {
        rangy.getSelection().move("character", 1);
        return false;
    };
}

window.onload = function() {
    rangy.init();
    initFind();
    initSnapToWords1();
    initSnapToWords2();
    initSnapToWords3();
    initSnapToWords4();
    initSaveRestore();
    initCaretMove();
};
