<h1>Manuał medyczny</h1>
<?= $this->Html->link('Dodaj stronę', ['action' => 'add']) ?>

<ul>
<?php

function _getNodeHtml($page) {
    $out = "<li>"
            . "<strong><a href=\"/pages/view/".$page->id."\">".$page->title."</a></strong>"
            . " "
            . "(<a href=\"/pages/edit/".$page->id."\">Edit</a>)"
            . "<ul>";
    
    if(isset($page['children'])) {
        foreach($page['children'] as $child) {
            $out .= _getNodeHtml($child);
        }
    }
    
    $out .= "</ul>";
    return $out;
}

echo _getNodeHtml($tree);



?>
</ul>
<!--
< $this->Form->postLink(
                'Delete',
                ['action' => 'delete', $page->id],
                ['confirm' => 'Are you sure?'])
            ?>
-->
