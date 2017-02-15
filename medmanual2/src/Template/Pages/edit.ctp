<h1><?= (isset($addMode)? "Add" : "Edit") ?> Page</h1>
<?php
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
        /*var parentsStr = "";
        $(".parents-selector").each(function(item) {
            parentsStr+=$(item).getSelectedItemData().id+",";
        });
        $("#parents-base").val(parentsStr);*/
        console.log(parentsArr);
    }
    
    function createNewForm(id) {
        parents[id] = null;
        var elem = "<input class=\"parents-selector\" id=\"parents-selector-"+id+"\" /><span id=\"parents-selector-"+id+"-appendbase\"></span>";
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
                        createNewForm(id+1);
                    }
                    parentsArr[id] = $("#parents-selector-"+id).getSelectedItemData()).id;
                    updateParentsField();
                }
            }
        });
    }
    
    $(document).ready(function() {
        createNewForm(0);
    });
</script>