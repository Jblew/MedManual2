<h1>Strony</h1>
<?= $this->Html->link('Dodaj stronę', ['action' => 'add']) ?>

<ul>
<?php

function _getNodeHtml($page) {
    $out = "<li>"
            . "<strong>".$this->Html->link($page->title, ['action' => 'view', $page->id])."</strong>"
            . " &raquo; "
            . $this->Html->link('Edit', ['action' => 'edit', $page->id])
            . "<ul>";
    
    foreach($page['children'] as $child) {
        $out .= _getNodeHtml($child);
    }
    
    $out .= "</ul>";
    return $out;
}

echo _getNodeHtml($tree);

?>
</ul>
<!--
<table>
    <tr>
        <th>Id</th>
        <th>Title</th>
        <th>Action</th>
    </tr>


    <?php foreach ($pages as $page): ?>
    <tr>
        <td><?= $page->id ?></td>
        <td>
            <?= $this->Html->link($page->title, ['action' => 'view', $page->id]) ?>
        </td>
        <td>
            <?= $this->Form->postLink(
                'Delete',
                ['action' => 'delete', $page->id],
                ['confirm' => 'Are you sure?'])
            ?>
            <?= $this->Html->link('Edit', ['action' => 'edit', $page->id]) ?>
        </td>
    </tr>
    <?php endforeach; ?>
</table>
-->