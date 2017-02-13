

<h1>Edit Page</h1>
<?php
    echo $this->Form->create($page);
    echo $this->Form->input('title');
    echo $this->Form->input('body', ['rows' => '3']);
    echo $this->Form->button(__('Save Page'));
    echo $this->Form->end();
?>
<p><?php print_r($page) ?></p>