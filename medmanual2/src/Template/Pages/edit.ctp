<!--
<?php var_dump($page); ?>
-->

<?php
echo $this->Form->create($page, ['id' => 'edit-form']);
echo $this->Form->input('title', ['class' => 'title']);
//echo "<input id=\"parent-autocomplete\" />";
echo "<input type=\"hidden\" name=\"psarents\" id=\"parents-base\">";
?>
<script type="text/javascript">
    var parentsArr = [];
    function updateParentsField() {
        $("#parents-base").val(parentsArr.join(","));
        //console.log(parentsArr);
    }

    function createNewForm(id, initialTitle, initialId, prePathHtml) {
        parentsArr[id] = initialId;
        var elem = "<table style=\"width: 100%;\" class=\"parents-table\"><tr>"
                + "<td id=\"parents-selector-" + id + "-prepath\" class=\"outer-td td-prepath\">" + prePathHtml + "</span></td>"
                + "<td class=\"outer-td td-input\">"
                + "   <input value=\"" + initialTitle + "\" class=\"parents-selector\" id=\"parents-selector-" + id + "\" />"
                + "</td>"
                + "<td class=\"outer-td td-afterpath\">"
                + "   <a href=\"/pages/edit/0/"+base64_encode(initialTitle)+"\" id=\"parents-selector-"+id+"-parentlink\" target=\"_blank\"><span class=\"glyphicon glyphicon-hand-left\"></span></a>"
                + "   <span id=\"parents-selector-" + id + "-afterpath\"> &raquo; <?php echo($page->title); ?></span>"
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
                            prepathHtml += "<a href=\"/pages/edit/0/"+base64_encode(selData.paths[pathI][elemI])+"\" target=\"_blank\">" + selData.paths[pathI][elemI] + "</a> &raquo; ";
                        }
                        prepathHtml += "</td></tr>";
                    }
                    prepathHtml += "</table>";
                    $("#parents-selector-" + id + "-prepath").html(prepathHtml);
                    $("#parents-selector-"+id+"-parentlink").attr("href", "/pages/edit/"+selData.id);
                    updateParentsField();
                }
            }
        });
        $("#parents-selector-" + id).parent().attr("style", "width: 100%;");
    }

    $(document).ready(function () {
<?php
if (!isset($addMode)) {
    $i = 0;
    foreach ($page->parents as $parent) {
        $prePathHtml = "<table style=\"display: inline;\">";
        if(isset($parent->paths)) {
            foreach ($parent->paths as $path) {
                $prePathHtml .= "<tr><td>";
                foreach ($path as $elem) {
                    $prePathHtml .= "<a href=\"/pages/edit/0/".base64_encode($elem)."\" target=\"_blank\">" . $elem . "</a> &raquo; ";
                }
                $prePathHtml .= "</td></tr>";
            }
        }
        else {
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

    });
</script>
<p class="children-field">Dzieci: 
    <?php $first = true; ?>
    <?php foreach ($page->children as $child): ?>
        <?= ($first? "" : ", ") ?>
        <?= $this->Html->link($child->title, ['action' => 'edit', $child->id], ['target' => '_blank']) ?></li>
    <?php $first = false; endforeach; ?>
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
        if($i > 0) {
            $line = trim($line);
            if ($line == '') {
                echo("<div><br /></div>");
            } else if (startsWith($line, "###### ")) {
                echo("<div><h6>".$line."</h6></div>");
            } else if (startsWith($line, "##### ")) {
                echo("<div><h5>".$line."</h5></div>");
            } else if (startsWith($line, "#### ")) {
                echo("<div><h4>".$line."</h4></div>");
            } else if (startsWith($line, "### ")) {
                echo("<div><h3>".$line."</h3></div>");
            } else if (startsWith($line, "## ")) {
                echo("<div><h2>".$line."</h2></div>");
            } else if (startsWith($line, "# ")) {
                echo("<div><h1>".$line."</h1></div>");
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
    $(document).ready(function() {
        var mdEditor = $("#md-editor");
        mdEditor.on('keyup', function(evt) {
            if(evt.key === ' ') {
                
            }
        });
        mdEditor.on('paste input', function() {
            var restore = saveCaretPosition(this);
            var space = false;
            var newline = false;
            $("#md-editor div").each(function(i, _div) {
                var div = $(_div);
                $("br", div).each(function(i, _br) {
                    var br = $(_br);
                    if(!br.hasClass("marked")) {
                        br.addClass("marked");
                        //br.insertAfter("\n");
                        //div.append("\n");
                        newline=true;
                    }
                });
                /*if(!div.html().endsWith("\n")) {
                    div.append("\n");
                    //newline=true;
                }*/
                
                /*if(div.html().endsWith(" \n")) {
                    div.html(div.html().substr(0, div.html().length-2)+"&nbsp;\n");
                }
                if(div.html().endsWith(" ")) {
                    div.html(div.html().substr(0, div.html().length-1)+"&nbsp;");
                }*/
                //div.html(div.html().replace(" ", "&nbsp;"));
                
                if(div.html().trim().match(/^###### /)) {
                    div.html("<h6>"+div.text().trim()+"</h6>");
                }
                else if(div.html().trim().match(/^##### /)) {
                    div.html("<h5>"+div.text().trim()+"</h5>");
                }
                else if(div.html().trim().match(/^#### /)) {
                    div.html("<h4>"+div.text().trim()+"</h4>");
                }
                else if(div.html().trim().match(/^### /)) {
                    div.html("<h3>"+div.text().trim()+"</h3>");
                }
                else if(div.html().trim().match(/^## /)) {
                    div.html("<h2>"+div.text().trim()+"</h2>");
                    console.log("Inserting h2");
                }
                else if(div.html().trim().match(/^# /)) {
                    div.html("<h1>"+div.text().trim()+"</h1>");
                }
                
                $("h1, h2, h3, h4, h5, h6", div).each(function(i, _elem) {
                    var elem = $(_elem);
                    if(elem.html().trim() == '') elem.remove();
                });
            });
            $("#md-editor").html($("#md-editor").html().replace("<br class=\"marked\"></div>", "<br>\n</div>"));
            
            console.log($("#md-editor").html());
            restore(space, newline);
        });
    });
</script>
<p><br /></p>
<?php
echo $this->Form->hidden('body', ['id' => 'edit-form-body', 'value'=>'']);
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