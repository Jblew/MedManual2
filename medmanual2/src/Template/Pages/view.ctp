<h1><?= h($page->title) ?></h1>
<blockquote>
    <?php
        $addBr = false;
        foreach($paths as $path) {
            if($addBr) echo("<br />");
            
            foreach($path as $elem) {
                echo(" &raquo; ");
                echo("<a href=\"/pages/view/".base64_encode(".$elem.")."\">".$elem."</a>");
            }
            
        }
    ?>
<blockquote>
<p><?= h($page->body) ?></p>
<hr />

<hr />

<pre>
    <?php print_r($paths) ?>
</pre>