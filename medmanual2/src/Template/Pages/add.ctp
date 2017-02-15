<h1>Add Page</h1>
<?php
echo $this->Form->create($page);
echo $this->Form->input('title');
echo "<input id=\"parent-autocomplete\" />";
echo $this->Form->input('body', ['rows' => '3']);
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
?>
<scrtipt type="text/javascript">
    $(document).ready(function() {
        $("#provider-json").easyAutocomplete({
                url: function(phrase) {
                return "pages/ajaxFindPage?term=" + phrase;
            },
            getValue: "title"
        });
    });
</script>