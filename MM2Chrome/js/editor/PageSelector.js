var pageSelectorUid = 0;

function PageSelector(mmTree, page) {
    this.mmTree = mmTree;
    this.id = "pageselector-" + pageSelectorUid;
    pageSelectorUid++;

    this.baseInput = new Input();
    this.baseInput.type("text");
    this.selectedPage = page;
    this.callbacks = [];

    if (page !== null) {
        this.baseInput.value(this.selectedPage.title);
    }
}

PageSelector.prototype.onPageChange = function (callback) {
    this.callbacks.push(callback);
    return this;
};

PageSelector.prototype.getSelectedPage = function () {
    return this.selectedPage;
};

PageSelector.prototype.getHtml = function () {
    return '   <div id="' + this.id + '">'
            + this.baseInput.getHtml()
            + '</div>';
};

PageSelector.prototype.init = function () {
    var psElem = this.baseInput.get$();
    var that = this;

    psElem.easyAutocomplete({
        url: function (phrase) {
            return "http://medmanual2.jblew.pl/pages/ajaxFindPage?term=" + phrase;
        },
        getValue: "title",
        requestDelay: 250,
        list: {
            onSelectItemEvent: function () {
                var selData = psElem.getSelectedItemData();
                if (that.selectedPage === null || parseInt(selData.id) !== parseInt(that.selectedPage.id)) {
                    that.selectedPage = that.mmTree.getPageById(selData.id);
                    console.log("Child selected "+that.selectedPage.id);
                    for (var i = 0; i < that.callbacks.length; i++) {
                        that.callbacks[i](that.selectedPage);
                    }
                }
            }
        }
    });
};