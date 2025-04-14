import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database.js';
import { User } from './entities/User.js';
import { UserService } from './services/UserService.js';
import { RegisterDto } from './dto/RegisterDto.js';
import { LoginDto } from './dto/LoginDto.js';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import depositRoutes from './routes/depositRoutes.js';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware/authMiddleware.js';
import { CouponService } from './services/CouponService.js';
import { Transaction } from './entities/Transaction.js';
import { GameController } from './controllers/GameController.js';
import { RouletteServer } from './websocket/rouletteServer.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const userService = new UserService();

// Initialize database connection
let isDatabaseInitialized = false;

AppDataSource.initialize()
    .then(async () => {
        console.log('📌 Database in use:', AppDataSource.options.database);
        console.log("Data Source has been initialized!");
        isDatabaseInitialized = true;

        // Start WebSocket server
        const rouletteServer = new RouletteServer(3002);
        console.log('Roulette WebSocket server started on port 3002');

        // Start HTTP server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err);
        process.exit(1); // Exit if database connection fails
    });

// Middleware to check database connection
app.use((req, res, next) => {
    if (!isDatabaseInitialized) {
        return res.status(503).json({ message: "Database is not ready yet" });
    }
    next();
});

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with options
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Gambling API' });
});

// Register routes
app.use('/api/deposits', depositRoutes);

// Initialize game controller and register game routes
const gameController = new GameController();
app.get('/api/games', (req, res) => gameController.getGames(req, res));
app.get('/api/games/:id', (req, res) => gameController.getGameById(req, res));

// === Account Routes ===
// Get transaction history (requires authentication)
app.get('/api/account/transactions', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        console.log('Fetching transactions for user ID:', userId);
        
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const transactionRepository = AppDataSource.getRepository(Transaction);
        const transactions = await transactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });

        console.log('Found transactions:', transactions);

        // Format transactions for frontend
        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount), // Ensure amount is a number
            date: t.createdAt.toISOString(), // Ensure date is in ISO format
            status: 'completed'
        }));

        console.log('Formatted transactions:', formattedTransactions);
        res.json(formattedTransactions);
    } catch (error: any) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Failed to fetch transaction history' });
    }
});

// Apply coupon code (requires authentication)
app.post('/api/account/apply-coupon', authMiddleware, async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { couponCode } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!couponCode || typeof couponCode !== 'string') {
            return res.status(400).json({ message: 'Coupon code is required and must be a string' });
        }

        const couponService = new CouponService(AppDataSource.manager);
        const result = await couponService.applyCoupon(userId, couponCode);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        // Get updated user data
        const userRepository = AppDataSource.getRepository(User);
        const updatedUser = await userRepository.findOneBy({ id: userId });
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Omit sensitive data before sending back
        const { passwordHash, ...userToSend } = updatedUser;
        res.json({ 
            message: result.message,
            user: userToSend,
            transaction: result.transaction
        });

    } catch (error: any) {
        console.error('Apply coupon error:', error);
        res.status(400).json({ message: error.message || 'Failed to apply coupon' });
    }
});

// === Auth Routes ===
// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        
        // Convert plain object to DTO class
        const loginDto = plainToClass(LoginDto, req.body);
        
        // Validate DTO
        const errors = await validate(loginDto);
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(e => ({
                    property: e.property,
                    constraints: e.constraints
                }))
            });
        }

        // Get client IP
        const ipAddress = req.ip || req.socket.remoteAddress || '';

        // Login user
        const user = await userService.login(loginDto, ipAddress);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key', // Use secret from env or a default
            { expiresIn: '1h' } // Set token expiration
        );

        // Return success response (without sensitive data) including the token
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                role: user.role,
                balance: user.balance,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            message: error instanceof Error ? error.message : 'Login failed'
        });
    }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        console.log('Raw registration data:', req.body);
        
        // Convert plain object to DTO class and validate
        const registerDto = plainToClass(RegisterDto, req.body);
        const errors = await validate(registerDto);
        
        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.map(e => ({
                    property: e.property,
                    constraints: e.constraints
                }))
            });
        }

        // Get client IP
        const ipAddress = req.ip || req.socket.remoteAddress || '';

        // Register user
        const user = await userService.register(registerDto, ipAddress);

        // Return success response (without sensitive data)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                role: user.role,
                balance: user.balance,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            message: error instanceof Error ? error.message : 'Registration failed' 
        });
    }
});

// === User Routes ===
app.get('/api/users', async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ['id', 'username', 'email', 'status', 'role', 'balance', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
}); 