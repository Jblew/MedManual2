var parentsUid = 0;

function ParentsForm(mmTree_, page_, fieldName) {
    this.mmTree = mmTree_;
    this.page = page_;
    this.fieldName = fieldName;
    this.id = "parentsform-" + parentsUid;
    parentsUid++;
    this.formIdUid = 0;
    this.pageSelectors = [];
}

ParentsForm.prototype.getHtml = function () {
    return '<div id="' + this.id + '-base"><input type="hidden" name="' + this.fieldName + '" id="' + this.id + '-hidden" /></div>';
};

ParentsForm.prototype.init = function () {
    if (typeof this.page !== 'undefined' && this.page !== null) {
        for (var i = 0; i < this.page.parents.length; i++) {
            this.createNewForm(this.page.parents[i]);
        }
    }
    this.createNewForm(null);
    this._updateParentsField();
};

ParentsForm.prototype._updateParentsField = function () {
    var parentsIds = [];
    for (var i = 0; i < this.pageSelectors.length; i++) {
        var selectedPage = this.pageSelectors[i].getSelectedPage();
        if (selectedPage !== null)
            parentsIds.push(selectedPage.id);
    }
    $(this.baseInputSelector).val(parentsIds.join(","));
};

ParentsForm.prototype.createNewForm = function (parent) {
    var that = this;

    var formId = this.id + "-form-" + this.formIdUid;
    this.formIdUid++;

    var pageSelector = new PageSelector(this.mmTree, parent);
    var deleteLink = new Link("").withIcon("trash").withCallback(function () {
        for (var i = 0; i < that.pageSelectors.length; i++) {
            if (that.pageSelectors[i] === pageSelector)
                that.pageSelectors.slice(i, 1);
        }

        $('#' + formId + '-table').remove();
        that._updateParentsField();
    });

    var elem = '<table class="parents-table" id="' + formId + '-table"><tr>'
            + '<td id="' + formId + '-prepath" class="outer-td td-prepath"></td>'
            + '<td class="outer-td td-input">'
            + pageSelector.getHtml()
            + '</td>'
            + '<td class=\"outer-td td-afterpath\">'
            + '   ' + deleteLink.getHtml()
            + '</td>'
            + '</table>';

    $("#" + this.id + "-base").append(elem);

    var pageChanged = function () {
        that._updateParentsField();
;

        var page = pageSelector.getSelectedPage();
        if (page !== null) {
            console.log("Page changed to "+page.title);
            var prepathHtml = "<table style=\"display: inline;\">";
            var paths = page.getParentPaths();
            for (var pathI = 0; pathI < paths.length; pathI++) {
                prepathHtml += "<tr><td>";
                for (var elemI = 0; elemI < paths[pathI].length - 1; elemI++) {
                    prepathHtml += paths[pathI][elemI].title + " &raquo; ";
                }
                prepathHtml += "</td></tr>";
            }
            prepathHtml += "</table>";
            $("#" + formId + "-prepath").html(prepathHtml);
        } else {
            $("#" + formId + "-prepath").html(null);
        }
    };
    pageSelector.onPageChange(pageChanged);

    pageSelector.init();
    this.pageSelectors.push(pageSelector);

    deleteLink.initCallback();
    
    pageChanged();
};

/*ParentsForm.generateBaseHiddenInput = function(name) {
 
 };*/
