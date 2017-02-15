<h1><?= (isset($addMode)? "Add" : "Edit") ?> Page</h1>
<?php
print_r($page);

echo $this->Form->create($page);
echo $this->Form->input('title');
//echo "<input id=\"parent-autocomplete\" />";
echo "<input type=\"hidden\" name=\"parents\" id=\"parents-base\">";
?>
<script type="text/javascript">
    var parentsArr = [];
    function updateParentsField() {
        $("#parents-base").val(parentsArr.join(","));
        //console.log(parentsArr);
    }
    
    function createNewForm(id, initialTitle, initialId, prePathHtml) {
        parentsArr[id] = initialId;
        var elem = "<span id=\"parents-selector-"+id+"-prepath\">"+prePathHtml+"</span>"
            + "<input value=\""+initialTitle+"\" class=\"parents-selector\" id=\"parents-selector-"+id+"\" />"
            +"<span> &raquo;<?php echo($page->title); ?></span>"
            + "<br /><span id=\"parents-selector-"+id+"-appendbase\"></span>";
        
        if(id == 0) {
            $("#parents-base").after(elem);
        }
        else {
            $("#parents-selector-"+(id-1)+"-appendbase").after(elem);
        }
        
        $("#parents-selector-"+id).easyAutocomplete({
                url: function(phrase) {
                return "/pages/ajaxFindPage?term=" + phrase;
            },
            getValue: "title",
            list: {
                onSelectItemEvent: function() {
                    if(!($("#parents-selector-"+(id+1)).length)) {
                        createNewForm(id+1, '', null, '');
                    }
                    var selData = $("#parents-selector-"+id).getSelectedItemData();
                    parentsArr[id] = selData.id;
                    var prepathHtml = "<table style=\"display: inline;\">";
                    for(var pathI = 0; pathI < selData.paths.length;pathI++) {
                        prepathHtml += "<tr><td>";
                        for(var elemI = 0; elemI < selData.paths[pathI].length;elemI++) {
                            prepathHtml += selData.paths[pathI][elemI]+" &raquo; ";
                        }
                        prepathHtml += "</td></tr>";
                    }
                    prepathHtml += "</table>";
                    $("#parents-selector-"+id+"-prepath").html(prepathHtml);
                    updateParentsField();
                }
            }
        });
    }
    
    $(document).ready(function() {
        <?php 
            if(!isset($addMode)) {
                $i = 0;
                foreach($page->parents as $parent) {
                    $prePathHtml = "<table style=\"display: inline;\">";
                    foreach($parent->paths as $path) {
                        $prePathHtml .= "<tr><td>";
                        foreach($path as $elem) {
                            $prePathHtml .= $elem." &raquo; ";
                        }
                        $prePathHtml .= "</td></tr>";
                    }
                    $prePathHtml .= "</table>";
                    echo("createNewForm(".$i.", '".$parent->title."', ".$parent->id.", '".$prePathHtml."');");
                    $i++;
                }
                echo("createNewForm(".$i.", '', null, '');");
            }
            else {
                echo("createNewForm(0, '', null, '');");
            }
        ?>
        
    });
</script>


<?php
echo $this->Form->input('body', ['rows' => '10']);
?>
<pre><?php print_r($page); ?></pre>
<?php
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
?>