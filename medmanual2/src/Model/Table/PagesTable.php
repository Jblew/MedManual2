<?php

namespace App\Model\Table;

use Cake\ORM\Table;

class PagesTable extends Table
{
    public $virtualFields = array(
        'path' => 'get_path(Page.id)'
    );
    
    public $hasOne = array('User', 'Parent' => array('className' => 'Page'));
    
    public function initialize(array $config)
    {
        //$this->addBehavior('version_date');
    }
    
    /*public function validationDefault(Validator $validator)
    {
        $validator
            ->notEmpty('title')
            ->requirePresence('title')
            ->notEmpty('body')
            ->requirePresence('body');

        return $validator;
    }*/
}