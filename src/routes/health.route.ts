import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

router.get('/', getHealth);

// Example of a SUPER_ADMIN protected route
router.get('/admin-health', authenticate, authorize(['SUPER_ADMIN']), (req, res) => {
    res.json({
        message: 'Admin health check passed!',
        user: {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role,
        },
    });
});

export default router;

