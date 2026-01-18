import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { handleRequest } from '@/common/helpers/handle.request';
import { RegisterUserDto } from './dto/register.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { ChangePasswordDto } from './dto/reset.password.dto';
import { GetUser } from '@/common/decorator/getuser';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account' })
  create(@Body() dto: RegisterUserDto) {
    return handleRequest(
      () => this.authService.createUser(dto),
      'User created successfully',
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'login' })
  login(@Body() dto: LoginUserDto) {
    return this.authService.loginuser(dto);
  }

  @Post('reset-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logged-in user change password' })
  async resetPassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return handleRequest(
      () => this.authService.resetPassword(userId, dto),
      'Password changed successfully',
    );
  }
}
