<script type="text/javascript">editMode = true;</script>
<!--
<?php var_dump($page); ?>
-->

<?php
echo $this->Form->create($page, ['id' => 'edit-form', 'label' => '']); //, 'enctype' => 'multipart/form-data']);
echo $this->Form->input('title', ['class' => 'title', 'label' => '', 'placeholder' => 'Title here...']);
?>
<p class="parents-field">
    <input type="hidden" name="parentsids" id="parents-base">
    <script type="text/javascript">
        $(document).ready(function () {
<?php
$i = 0;
foreach ($page->parents as $parent) {
    $prePathHtml = "<table style=\\\"display: inline;\\\">";
    if (isset($parent->paths)) {
        foreach ($parent->paths as $path) {
            $prePathHtml .= "<tr><td>";
            foreach ($path as $elem) {
                $prePathHtml .= "<a href=\\\"javascript:window.open('/pages/edit/0/" . base64_encode($elem) . "', '','height=800,width=600');\\\">" . $elem . "</a> &raquo; ";
            }//createNewForm(0, 'Układ immunologiczny', 3, "<table style=\"display: inline;\"><tr><td><a href=\"javascript:window.open('/pages/edit/0/TWFudWHFgiBNZWR5Y3pueQ==', '','height=800,width=600');\">Manuał Medyczny</a> &raquo; <a href="javascript:window.open(\"/pages/edit/0/Q2hvcm9ieSBpIG9iamF3eQ==', '','height=800,width=600');\">Choroby i objawy</a> &raquo; </td></tr></table>');createNewForm(1, 'Choroby jednogenowe', 5, '<table style="display: inline;"><tr><td><a href="javascript:window.open(\"/pages/edit/0/TWFudWHFgiBNZWR5Y3pueQ==', '','height=800,width=600');\">Manuał Medyczny</a> &raquo; <a href="javascript:window.open(\"/pages/edit/0/Q2hvcm9ieSBpIG9iamF3eQ==', '','height=800,width=600');\">Choroby i objawy</a> &raquo; <a href="javascript:window.open(\"/pages/edit/0/Q2hvcm9ieSBnZW5ldHljem5l', '','height=800,width=600');\">Choroby genetyczne</a> &raquo; </td></tr></table>');createNewForm(2, '', null, 'Dodaj nowego rodzica:');            updateParentsField();

            $prePathHtml .= "</td></tr>";
        }
    } else {
        $prePathHtml .= "<tr><td>";
        $prePathHtml .= "<span class=\\\"glyphicon glyphicon-home\\\"></span> &raquo; ";
        $prePathHtml .= "</td></tr>";
    }
    $prePathHtml .= "</table>";
    echo("createNewForm(" . $i . ", '" . $parent->title . "', " . $parent->id . ", \"" . $prePathHtml . "\");");
    $i++;
}
echo("createNewForm(" . $i . ", '', null, 'Add new parent:');");
?>
            updateParentsField();
        });
    </script>
</p>
<p class="children-field">Children:
    <?php $first = true; ?>
    <?php if (!isset($page->children)) $page->children = []; ?>
    <?php foreach ($page->children as $child): ?>
        <?= ($first ? "" : ", ") ?>
        <a href="javascript:window.open('/pages/edit/<?= $child->id ?>', '','height=800,width=600');">
            <?= $child->title ?>
        </a>
        <?php
        $first = false;
    endforeach;
    ?>

    <?php if (isset($page->id)): ?>
        <?= ($first ? "" : ", ") ?>
        <a href="javascript:window.open('/pages/add/<?php echo($page->id); ?>', '','height=800,width=600');;"><span class="glyphicon glyphicon-plus-sign"> </span> Add new child</a>
    <?php else: ?>
        In order to add children you have to save the page first.
<?php endif; ?>
</p>
<p class="tags-field">
    Tags: <input type="text" name="tagsnames" value="<?php
    if (isset($page->tags)) {
        foreach ($page->tags as $tag) {
            echo $tag->tag;
            echo ", ";
        }
    }
    ?>">
</p>
<div id="md-editor" contenteditable>
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
    if (trim($page->body) === "") {
        echo("<div>Tu wpisz treść...</div>");
    }
    ?>
</div>
<p></p>
<?php
echo $this->Form->hidden('body', ['id' => 'edit-form-body', 'value' => '']);
?>
<?php
echo $this->Form->button(__('Save Page'));
echo $this->Form->end();
?>
<?= $this->Html->script('editor.js') ?> 
