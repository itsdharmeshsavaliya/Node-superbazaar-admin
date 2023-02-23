import express from 'express';
const router = express.Router();

import auth from '../middlewares/auth';
import admin from '../middlewares/admin';
import user from '../middlewares/user';

import {
    /* Admin */
    adminLoginController,
    adminController,

    businessController,
    settingsController,
    menuController,
    categoryController,
    subcategoryController,
    attributeSetController,
    attributeController,
    productController,

    importController,

    /* User */
    registerController,
    loginController,
    userController,
    refreshTokenController,
} from '../controllers';

/* Admin */
router.post('/admin/login', adminLoginController.login);
router.post('/admin/refreshtoken', refreshTokenController.refresh);
router.get('/admin/profile', [admin], adminController.me);
router.post('/admin/changepassword', [admin], adminController.changePassword);
router.post('/admin/logout', [admin], adminLoginController.logout);

router.post('/business/list', [admin], businessController.index);
router.post('/business/create', [admin], businessController.create);

router.post('/settings/business/info', [admin], settingsController.businessInfo);
router.post('/settings/business/save', [admin], settingsController.saveBusiness);

router.post('/menu/list', [admin], menuController.index);
router.post('/menu/create', [admin], menuController.create);

router.post('/category/all', categoryController.all);
router.post('/category/list', [admin], categoryController.all);
router.post('/category/create', [admin], categoryController.create);
router.post('/category/:id', [admin], categoryController.fetch);
router.put('/category/:id', [admin], categoryController.update);
router.patch('/category/status', [admin], categoryController.changeStatus);
router.delete('/category/:id', [admin], categoryController.remove);
router.delete('/category', [admin], categoryController.removeSelected);

router.post('/subcategory/list/:id', [admin], subcategoryController.index); //id: Category ID
router.post('/subcategory/create', [admin], subcategoryController.create);
router.post('/subcategory/:id', [admin], subcategoryController.fetch);
router.put('/subcategory/:id', [admin], subcategoryController.update);
router.patch('/subcategory/status', [admin], subcategoryController.changeStatus);
router.delete('/subcategory/:id', [admin], subcategoryController.remove);
router.delete('/subcategory', [admin], subcategoryController.removeSelected);

router.post('/attributeset/list', [admin], attributeSetController.index);
router.post('/attributeset/create', [admin], attributeSetController.create);
router.post('/attributeset/:id', [admin], attributeSetController.fetch);
router.put('/attributeset/:id', [admin], attributeSetController.update);
router.delete('/attributeset/:id', [admin], attributeSetController.remove);
router.delete('/attributeset', [admin], attributeSetController.removeSelected);

router.post('/attribute/all', attributeController.all);
router.post('/attribute/list', [admin], attributeController.index);
router.post('/attribute/create', [admin], attributeController.create);
router.post('/attribute/:id', [admin], attributeController.fetch);
router.put('/attribute/:id', [admin], attributeController.update);
router.delete('/attribute/:id', [admin], attributeController.remove);
router.delete('/attribute', [admin], attributeController.removeSelected);

router.post('/product/all', productController.all);
router.post('/product/list', [admin], productController.index);
// router.post('/product/create', [admin], productController.create);
router.post('/product/:id', [admin], productController.fetch);
// router.put('/product/:id', [admin], productController.update);
router.delete('/product/:id', [admin], productController.remove);
router.delete('/product', [admin], productController.removeSelected);

router.post('/importsheet', [admin], importController.importsheet);

// router.post('/products/cart-items', productController.getProducts);


/* User */
router.post('/register', registerController.register);
router.post('/verify/account', userController.verifyAccount);
router.post('/login', loginController.login);
router.post('/refreshtoken', refreshTokenController.refresh);
router.get('/profile', [auth, user], userController.me);
router.post('/profile/edit', [auth, user], userController.save);
router.post('/changepassword', [auth, user], userController.changePassword);
router.post('/logout', [auth, user], loginController.logout);



export default router;