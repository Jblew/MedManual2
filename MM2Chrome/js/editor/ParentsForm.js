var parentsUid = 0;

function ParentsForm(page_, fieldName) {
    this.page = page_;
    this.fieldName = fieldName;
    this.baseInputId = "parents-base-"+parentsUid;
    this.baseInputSelector = "#"+this.baseInputId;
    parentsUid++;
}

ParentsForm.prototype.getHtml = function() {
    return '<input type="hidden" name="'+this.fieldName+'" id="'+this.baseInputSelector+'">';
};

ParentsForm.prototype.init = function() {
    
};

ParentsForm.prototype.updateParentsField = function() {
    var parentsIds = [];
    for(var i = 0;i < this.page.parents;i++) {
        parentsIds.push(this.page.parents[i].id);
    }
    $(this.baseInputSelector).val(parentsIds.join(","));
};

ParentsForm.prototype.createNewForm = function(id, initialTitle, initialId, prePathHtml) {
    var elem = "<table style=\"width: 100%;\" class=\"parents-table\" id=\"parents-selector-" + id + "-table\"><tr>"
            + "<td id=\"parents-selector-" + id + "-prepath\" class=\"outer-td td-prepath\">" + prePathHtml + "</span></td>"
            + "<td class=\"outer-td td-input\">"
            + "   <input value=\"" + initialTitle + "\" class=\"parents-selector\" id=\"parents-selector-" + id + "\" />"
            + "</td>"
            + "<td class=\"outer-td td-afterpath\">"
            + "   <a href=\"javascript:window.open('/pages/edit/0/" + base64_encode(initialTitle) + "', '','height=800,width=600');\" id=\"parents-selector-" + id + "-parentlink\" target=\"_blank\"><span class=\"glyphicon glyphicon-hand-left\"></span></a>"
            + "   <span id=\"parents-selector-" + id + "-afterpath\"> &raquo; </span>"
            + "   <span style=\"color: red;\" class=\"glyphicon glyphicon-trash\" id=\"parents-selector-" + id + "-delete\"></span>"
            + "</td>"
            + "</table><span id=\"parents-selector-" + id + "-appendbase\"></span>";

    if (id == 0) {
        $("#parents-base").after(elem);
    } else {
        $("#parents-selector-" + (id - 1) + "-appendbase").after(elem);
    }

    $("#parents-selector-" + id).easyAutocomplete({
        url: function (phrase) {
            return "http://medmanual2.jblew.pl/pages/ajaxFindPage?term=" + phrase;
        },
        getValue: "title",
        list: {
            onSelectItemEvent: function () {
                if (!($("#parents-selector-" + (id + 1)).length)) {
                    createNewForm(id + 1, '', null, '');
                }
                var selData = $("#parents-selector-" + id).getSelectedItemData();
                parentsArr[id] = selData.id;
                var prepathHtml = "<table style=\"display: inline;\">";
                for (var pathI = 0; pathI < selData.paths.length; pathI++) {
                    prepathHtml += "<tr><td>";
                    for (var elemI = 0; elemI < selData.paths[pathI].length; elemI++) {
                        prepathHtml += "<a href=\"javascript:window.open('/pages/edit/0/" + base64_encode(selData.paths[pathI][elemI]) + "', '','height=800,width=600');\" target=\"_blank\">" + selData.paths[pathI][elemI] + "</a> &raquo; ";
                    }
                    prepathHtml += "</td></tr>";
                }
                prepathHtml += "</table>";
                $("#parents-selector-" + id + "-prepath").html(prepathHtml);
                $("#parents-selector-" + id + "-parentlink").attr("href", "javascript:window.open('/pages/edit/" + selData.id + "', '','height=800,width=600');");
                updateParentsField();
            }
        }
    });
    $("#parents-selector-" + id).parent().attr("style", "width: 100%;");
    $("#parents-selector-" + id + "-delete").on('click', function () {
        parentsArr[id] = null;
        $("#parents-selector-" + id + "-table").remove();
        updateParentsField();
    });
}

ParentsForm.generateBaseHiddenInput = function(name) {
    
};
