<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class TagsTable extends Table {

    //public $virtualFields = array(
    //    'path' => 'get_path(Page.id)'
    //);

    public function initialize(array $config) {
        $this->primaryKey('id');
        $this->belongsTo('Pages');
    }
}
