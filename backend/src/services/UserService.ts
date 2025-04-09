import { AppDataSource } from '../config/database.js';
import { User, UserStatus, UserRole } from '../entities/User.js';
import { RegisterDto } from '../dto/RegisterDto.js';
import { LoginDto } from '../dto/LoginDto.js';
import bcrypt from 'bcrypt';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async register(registerDto: RegisterDto, ipAddress: string): Promise<User> {
        try {
            console.log('Starting registration process for:', registerDto.username);
            
            // Check if username or email already exists
            const existingUser = await this.userRepository.findOne({
                where: [
                    { username: registerDto.username },
                    { email: registerDto.email }
                ]
            });

            if (existingUser) {
                const field = existingUser.username === registerDto.username ? 'username' : 'email';
                throw new Error(`This ${field} is already in use`);
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

            // Create new user
            const user = this.userRepository.create({
                username: registerDto.username,
                passwordHash: hashedPassword,
                email: registerDto.email,
                balance: 0,
                status: UserStatus.ACTIVE,
                role: UserRole.USER
            });

            console.log('Saving user to database:', user.username);
            
            // Save user
            const savedUser = await this.userRepository.save(user);
            console.log('User saved successfully:', savedUser.id);

            return savedUser;
        } catch (error) {
            console.error('Error in register service:', error);
            throw error;
        }
    }

    async login(loginDto: LoginDto, ipAddress: string): Promise<User> {
        // Find user by username
        const user = await this.userRepository.findOne({
            where: { username: loginDto.username }
        });

        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        // Check if user is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new Error('Account is not active. Please contact support.');
        }

        return user;
    }

    async getUserWithWallets(userId: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['transactions']
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
} 