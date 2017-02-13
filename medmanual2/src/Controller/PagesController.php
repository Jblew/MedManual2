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
        $pages = $this->Pages->find('all');
        $this->set(compact('pages'));
    }

    public function view($id = null) {
        $page = $this->Pages->get($id);
        $page['path'] = array_filter(explode("$$$", $page['path'])); 
        $this->set(compact('page'));
    }

    public function add() {
        $page = $this->Pages->newEntity();
        if ($this->request->is('post')) {
            $page = $this->Pages->patchEntity($page, $this->request->data);
            if ($this->Pages->save($page)) {
                $this->Flash->success(__('Your page has been saved.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('Unable to add your page.'));
        }
        $this->set('page', $page);
    }

    public function edit($id = null) {
        $page = $this->Pages->get($id);
        if ($this->request->is(['post', 'put'])) {
            $this->Pages->patchEntity($page, $this->request->data);
            if ($this->Pages->save($page)) {
                $this->Flash->success(__('Your page has been updated.'));
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('Unable to update your page.'));
        }

        $this->set('page', $page);
    }

    public function delete($id) {
        $this->request->allowMethod(['post', 'delete']);

        $article = $this->Pages->get($id);
        if ($this->Pages->delete($article)) {
            $this->Flash->success(__('The page with id: {0} has been deleted.', h($id)));
            return $this->redirect(['action' => 'index']);
        }
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
