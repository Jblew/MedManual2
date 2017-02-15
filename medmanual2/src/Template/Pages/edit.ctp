<h1><?= (isset($addMode)? "Add" : "Edit") ?> Page</h1>
<?php
print_r($page);

echo $this->Form->create($page);
echo $this->Form->input('title');
//echo "<input id=\"parent-autocomplete\" />";
echo "<input type=\"hidden\" name=\"parents\" id=\"parents-base\">";
echo $this->Form->input('body', ['rows' => '3']);
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
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
                    var prepathHtml;
                    $("#parents-selector-"+id+"-prepath").html();
                    updateParentsField();
                }
            }
        });
    }
    
    $(document).ready(function() {
        <?php 
            if(!isset($addMode)) {
                foreach($page->parents as $parent) {
                    $prePathHtml = 
                }
            }
        ?>
        createNewForm(0);
    });
</script>