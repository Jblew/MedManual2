<script type="text/javascript">editMode = true;</script>
<!--
<?php var_dump($page); ?>
-->

<?php
echo $this->Form->create($page, ['id' => 'edit-form', 'label' => '']);
echo $this->Form->input('title', ['class' => 'title']);
?>
<p class="parents-field">
    <input type="hidden" name="parentsids" id="parents-base">
    <script type="text/javascript">
        var parentsArr = [];
        function updateParentsField() {
            $("#parents-base").val(parentsArr.join(","));
            //console.log(parentsArr);
        }

        function createNewForm(id, initialTitle, initialId, prePathHtml) {
            parentsArr[id] = initialId;
            var elem = "<table style=\"width: 100%;\" class=\"parents-table\" id=\"parents-selector-" + id + "-table\"><tr>"
                    + "<td id=\"parents-selector-" + id + "-prepath\" class=\"outer-td td-prepath\">" + prePathHtml + "</span></td>"
                    + "<td class=\"outer-td td-input\">"
                    + "   <input value=\"" + initialTitle + "\" class=\"parents-selector\" id=\"parents-selector-" + id + "\" />"
                    + "</td>"
                    + "<td class=\"outer-td td-afterpath\">"
                    + "   <a href=\"/pages/edit/0/" + base64_encode(initialTitle) + "\" id=\"parents-selector-" + id + "-parentlink\" target=\"_blank\"><span class=\"glyphicon glyphicon-hand-left\"></span></a>"
                    + "   <span id=\"parents-selector-" + id + "-afterpath\"> &raquo; <?php echo($page->title); ?></span>"
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
                    return "/pages/ajaxFindPage?term=" + phrase;
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
                                prepathHtml += "<a href=\"/pages/edit/0/" + base64_encode(selData.paths[pathI][elemI]) + "\" target=\"_blank\">" + selData.paths[pathI][elemI] + "</a> &raquo; ";
                            }
                            prepathHtml += "</td></tr>";
                        }
                        prepathHtml += "</table>";
                        $("#parents-selector-" + id + "-prepath").html(prepathHtml);
                        $("#parents-selector-" + id + "-parentlink").attr("href", "/pages/edit/" + selData.id);
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

        $(document).ready(function () {
<?php
if (!isset($addMode)) {
    $i = 0;
    foreach ($page->parents as $parent) {
        $prePathHtml = "<table style=\"display: inline;\">";
        if (isset($parent->paths)) {
            foreach ($parent->paths as $path) {
                $prePathHtml .= "<tr><td>";
                foreach ($path as $elem) {
                    $prePathHtml .= "<a href=\"/pages/edit/0/" . base64_encode($elem) . "\" target=\"_blank\">" . $elem . "</a> &raquo; ";
                }
                $prePathHtml .= "</td></tr>";
            }
        } else {
            $prePathHtml .= "<tr><td>";
            $prePathHtml .= "<span class=\"glyphicon glyphicon-home\"></span> &raquo; ";
            $prePathHtml .= "</td></tr>";
        }
        $prePathHtml .= "</table>";
        echo("createNewForm(" . $i . ", '" . $parent->title . "', " . $parent->id . ", '" . $prePathHtml . "');");
        $i++;
    }
    echo("createNewForm(" . $i . ", '', null, 'Dodaj nowego rodzica:');");
} else {
    echo("createNewForm(0, '', null, 'Dodaj nowego rodzica:');");
}
?>
            updateParentsField();
        });
    </script>
</p>
<p class="children-field">Dzieci: 
    <?php $first = true; ?>
    <?php foreach ($page->children as $child): ?>
        <?= ($first ? "" : ", ") ?>
        <a href="javascript:window.open('/pages/edit/<?= $child->id ?>', '','height=800,width=600');"">
            <?= $child->title ?>
        </a>
        <?php $first = false;
    endforeach; ?>
</p>
<div id="md-editor" contenteditable>
    <?php

    function startsWith($haystack, $needle) {
        $length = strlen($needle);
        return (substr($haystack, 0, $length) === $needle);
    }

    $i = 0;
    $lines = explode("\n", $page->body);
    foreach ($lines as $line) {
        if ($i > 0) {
            $line = trim($line);
            if ($line == '') {
                echo("<div><br /></div>");
            } else if (startsWith($line, "###### ")) {
                echo("<div class=\"h6\">" . $line . "</div>");
            } else if (startsWith($line, "##### ")) {
                echo("<div class=\"h5\">" . $line . "</div>");
            } else if (startsWith($line, "#### ")) {
                echo("<div class=\"h4\">" . $line . "</div>");
            } else if (startsWith($line, "### ")) {
                echo("<div class=\"h3\">" . $line . "</div>");
            } else if (startsWith($line, "## ")) {
                echo("<div class=\"h2\">" . $line . "</div>");
            } else if (startsWith($line, "# ")) {
                echo("<div class=\"h1\">" . $line . "</div>");
            } else {
                echo("<div>" . $line . "</div>");
            }
        }
        $i++;
    }
    if (trim($page->body) === "") {
        echo("<div>Tu wpisz treść...</div>");
    }
    ?>
</div>
<script type="text/javascript">
    $(document).ready(function () {
        var mdEditor = $("#md-editor");
        var searchResultApplier = null;
        var boldApplier = null;
        var italicApplier = null;
        var linkApplier = null;
        
        var onLinkClick = function(evt) {
            console.log(this);
            var text = $(this).text().trim();
            window.open(
                    '/pages/match/edit/'+base64_encode(text.substr(1, text.length-2)),
                    "", "height=800,width=600"
            );
        };

        var classApplierModule = rangy.modules.ClassApplier;
        if (rangy.supported && classApplierModule && classApplierModule.supported) {
            searchResultApplier = rangy.createClassApplier("searchResult");
            boldApplier = rangy.createClassApplier("bold");
            italicApplier = rangy.createClassApplier("italic");
            linkApplier = rangy.createClassApplier("link", {
                onElementCreate: function(element, applier) {
                    $(element).on('click', onLinkClick);
                }
            });
        }
        
        mdEditor.on('paste input', function () {
            $("#md-editor div").each(function (i, _div) {
                var div = $(_div);
                if (div.text().startsWith("# ")) {
                    div.addClass("h1");
                } else if (div.text().startsWith("## ")) {
                    div.addClass("h2");
                } else if (div.text().startsWith("### ")) {
                    div.addClass("h3");
                } else if (div.text().startsWith("#### ")) {
                    div.addClass("h4");
                } else if (div.text().startsWith("##### ")) {
                    div.addClass("h5");
                } else if (div.text().startsWith("###### ")) {
                    div.addClass("h6");
                } else if (div.text().startsWith("![")) {
                    //if(!div.hasClass("img")) {
                    var re = /\!\[[^\]]*\]\(([^\)]*)\)/g;
                    var res = re.exec(div.text());
                    if (res !== null && res.length > 1) {
                        var url = res[1];
                        div.addClass('img');
                        div.css('background', '#dddddd url(' + url + ')');
                        div.css('background-repeat', 'no-repeat');
                        div.css('background-position-x', 'center');
                        div.css('background-position-y', '22px');
                        var img = new Image();
                        img.onload = function () {
                            if (img.width > window.innerWidth) {
                                var newWidth = window.innerWidth;
                                var newHeight = img.height * newWidth / img.width;
                                div.css('height', newHeight + 40);
                                div.css('background-size', newWidth + 'px ' + newHeight + 'px');
                            } else
                                div.css('height', img.height + 40);
                        };
                        img.src = url;
                    }
                    //}
                } else
                    div.removeClass();
            });

            //Inline elements
            //int boldPos = 
            var elem = $("#md-editor").get(0);
            var savedSel = rangy.getSelection().saveCharacterRanges(elem);
            
            function highlightText(searchTerm, applier) {
                var range = rangy.createRange();
                var searchScopeRange = rangy.createRange();
                searchScopeRange.selectNodeContents(elem);
                
                var options = {
                    caseSensitive: false,
                    wholeWordsOnly: false,
                    withinRange: searchScopeRange,
                    direction: "forward" // This is redundant because "forward" is the default
                };
                
                range.selectNodeContents(elem);
                applier.undoToRange(range);
                
                while (range.findText(searchTerm, options)) {
                    applier.applyToRange(range);
                    range.collapse(false);
                }
            }
            
            highlightText("karolina", searchResultApplier);
            highlightText(/(\*\*.*\*\*)/g, boldApplier);
            highlightText(/(_.*_)/g, italicApplier);
            highlightText(/[^!]\[(.*)\]/g, linkApplier);
            
            
            
            rangy.getSelection().restoreCharacterRanges(elem, savedSel);
        });

        $("#md-editor").trigger('input');
        $(window).on('resize', function () {
            $("#md-editor").trigger('input');
        });
    });
</script>
<p> </p>
<?php
echo $this->Form->hidden('body', ['id' => 'edit-form-body', 'value' => '']);
?>
<?php
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
?>
<script type="text/javascript">
    $('#edit-form').submit(function () {
        $('#edit-form-body').after("<span id=\"tmp-val\" style=\"display: none;\"></span>");
        $('#tmp-val').html($("#md-editor").html());
        $('#tmp-val div').append("[newline]");
        $('#edit-form-body').val($("#tmp-val").text());
        $('#tmp-val').remove();
        return true;
    });
</script>