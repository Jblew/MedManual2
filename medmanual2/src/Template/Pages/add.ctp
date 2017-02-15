<h1>Add Page</h1>
<?php
echo $this->Form->create($page);
echo $this->Form->input('title');
//echo "<input id=\"parent-autocomplete\" />";
echo "<input type=\"hidden\" name=\"parents\" id=\"parents-base\"></span>";
echo $this->Form->input('body', ['rows' => '3']);
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
?>
<script type="text/javascript">
    function createNewForm(id) {
        var elem = "<input id=\"parents-selector-"+id+"\" />";
        if(id == 0) {
            $("#parents-base").after(elem);
        }
        else {
            $("#parents-selector-"+(id-1)).after(elem);
        }
        
        $("#parents-selector-"+id).easyAutocomplete({
                url: function(phrase) {
                return "/pages/ajaxFindPage?term=" + phrase;
            },
            getValue: "title",
            list: {
                onSelectItemEvent: function() {
                    if(!("#parents-selector-"+(id+1))) createNewForm(id+1);
                }
            }
        });
    }
    
    $(document).ready(function() {
        createNewForm(0);
    });
</script>