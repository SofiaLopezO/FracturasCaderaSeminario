// routes/admin.users.routes.js
const express = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controller/admin.users.controller');

const router = express.Router();


router.post('/users',                   auth(['ADMIN']), ctrl.createUserWithRole);


router.post('/users/:id/roles',         auth(['ADMIN']), ctrl.addRoleToUser);
router.delete('/users/:id/roles/:role', auth(['ADMIN']), ctrl.removeRoleFromUser);


router.get('/users',                    auth(['ADMIN']), ctrl.listUsers);
router.get('/users/:id',                auth(['ADMIN']), ctrl.getUserById);


router.patch('/users/:id',              auth(['ADMIN']), ctrl.updateUserProfile);


router.post('/users/:id/deactivate',    auth(['ADMIN']), ctrl.deactivateUser);
router.post('/users/:id/reactivate',    auth(['ADMIN']), ctrl.reactivateUser);


module.exports = router;
