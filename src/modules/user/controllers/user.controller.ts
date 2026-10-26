import { UserService } from 'src/modules/user/services';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DecryptTokenInterceptor } from 'src/interceptors';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateProfilePictureDto } from '../dto/create-profile-picture.dto';
import { UpdateProfilePictureDto } from '../dto/update-profile-pictures.dto';
import {
  ChangeRequestStatusDto,
  CreateRequestDto,
  FindAllRequestsDto,
  UserProfileDto,
} from '../dto';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';

@ApiTags('User')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(DecryptTokenInterceptor)
  @Post('set-profile')
  @ApiOperation({ summary: 'The API that creates/updates user profile' })
  @ApiResponse({
    status: 201,
    description: 'User profile created successfully.',
  })
  async create(
    @Request() request: any,
    @Body() userProfileDto: UserProfileDto,
  ) {
    const user = request.user;
    return this.userService.create(user, userProfileDto);
  }

  @UseInterceptors(DecryptTokenInterceptor,AdminInterceptor)
  @Get('get-all-users')
  @ApiOperation({
    summary: 'The API that get list of users for promo code (ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Request fetched successfully.',
  })
  async getAllUsers(@Request() request: any) {
    const user = request.user;
    return this.userService.getAllUsers();
  }

  @UseInterceptors(DecryptTokenInterceptor)
  @Get('get-profile')
  @ApiOperation({
    summary: 'The API that get user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Request fetched successfully.',
  })
  async getUser(@Request() request: any) {
    const user = request.user;
    return this.userService.getUser(user.id);
  }

  // @UseInterceptors(DecryptTokenInterceptor)
  // @Get('withdraw-requests')
  // @ApiOperation({
  //   summary: 'The API that get all withdrawal requests',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Request fetched successfully.',
  // })
  // async findAllRequests(
  //   @Query() query: FindAllRequestsDto,
  //   @Request() request: any,
  // ) {
  //   const user = request.user;
  //   return this.userService.findAllRequests(user, query);
  // }

  @UseInterceptors(DecryptTokenInterceptor)
  @Post('update-streak-count')
  @ApiOperation({
    summary: 'The API that update streak count for current date',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        streakCount: {
          type: 'number',
          description: 'The streak count to update',
          example: 5,
        },
      },
      required: ['streakCount'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Streak updated successfully',
  })
  async updateUserStreak(@Request() request: any, @Body() body: any) {
    const user = request.user;
    return this.userService.updateStreak(user.id, body);
  }

  @UseInterceptors(DecryptTokenInterceptor)
  @Get('get-activity-history')
  @ApiOperation({
    summary: 'The API that get user streak history',
  })
  @ApiResponse({
    status: 200,
    description: 'Streak fetched successfully',
  })
  async getSpecificUserActivity(@Request() request: any) {
    const user = request.user;
    return this.userService.getUsersActivityRecords(user.id, 'user_record');
  }

  @UseInterceptors(DecryptTokenInterceptor)
  @Get('leaderboard')
  @ApiOperation({
    summary: 'The API that get leaderboard records',
  })
  @ApiResponse({
    status: 200,
    description: 'Records fetched successfully',
  })
  async getLeaderBoardData(@Request() request: any) {
    const user = request.user;
    return this.userService.getUsersActivityRecords(user.id, 'all');
  }

  // @UseInterceptors(DecryptTokenInterceptor)
  // @Post('withdrawal-amount')
  // @ApiOperation({
  //   summary: 'The API that creates withdrawal amount of referral bonus',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Request created successfully.',
  // })
  // async createRequest(@Request() request: any, @Body() body: CreateRequestDto) {
  //   const user = request.user;
  //   return this.userService.withdrawReferralBonus(user.id, body);
  // }

  // @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  // @Put('withdraw-request/change-status/:id')
  // @ApiOperation({
  //   summary: 'The API that changes withdrawal request status',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Request created successfully.',
  // })
  // async changeRequestStatus(
  //   @Param('id') id: string,
  //   @Body() body: ChangeRequestStatusDto,
  // ) {
  //   return this.userService.changeRequestStatus(id, body);
  // }

  @UseInterceptors(DecryptTokenInterceptor)
  @FormDataRequest()
  @Post('create-profile-picture')
  @ApiOperation({ summary: 'Create or update user profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Profile updated successfully.' })
  async createProfilePicture(
    @Request() request: any,
    @Body() body: CreateProfilePictureDto,
  ) {
    const user = request.user;
    return this.userService.createProfilePicture(user, body);
  }

  @UseInterceptors(DecryptTokenInterceptor)
  @ApiExcludeEndpoint()
  @FormDataRequest()
  @Post('update-profile-picture')
  @ApiOperation({ summary: 'Update  profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Profile updated successfully.' })
  async updateProfilePicture(
    @Request() request: any,
    @Body() body: UpdateProfilePictureDto,
  ) {
    const user = request.user;
    return this.userService.updateProfilePictures(user, body);
  }

  @UseInterceptors(DecryptTokenInterceptor)
  @Delete('delete-user')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'User not found.' })
  deleteUser(@Request() request: any) {
    const user = request.user;
    return this.userService.deleteUser(user.id);
  }
}
