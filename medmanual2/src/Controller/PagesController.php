<?php

/**
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link      http://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   http://www.opensource.org/licenses/mit-license.php MIT License
 */

namespace App\Controller;

use Cake\Core\Configure;
use Cake\Network\Exception\ForbiddenException;
use Cake\Network\Exception\NotFoundException;
use Cake\View\Exception\MissingTemplateException;

/**
 * Static content controller
 *
 * This controller will render views from Template/Pages/
 *
 * @link http://book.cakephp.org/3.0/en/controllers/pages-controller.html
 */
class PagesController extends AppController {

    public function index() {
        $tree = $this->Pages->buildTree();

        $isAjax = isset($_GET['ajax']);

        if ($isAjax) {
            Configure::write('debug', 0);
            $this->autoRender = false;
            $this->viewBuilder()->layout('ajax');
            echo json_encode(array("tree" => $tree));
        } else
            $this->set('tree', $tree);
    }

    public function ajaxFlatTree() {
        $flatTree = $this->Pages->getFlatTreePages();
        Configure::write('debug', 0);
        $this->autoRender = false;
        $this->viewBuilder()->layout('ajax');
        echo json_encode(array("flatTree" => $flatTree));
    }

    public function view($id, $base64 = null) {
        $page = null;
        if ($id > 0) {
            $page = $this->Pages->get($id, [
                'contain' => ['Parents', 'Children']
            ]);
        } else {
            $page = $this->Pages->find('all', [
                        'conditions' => ['Pages.title =' => base64_decode($base64)],
                        'contain' => ['Parents', 'Children']
                    ])->first();
        }
        if ($page === null)
            throw new NotFoundException();

        $this->set(compact('page'));
        $this->set('paths', $this->Pages->getPaths($id));
    }

    public function add($parent_id = 1) {
        //print_r($this->request);
        $page = $this->Pages->newEntity();
        $parent = $this->Pages->get($parent_id);
        $parent->paths = $this->Pages->getPaths($parent->id);
        $page->parents = [$parent];

        if ($this->request->is('post')) {
            $page = $this->_preparePageData($page, $this->request->data);

            if ($this->Pages->save($page, ['associated' => ['Parents', 'Tags']])) {
                $this->Flash->success(__('Your page has been saved.'));
                return $this->redirect(['action' => 'edit', $page->id]);
            }
            $this->Flash->error(__('Unable to add your page.'));
        }
        $this->set('page', $page);
    }

    public function edit($id, $base64 = null) {
        $isAjax = isset($_GET['ajax']);
        $page = null;
        if ($id > 0) {
            $page = $this->Pages->get($id, [
                'contain' => ['Parents', 'Children', 'Tags']
            ]);
            foreach ($page->parents as $i => $parent) {
                $page->parents[$i]->paths = $this->Pages->getPaths($page->parents[$i]->id);
            }
        } else {
            $page = $this->Pages->find('all', [
                        'conditions' => ['Pages.title =' => base64_decode($base64)],
                        'contain' => ['Parents', 'Children', 'Tags']
                    ])->first();
        }
        if ($page === null)
            throw new NotFoundException();

        if ($this->request->is(['post', 'put'])) {
            $page = $this->_preparePageData($page, $this->request->data);

            if ($this->Pages->save($page, ['associated' => ['Parents', 'Tags']])) {
                if (!$isAjax) {
                    $this->Flash->success(__('Your page has been updated.'));
                    return $this->redirect(['action' => 'edit', $page->id]);
                }
            } else {
                if ($isAjax) {
                    Configure::write('debug', 0);
                    $this->autoRender = false;
                    $this->viewBuilder()->layout('ajax');
                    echo json_encode(array("error" => "Unable to update page"));
                } else
                    $this->Flash->error(__('Unable to update your page.'));
            }
        }

        if ($isAjax) {
            Configure::write('debug', 0);
            $this->autoRender = false;
            $this->viewBuilder()->layout('ajax');
            echo json_encode($page);
        } else
            $this->set('page', $page);
    }

    public function jsonSave($id) {
        Configure::write('debug', 0);
        $this->autoRender = false;
        $this->viewBuilder()->layout('ajax');
        //var_dump($id);
        $page = null;
        if ($id == "new") {
            $page = $this->Pages->newEntity();
        } else {
            $page = $this->Pages->get($id, [
                'contain' => ['Parents', 'Children', 'Tags']
            ]);
            //foreach ($page->parents as $i => $parent) {
            //    $page->parents[$i]->paths = $this->Pages->getPaths($page->parents[$i]->id);
            //}
        }

        if ($page === null) {
            throw new NotFoundException();
        }

        if ($this->request->is(['post', 'put'])) {
            $jsonData = (array) $this->request->input('json_decode');
            $page = $this->_preparePageData($page, $jsonData);

            if ($this->Pages->save($page, ['associated' => ['Parents', 'Tags']])) {
                $pageReloaded = $this->Pages->get($page->id, [
                    'contain' => ['Parents', 'Children', 'Tags']
                ]);
                echo json_encode(array("flatTree" => $this->Pages->getFlatTreePages(), "pages" => array($pageReloaded), "requestData" => $jsonData));
            } else {
                echo json_encode(array("error" => "Unable to update page"));
            }
        }
    }

    private function _preparePageData($page, $requestData) {
        $this->loadModel('Tags');
        $log = "";
        if (isset($requestData['parentsids'])) {
            $newParents = array_filter(explode(",", $requestData['parentsids']), function($v) {
                return $v != null && trim($v) != '' && $v !== "null";
            });

            $requestData['parents'] = ['_ids' => $newParents];
            $log .= "Parents loaded";
        }

        if (isset($requestData['tagsnames'])) {
            $requestData['tags'] = [];
            $tagsNames = array_filter(explode(",", $requestData['tagsnames']), function($v) {
                return $v != null && trim($v) != '' && $v !== "null";
            });
            $tags = [];
            $tagsList = array();
            foreach ($tagsNames as $tagName_) {
                $tagName = strtolower(trim($tagName_));
                $tag = $this->Tags->find()->where(['tag' => $tagName])->first();

                if ($tag == null || (isset($page->id) && $page->id == $tag->page_id)) {
                    if (!in_array($tagName, $tagsList)) {
                        $tags[] = ['tag' => $tagName];
                        $tagsList[] = $tagName;
                    }
                }
            }
            $requestData['tags'] = $tags;
            $log .= "tags loaded; ";
        }

        //echo("<pre>");
        //var_dump($requestData);
        if (isset($requestData['parentsids']) && isset($requestData['tagsnames']))
            $this->Pages->patchEntity($page, $requestData, ['associated' => (['Parents', 'Tags'])]);
        else if (isset($requestData['parentsids']))
            $this->Pages->patchEntity($page, $requestData, ['associated' => (['Parents'])]);
        else if (isset($requestData['tagsnames']))
            $this->Pages->patchEntity($page, $requestData, ['associated' => (['Tags'])]);
        else
            $this->Pages->patchEntity($page, $requestData, []);

        $page->body = str_replace("[newline]", "\n", $page->body);
        if (substr($page->body, -1) === "\n") {
            $page->body = substr($page->body, 0, strlen($page->body) - 1);
        }
        //var_dump($page);
        return $page;
    }

    public function delete($id) {
        $this->request->allowMethod(['post', 'delete']);

        $article = $this->Pages->get($id);
        if ($this->Pages->delete($article)) {
            $this->Flash->success(__('The page with id: {0} has been deleted.', h($id)));
            return $this->redirect(['action' => 'index']);
        }
    }

    public function ajaxFindPage() {
        Configure::write('debug', 0);
        $this->autoRender = false;
        $this->layout = 'ajax';
        var_dump($this->request);
        $query = $this->request->getParam('term');
        $pages = $this->Pages->find('all', array(
                    'conditions' => array('Pages.title  COLLATE utf8_general_ci LIKE' => '%' . $query . '%'),
                    'fields' => array('title', 'id')))->limit(10)->all();
        if (count($pages) < 1) {
            $pages = $this->Pages->find('all', array(
                        'contain' => ['Tags']
                        ))->limit(10)->all();
        }
        if (count($pages) < 1) {
            $pages = $this->Pages->find('all', array(
                        'conditions' => array('Pages.body COLLATE utf8_general_ci LIKE' => '%' . $query . '%'),
                        'fields' => array('title', 'id'))
                    )->limit(10)->all();
        }
        $response = array();
        foreach ($pages as $page) {
            $response[] = ['id' => $page->id, 'title' => $page->title, 'paths' => $this->Pages->getPaths($page->id)];
        }
        echo json_encode($response);
    }

    public function match($findStr = '') {
        Configure::write('debug', 0);
        $this->autoRender = false;
        $this->viewBuilder()->layout('ajax');
        $this->loadModel('Tags');

        $findStr = trim(base64_decode($findStr));

        $page = $this->Pages->find()->where(['title' => $findStr])->first();
        if ($page != null) {
            echo json_encode(['id' => $page->id]);
            return;
        }

        $tag = $this->Tags->find()->where(['tag' => $findStr])->first();
        if ($tag != null) {
            echo json_encode(['id' => $tag->page_id]);
            return;
        }

        echo json_encode([]);
    }

    public function saveFile() {
        Configure::write('debug', 0);
        $this->autoRender = false;
        $this->viewBuilder()->layout('ajax');
        $this->request->allowMethod(['post']);

        if (!empty($this->request->data['upload']['name'])) {
            $file = $this->request->data['upload']; //put the data into a var for easy use

            $ext = substr(strtolower(strrchr($file['name'], '.')), 1); //get the extension
            $arr_ext = array('jpg', 'jpeg', 'gif', 'png'); //set allowed extensions
            $setNewFileName = time() . "_" . rand(000000, 999999);

            if (in_array($ext, $arr_ext)) {
                move_uploaded_file($file['tmp_name'], WWW_ROOT . '/md_img/' . $setNewFileName . '.' . $ext);
                $imageFileName = $setNewFileName . '.' . $ext;
                echo json_encode(array('url' => '/md_img/' . $imageFileName));
            } else
                echo json_encode(array('error' => 'Disallowed image extension'));
        } else
            echo json_encode(array('error' => 'No data', 'request_data' => $this->request->data));
    }

    /**
     * Displays a view
     *
     * @return void|\Cake\Network\Response
     * @throws \Cake\Network\Exception\ForbiddenException When a directory traversal attempt.
     * @throws \Cake\Network\Exception\NotFoundException When the view file could not
     *   be found or \Cake\View\Exception\MissingTemplateException in debug mode.
     */
    /* public function display()
      {
      $path = func_get_args();

      $count = count($path);
      if (!$count) {
      return $this->redirect('/');
      }
      if (in_array('..', $path, true) || in_array('.', $path, true)) {
      throw new ForbiddenException();
      }
      $page = $subpage = null;

      if (!empty($path[0])) {
      $page = $path[0];
      }
      if (!empty($path[1])) {
      $subpage = $path[1];
      }
      $this->set(compact('page', 'subpage'));

      try {
      $this->render(implode('/', $path));
      } catch (MissingTemplateException $e) {
      if (Configure::read('debug')) {
      throw $e;
      }
      throw new NotFoundException();
      }
      } */
}
