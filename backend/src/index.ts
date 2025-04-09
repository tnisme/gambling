import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database.js';
import 'reflect-metadata';
import { User } from './entities/User.js';
import { UserService } from './services/UserService.js';
import { RegisterDto } from './dto/RegisterDto.js';
import { LoginDto } from './dto/LoginDto.js';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const userService = new UserService();

// Initialize database connection
let isDatabaseInitialized = false;

AppDataSource.initialize()
    .then(() => {
        console.log('📌 Database in use:', AppDataSource.options.database);
        console.log("Data Source has been initialized!");
        isDatabaseInitialized = true;
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

        // Return success response (without sensitive data)
        res.json({
            message: 'Login successful',
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

// Get users
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 