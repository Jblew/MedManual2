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