import express from 'express';
import { 
  Login, 
  Logout, 
  protectRoute, 
  refreshToken, 
  Register 
} from '../Controller/authController.js';

const router = express.Router();

router.post('/register', Register);
router.post('/login', Login);
router.post('/logout', Logout);
router.post('/token', refreshToken);
router.get('/current-user', protectRoute);

export default router;