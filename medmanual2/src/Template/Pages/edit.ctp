<h1><?= (isset($addMode) ? "Add" : "Edit") ?> Page</h1>
<?php
echo $this->Form->create($page, ['id' => 'edit-form']);
echo $this->Form->input('title');
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
        var elem = "<table style=\"width: 100%;\"><tr>"
                + "<td id=\"parents-selector-" + id + "-prepath\">" + prePathHtml + "</span></td>"
                + "<td><input value=\"" + initialTitle + "\" class=\"parents-selector\" id=\"parents-selector-" + id + "\" /></td>"
                + "<td><span id=\"parents-selector-" + id + "-afterpath\"> &raquo;<?php echo($page->title); ?></span></td>"
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
                            prepathHtml += selData.paths[pathI][elemI] + " &raquo; ";
                        }
                        prepathHtml += "</td></tr>";
                    }
                    prepathHtml += "</table>";
                    $("#parents-selector-" + id + "-prepath").html(prepathHtml);
                    updateParentsField();
                }
            }
        });
    }

    $(document).ready(function () {
<?php
if (!isset($addMode)) {
    $i = 0;
    foreach ($page->parents as $parent) {
        $prePathHtml = "<table style=\"display: inline;\">";
        foreach ($parent->paths as $path) {
            $prePathHtml .= "<tr><td>";
            foreach ($path as $elem) {
                $prePathHtml .= $elem . " &raquo; ";
            }
            $prePathHtml .= "</td></tr>";
        }
        $prePathHtml .= "</table>";
        echo("createNewForm(" . $i . ", '" . $parent->title . "', " . $parent->id . ", '" . $prePathHtml . "');");
        $i++;
    }
    echo("createNewForm(" . $i . ", '', null, 'Dodaj rodzica:');");
} else {
    echo("createNewForm(0, '', null, 'Dodaj rodzina:');");
}
?>

    });
</script>

<div id="md-editor" contenteditable style="border: 1px dotted greenyellow;">
    <?php

    function startsWith($haystack, $needle) {
        $length = strlen($needle);
        return (substr($haystack, 0, $length) === $needle);
    }

    $lines = explode("\n", $page->body);
    foreach ($lines as $line) {
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
    ?>
</div>

<?php
echo $this->Form->hidden('body', ['id' => 'edit-form-body']);
?>
<h2>Children</h2>
<ul>
<?php foreach ($page->children as $child): ?>
        <li><?= $this->Html->link($child->title, ['action' => 'edit', $child->id], ['target' => '_blank']) ?></li>
    <?php endforeach; ?>
</ul>
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