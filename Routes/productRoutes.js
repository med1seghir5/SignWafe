import express from "express";
import { authenticateToken } from "../Middleware/authMiddlware.js";
import { 
    addProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct 
} from "../Controller/productController.js";

const router = express.Router();

router.use(authenticateToken);

router.get('/getProduct', getAllProducts);

router.get('/getProduct/:id', getProductById);

router.post('/addProduct', addProduct);

router.put('/updateProduct/:id', updateProduct);

router.delete('/deleteProduct/:id', deleteProduct);

export default router;
