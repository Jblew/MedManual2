<h1><?= h($page->title) ?></h1>
<?php if($page->id == 1): ?>
    <p class="open-edit-button">
        <a id="editor-opener"><span class="glyphicon glyphicon-list-alt"></span> Otwórz okno edycji</a>
    </p>
    <script type="text/javascript">
        $(document).ready(function() {
            $("#editor-opener").on('click', function() {
                window.open(
                    '/pages/index',
                    "", "height=800,width=600"
                );
            });
        });
    </script>
<?php endif; ?>
<p class="parents-field">
    <?php
        $addBr = false;
        foreach($paths as $path) {
            if($addBr) echo("<br />");
            
            foreach($path as $elem) {
                echo(" &raquo; ");
                echo("<a href=\"/pages/view/0/".base64_encode($elem)."\">".$elem."</a>");
            }
            $addBr = true;
        }
    ?>
</p>
    <p class="children-field">Dzieci: 
    <?php $first = true; ?>
    <?php foreach ($page->children as $child): ?>
        <?= ($first ? "" : ", ") ?>
        <?= $this->Html->link($child->title, ['action' => 'edit', $child->id], ['target' => '_blank']) ?></li>
        <?php $first = false;
    endforeach; ?>
</p>
<div class="content-view">
    <?php

    function startsWith($haystack, $needle) {
        $length = strlen($needle);
        return (substr($haystack, 0, $length) === $needle);
    }

    $i = 0;
    $lines = explode("\n", $page->body);
    foreach ($lines as $line) {
        if ($i > 0) {
            $line = trim($line);
            if ($line == '') {
                echo("<div><br /></div>");
            } else if (startsWith($line, "###### ")) {
                echo("<div class=\"h6\">" . $line . "</div>");
            } else if (startsWith($line, "##### ")) {
                echo("<div class=\"h5\">" . $line . "</div>");
            } else if (startsWith($line, "#### ")) {
                echo("<div class=\"h4\">" . $line . "</div>");
            } else if (startsWith($line, "### ")) {
                echo("<div class=\"h3\">" . $line . "</div>");
            } else if (startsWith($line, "## ")) {
                echo("<div class=\"h2\">" . $line . "</div>");
            } else if (startsWith($line, "# ")) {
                echo("<div class=\"h1\">" . $line . "</div>");
            } else {
                echo("<div>" . $line . "</div>");
            }
        }
        $i++;
    }
    ?>
</div>
<hr />