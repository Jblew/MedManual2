<h1>Strony</h1>
<?= $this->Html->link('Dodaj stronę', ['action' => 'add']) ?>

<table>
    <tr>
        <th>Id</th>
        <th>Title</th>
        <th>Action</th>
    </tr>

    <!-- Here is where we iterate through our $articles query object, printing out article info -->

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
