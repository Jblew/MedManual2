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
        $this->hasMany('Tags', [
	    'saveStrategy' => 'replace'
	]);
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

    public function getFlatTreePages() {
	$conn = ConnectionManager::get('default');

        $stmt = $conn->execute("SELECT pages.id as page_id, pages.title as page_title, pages_parents.parent_id as parent_id from pages LEFT JOIN pages_parents ON pages.id = pages_parents.page_id;");
        $rows = $stmt->fetchAll('assoc');

	$flatTree = array();

	foreach($rows as $row) {
		$flatTree[] = array("id" => $row['page_id'], "title" => $row['page_title'], "parent_id" => $row['parent_id']);
	}
	
	return $flatTree;
    }

    public function buildTree() {
        $pages = $this->find('all', ['fields' => ['Pages.id', 'Pages.title', 'Pages.user_id'], 'order' => ['Pages.id' => 'ASC']])->toArray();

        $conn = ConnectionManager::get('default');

        $stmt = $conn->execute("SELECT pages.id as page_id, pages_parents.parent_id as parent_id from pages LEFT JOIN pages_parents ON pages.id = pages_parents.page_id;");
        $rows = $stmt->fetchAll('assoc');

        $parentsOfPages = array();
        $childrenOfPages = array();

        foreach ($rows as $row) {
            $pageId = $row['page_id'];
            $parentId = $row['parent_id'];
            if (($parentId === 'NULL' || $parentId == null) && $pageId != 1) {
                //$pagesWithoutParents[] = $this->_getPageById($pageId, $pages);
		$parentId = 1;
            }
            if (!isset($parentsOfPages[$pageId])) {
                $parentsOfPages[$pageId] = array();
            }
            $parentsOfPages[$pageId][] = $parentId;

            if (!isset($childrenOfPages[$parentId])) {
                $childrenOfPages[$parentId] = array();
            }
            $childrenOfPages[$parentId][] = $pageId;
        
        }
        //var_dump($pagesWithoutParents);

        $tree = $pages[0];
        
        $tree['children'] = $this->_populateNode($pages[0]->id, $pages, $childrenOfPages);
        
        //$orphanPagesNode = ['title' => 'Pages without parents', 'id' => 0, 'children' => $pagesWithoutParents];
        //$orphanPagesNode->title = 'Pages withous parents';
        //$orphanPagesNode->id = 0;
        //$orphanPagesNode->children = $pagesWithoutParents;
	//$tree['children'][] = (object) $orphanPagesNode;
	//$orphanPagesNode = (array)$this->newEntity();
	//$orphanPagesNode['title'] = "Pages without parents";
	//$orphanPagesNode->id = 0;
	//$orphanPagesNode->children = [];//$pagesWithoutParents;
	//$tree['children'][] = $orphanPagesNode;
	//if(isset($_GET['d'])) print_r($tree['children']);
        //$tree['children'][] = $orphanPagesNode;
        
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
