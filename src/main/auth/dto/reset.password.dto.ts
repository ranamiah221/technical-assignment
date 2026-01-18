// src/users/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'OldPass123',
        description: 'Current password of the user',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @ApiProperty({
        example: 'NewStrongPass456',
        description: 'New password (minimum 6 characters)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
