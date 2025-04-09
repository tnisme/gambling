import { Router, RequestHandler } from 'express';
import { DepositController } from '../controllers/DepositController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const depositController = new DepositController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new deposit
router.post('/', depositController.createDeposit.bind(depositController) as RequestHandler);

// Get all deposits for the authenticated user
router.get('/', depositController.getDeposits.bind(depositController) as RequestHandler);

// Get a specific deposit by ID
router.get('/:id', depositController.getDepositById.bind(depositController) as RequestHandler);

export default router; 