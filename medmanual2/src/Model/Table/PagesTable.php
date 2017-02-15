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

        $conn->execute("SET @@session.max_sp_recursion_depth = 255;DROP TEMPORARY TABLE IF EXISTS paths;CREATE TEMPORARY TABLE paths (path VARCHAR(255));");
        $conn->execute("CALL get_paths_procedure(?, '');", [$id]);
        $stmt = $conn->execute("SELECT * FROM paths;");

        $rows = $stmt->fetchAll('assoc');

        foreach ($rows as $row) {
            $paths[] = array_filter(explode("$$$", $row['path']));
        }

        return $paths;
    }

    public function buildTree() {
        $pages = $this->find('all', ['order' => ['Pages.id' => 'ASC']])->toArray();
        //print_r($pages);
        $conn = ConnectionManager::get('default');

        $stmt = $conn->execute("SELECT * FROM pages_parents;");
        $rows = $stmt->fetchAll('assoc');
        $parentsOfPages = array();
        $childrenOfPages = array();

        foreach ($rows as $row) {
            $pageId = $row['page_id'];
            $parentId = $row['parent_id'];
            if (!isset($parentsOfPages[$pageId])) {
                $parentsOfPages[$pageId] = array();
            }
            $parentsOfPages[$pageId][] = $parentId;

            if (!isset($childrenOfPages[$parentId])) {
                $childrenOfPages[$parentId] = array();
            }
            $childrenOfPages[$parentId][] = $pageId;
        }

        //var_dump($childrenOfPages);
        
        $tree = $pages[0];
        $tree['children'] = $this->_populateNode($pages[0]->id, $pages, $childrenOfPages);
        
        return $tree;
    }

    private function _populateNode($id, $pages, $childrenOfPages) {
        $children = array();

        if (!isset($childrenOfPages[$id])) {
            return array();
        }

        foreach ($childrenOfPages[$id] as $childId) {
            $child = _getPageById($childId, $pages);
            $child['children'] = $this->_populateNode($childId, $pages, $childrenOfPages);
            $children[] = (array)$child;
        }

        return $children;
    }

    private function _getPageById($id, $pages) {
        foreach ($pages as $p) {
            if ($p->id == $id) {
                return $p;
            }
        }
        return null;
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
