<?php
/**
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @since         0.10.0
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

$cakeDescription = 'CakePHP: the rapid development php framework';
?>
<!DOCTYPE html>
<html>
<head>
    <?= $this->Html->charset() ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?= $this->fetch('title') ?> - Manuał Medyczny JL 2.0
    </title>
    <?= $this->Html->meta('icon') ?>

    <?= $this->Html->css('base.css') ?>
    <?= $this->Html->css('cake.css') ?>
    <?= $this->Html->css('easy-autocomplete.min.css') ?>
    <?= $this->Html->css('style.css') ?>

    <?= $this->fetch('meta') ?>
    <?= $this->fetch('css') ?>
    
    <?=  $this->Html->script('jquery-3.1.1.min.js') ?> 
    <?=  $this->Html->script('jquery.easy-autocomplete.min.js') ?>
    <?=  $this->Html->script('rangy/rangy-core.js') ?>
    <?=  $this->Html->script('rangy/rangy-classapplier.js') ?>
    <?=  $this->Html->script('rangy/rangy-textrange.js') ?>
    <?=  $this->Html->script('scripts.js') ?> 
    <?= $this->fetch('script') ?>
</head>
<body>
    <nav class="top-bar expanded" data-topbar role="navigation">
        <ul class="title-area large-3 medium-4 columns">
            <li class="name">
                <h1><a href="/"><?= $this->fetch('title') ?></a></h1>
            </li>
        </ul>
        <div class="top-bar-section">
            <div class="search-container">
                <input class="search-box" value="" id="top-search-box" />
            </div>
        </div>
    </nav>
<script type="text/javascript">
    var editMode = false;
    $(document).ready(function() {
        $("#top-search-box").easyAutocomplete({
             url: function (phrase) {
                 return "/pages/ajaxFindPage?term=" + phrase;
             },
             getValue: "title",
             list: {
                 onChooseEvent: function () {
                     var selData = $("#top-search-box").getSelectedItemData();
                     if(editMode) {
                         window.location.href='/pages/edit/'+selData.id;
                     }
                     else {
                         window.location.href='/pages/view/'+selData.id;
                     }
                 }
             }
         });
    });
</script>
    
    <?= $this->Flash->render() ?>
    <div class="container clearfix">
        <?= $this->fetch('content') ?>
    </div>
    <footer>
    </footer>
    
</body>
</html>
