/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const ChatController = () => import('#controllers/chat_controller')

router.on('/').render('pages/home')
// router.get('/chat', async ({ view }) => {
//   return view.render('pages/chat')
// })
router.get('chat', [ChatController, 'index'])
