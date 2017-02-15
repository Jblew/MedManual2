<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Datasource\ConnectionManager;

class PagesTable extends Table {

    //public $virtualFields = array(
    //    'path' => 'get_path(Page.id)'
    //);

    public $hasOne = array('User');
    public $belongsToMany = array('Parents', [
            'joinTable' => 'pages_parents',
            'className' => 'Page',
            'foreignKey' => 'page_id',
            'targetForeignKey' => 'parent_id'
    ]);

    public function initialize(array $config) {
        $this->primaryKey('id');
    }

    public function getPaths($id) {
        $paths = array();

        $conn = ConnectionManager::get('default');
        
        $conn->execute("SET @@session.max_sp_recursion_depth = 255;");
        $conn->execute("DROP TEMPORARY TABLE IF EXISTS paths;");
        $conn->execute("CREATE TEMPORARY TABLE paths (path VARCHAR(255));");
        $conn->execute("CALL get_paths_procedure(?, '');", [$id]);
        $stmt = $conn->execute("SELECT * FROM paths;");

        $rows = $stmt->fetchAll('assoc');

        foreach ($rows as $row) {
            $paths[] = $row;
        }

        return $paths;
    }

    /* public function validationDefault(Validator $validator)
      {
      $validator
      ->notEmpty('title')
      ->requirePresence('title')
      ->notEmpty('body')
      ->requirePresence('body');

      return $validator;
      } */
}
