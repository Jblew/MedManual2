<?php

namespace App\Model\Table;

use Cake\ORM\Table;
use Cake\Datasource\ConnectionManager;

class PagesTable extends Table {

    //public $virtualFields = array(
    //    'path' => 'get_path(Page.id)'
    //);

    public function initialize(array $config) {
        $this->primaryKey('id');
        $this->belongsTo('Users');
        $this->belongsToMany('Parents', [
            'joinTable' => 'pages_parents',
            'className' => 'Pages',
            'foreignKey' => 'page_id',
            'targetForeignKey' => 'parent_id',
            'bindingKey' => 'id'
        ]);
        $this->belongsToMany('Children', [//belongsToMany is not a mistae
            'joinTable' => 'pages_parents',
            'className' => 'Pages',
            'foreignKey' => 'parent_id',
            'targetForeignKey' => 'page_id',
            'bindingKey' => 'id'
        ]);
        $this->hasMany('Tags');
    }

    public function getPaths($id) {
        $paths = array();

        $conn = ConnectionManager::get('default');

        $conn->execute("SET @@session.max_sp_recursion_depth = 255;DROP TEMPORARY TABLE IF EXISTS paths;CREATE TEMPORARY TABLE paths (path VARCHAR(255));");
        $conn->execute("CALL get_paths_procedure(?, '');", [$id]);
        $stmt = $conn->execute("SELECT * FROM paths;");

        $rows = $stmt->fetchAll('assoc');

        foreach ($rows as $row) {
            $path = array_filter(explode("$$$", $row['path']));
            array_pop($path);
            $paths[] = $path;
        }

        return $paths;
    }

    public function buildTree() {
        $pages = $this->find('all', ['order' => ['Pages.id' => 'ASC']])->toArray();
        //print_r($pages);
        $conn = ConnectionManager::get('default');

        $stmt = $conn->execute("SELECT pages.id as page_id, pages_parents.parent_id as parent_id from pages LEFT JOIN pages_parents ON pages.id = pages_parents.page_id;");
        $rows = $stmt->fetchAll('assoc');
        $parentsOfPages = array();
        $childrenOfPages = array();
        $pagesWithoutParents = array();

        foreach ($rows as $row) {
            $pageId = $row['page_id'];
            $parentId = $row['parent_id'];
            if ($parentId === 'NULL' || $parentId == null) {
                $pagesWithoutParents = $this->_getPageById($pageId, $pages);
            } else {
                if (!isset($parentsOfPages[$pageId])) {
                    $parentsOfPages[$pageId] = array();
                }
                $parentsOfPages[$pageId][] = $parentId;

                if (!isset($childrenOfPages[$parentId])) {
                    $childrenOfPages[$parentId] = array();
                }
                $childrenOfPages[$parentId][] = $pageId;
            }
        }

        //var_dump($childrenOfPages);

        $tree = $pages[0];
        
        $tree['children'] = $this->_populateNode($pages[0]->id, $pages, $childrenOfPages);
        
        $orphanPagesNode = $this->Pages->newEntity();
        $orphanPagesNode->title = 'Pages withous parents';
        $orphanPagesNode->id = 0;
        $orphanPagesNode->children = $pagesWithousParents;
        
        return $tree;
    }

    private function _populateNode($id, $pages, $childrenOfPages) {
        $children = array();

        if (!isset($childrenOfPages[$id])) {
            return array();
        }

        foreach ($childrenOfPages[$id] as $childId) {
            $child = $this->_getPageById($childId, $pages);
            $child['children'] = $this->_populateNode($childId, $pages, $childrenOfPages);
            $children[] = $child;
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
