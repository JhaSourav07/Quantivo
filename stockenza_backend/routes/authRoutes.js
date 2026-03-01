const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resendVerification,
  resetPassword,
  updateProfile,
  resetBusinessData,
} = require('../controllers/authController');

router.post('/register',             registerUser);
router.post('/login',                loginUser);
router.get ('/verify/:token',        verifyEmail);
router.post('/forgot-password',      forgotPassword);
router.post('/resend-verification',  resendVerification);
router.post('/reset-password',       resetPassword);
router.put ('/profile',   protect,   updateProfile);
router.delete('/reset-data', protect, resetBusinessData);

module.exports = router;
