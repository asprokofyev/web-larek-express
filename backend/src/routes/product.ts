import { Router } from 'express';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/products';
import auth from '../middlewares/auth';
import { validateObjectId, validateProductBody, validateProductUpdate } from '../middlewares/validators';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', auth, validateProductBody, createProduct);
productRouter.delete('/:productId', auth, validateObjectId, deleteProduct);
productRouter.patch('/:productId', auth, validateObjectId, validateProductUpdate, updateProduct);

export default productRouter;
