import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { UserStatus, UserRole } from '../entities/User.js';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username!: string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    })
    password!: string;

    @IsEmail()
    @MaxLength(100)
    email!: string;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
} 