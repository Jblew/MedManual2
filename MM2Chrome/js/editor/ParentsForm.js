var parentsUid = 0;

function ParentsForm(mmTree_, page_, fieldName) {
    this.mmTree = mmTree_;
    this.page = page_;
    this.fieldName = fieldName;
    this.id = "parentsform-" + parentsUid;
    parentsUid++;
    this.formIdUid = 0;
    this.pageSelectors = [];
    this.savedParents = (this.page !== null ? this.page.parents : []);

    this.changeCallbacks = [];
}

ParentsForm.prototype.onChange = function (callback) {
    this.changeCallbacks.push(callback);
};

ParentsForm.prototype.getHtml = function () {
    return '<div id="' + this.id + '-base" class="parentsform"><div id="' + this.id + '-fields">'
            + '<input type="hidden" name="' + this.fieldName + '" id="' + this.id + '-hidden" />'
            + '</div></div>';
};

ParentsForm.prototype.init = function () {
    if (typeof this.page !== 'undefined' && this.page !== null) {
        for (var i = 0; i < this.page.parents.length; i++) {
            this.createNewForm(this.page.parents[i]);
        }
    }
    //this.createNewForm(null);

    var that = this;
    var addFieldButton = new Link("Add field").withIcon("plus").withCallback(function () {
        that.createNewForm(null);
    });
    $("#" + this.id + "-base").append("<div class=\"add-form-btn\">" + addFieldButton.getButtonHtml("success") + "</div>");

    this._changedParents();
    addFieldButton.initCallback();
};

ParentsForm.prototype.getSelectedParents = function () {
    var selectedParents = [];
    for (var i = 0; i < this.pageSelectors.length; i++) {
        var selectedPage = this.pageSelectors[i].getSelectedPage();
        if (selectedPage !== null)
            selectedParents.push(selectedPage);
    }
    return selectedParents;
};

ParentsForm.prototype.getParentsIdsStr = function () {
    var parentsIds = [];
    for (var i = 0; i < this.pageSelectors.length; i++) {
        var selectedPage = this.pageSelectors[i].getSelectedPage();
        if (selectedPage !== null)
            parentsIds.push(selectedPage.id);
    }
    return parentsIds.join(",");
};

ParentsForm.prototype._changedParents = function () {
    $(this.baseInputSelector).val(this.getParentsIdsStr());

    if (this.isModified()) {
        for (var k in this.changeCallbacks) {
            this.changeCallbacks[k]();
        }
    }
};

ParentsForm.prototype.createNewForm = function (parent) {
    var that = this;

    var formId = this.id + "-form-" + this.formIdUid;
    this.formIdUid++;

    var pageSelector = new PageSelector(this.mmTree, parent);
    var deleteLink = new Link("").withIcon("trash").withCallback(function () {
        for (var i = 0; i < that.pageSelectors.length; i++) {
            if (that.pageSelectors[i] === pageSelector)
                that.pageSelectors.splice(i, 1);
        }

        $('#' + formId + '-table').remove();
        that._changedParents();
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

    $("#" + this.id + "-fields").append(elem);

    var pageChanged = function () {
        that._changedParents();

        var page = pageSelector.getSelectedPage();
        if (page !== null) {
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

ParentsForm.prototype.setSaved = function () {
    this.savedParents = this.getSelectedParents();
};

ParentsForm.prototype.isModified = function () {
    return !this.savedParents.equals(this.getSelectedParents());
};
