var express = require('express');
var router = express.Router();
const controller = require('../controllers/controller');

const {
	index,
	login_get,
	sign_up_get,
	login_post,
	sign_up_post,
	message_post,
	logout,
	message_delete,
	secret_code_get,
	secret_code_post,
	redirect,
} = controller;

/* GET home page. */
router.get('/', index);
router.post('/', message_post);
router.get('/login', login_get);
router.get('/sign_up', sign_up_get);
router.post('/login', login_post);
router.post('/sign_up', sign_up_post);
router.get('/logout', logout);
router.get('/delete/:id', message_delete);
router.get('/secret_code', secret_code_get);
router.post('/secret_code', secret_code_post);
router.get('/redirect', redirect);

module.exports = router;
