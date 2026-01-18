import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/main/auth/guards/jwt-auth.guard';
import { GetUser } from '@/main/auth/decorator/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { handleRequest } from '@/common/helpers/handle.request';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.user.dto';

@ApiTags('User Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get logged-in user profile' })
  getProfile(@GetUser('id') userId: string) {
    return handleRequest(() => this.userService.getProfile(userId), 'Profile fetched successfully');
  }

  @Patch()
  @ApiOperation({ summary: 'Update logged-in user profile' })
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return handleRequest(() => this.userService.updateProfile(userId, dto), 'Profile updated successfully');
  }
}
