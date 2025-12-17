import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/verify-otp', validate(verifyOtpSchema), (req, res) => authController.verifyOtp(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/resend-otp', (req, res) => authController.resendOtp(req, res));

// Example of a protected route
router.get('/profile', authenticate, authorize(['CUSTOMER', 'STORE_ADMIN', 'SUPER_ADMIN']), (req, res) => {
    // req.user and req.store should be populated here
    res.json({
        message: 'Welcome to your profile!',
        user: {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role,
            storeId: req.user?.storeId,
        },
        store: req.store ? {
            id: req.store.id,
            name: req.store.name,
            slug: req.store.slug,
        } : null,
    });
});

export default router;
