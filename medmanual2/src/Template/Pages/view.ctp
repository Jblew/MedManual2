<h1><?= h($page->title) ?></h1>
<p><?= h($page->body) ?></p>
<p><small>Created: <?= $page->created->format(DATE_RFC850) ?></small></p>
