import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserActivityHistory } from '../schemas';
import { randomUUID } from 'crypto';
import { CreateProfilePictureDto } from '../dto/create-profile-picture.dto';
import { UpdateProfilePictureDto } from '../dto/update-profile-pictures.dto';
import { UserProfileDto } from '../dto';
import { FirebaseStorageService } from 'src/services';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserActivityHistory.name)
    private userActivityRecordModel: Model<UserActivityHistory>,
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  async getAllUsers() {
    const query = this.userModel.find({role: {$ne: 'admin'}});
    const result: any = await query
      .select(
        '-password -socialId -socialLogin -isDeleted -referredBy -referredUsers -__v -createdAt -updatedAt -premiumExpiry -isPremium -fcmTokens',
      )
      .lean()
      .exec();
    if (result && result.profilePicture) {
      const profilePicLink = await this.firebaseStorageService.getSignedUrl(
        `users/${result.profilePicture.uuid}`,
      );
      result.profilePicture.link = profilePicLink;
    }
    return result;
  }

  async getUser(userId?: string, email?: string) {
    const query = email
      ? this.userModel.findOne({ email: email.toLowerCase() })
      : this.userModel.findById(userId);
    const result: any = await query
      .select(
        '-password -socialId -socialLogin -isDeleted -referredBy -referredUsers -__v -createdAt -updatedAt -premiumExpiry -isPremium -fcmTokens',
      )
      .lean()
      .exec();
    if (result && result.profilePicture) {
      const profilePicLink = await this.firebaseStorageService.getSignedUrl(
        `users/${result.profilePicture.uuid}`,
      );
      result.profilePicture.link = profilePicLink;
    }
    return result;
  }

  async create(user: any, body: UserProfileDto) {
    const userCheck = await this.userModel.findById(user.id);
    if (!userCheck) {
      throw new BadRequestException(['No User found']);
    }
    const {
      name,
      currency,
      language,
      goal,
      socialPlatform,
      sellingPlatform,
      itemsToSell,
      helpRequest,
      hearAboutUs,
      sellingItemFrequency,
      allowPushNotification,
      referralLink,
      fcmToken,
    } = body;
    let referral: User;
    if (referralLink) {
      referral = await this.userModel.findOne({ referralLink });
      if (!referral) {
        throw new BadRequestException(['Invalid referral link']);
      }
      const bonus = Number(process.env.REFERRAL_BONUS);

      if (isNaN(bonus)) {
        throw new Error(
          'REFERRAL_BONUS environment variable must be a valid number',
        );
      }

      referral.referralBonus += bonus;
      referral.referredUsers.push(user.id);
      await referral.save();
    }
    let fcmTokens =
      userCheck?.fcmTokens?.length > 0 ? userCheck?.fcmTokens : [];
    if (fcmToken) {
      fcmTokens.push(fcmToken);
    }
    await this.userModel.findByIdAndUpdate(userCheck._id, {
      name,
      currency,
      language,
      goal,
      itemsToSell,
      helpRequest,
      hearAboutUs,
      sellingItemFrequency,
      socialPlatform,
      sellingPlatform,
      fcmTokens: [...new Set(fcmTokens)],
      referredBy: referralLink ? referral.id : null,
      allowPushNotification: allowPushNotification || false,
      profileSetup: true,
    });
    return await this.getUser(user.id);
  }

  async createProfilePicture(user: any, body: CreateProfilePictureDto) {
    const userCheck = await this.userModel.findById(user.id);
    const { file } = body;

    if (!userCheck) {
      throw new BadRequestException(['No User found']);
    }

    const profile: any = await this.firebaseStorageService.uploadFile(
      file,
      randomUUID(),
      'users',
    );

    // Immediately update profile picture and attachments
    await this.userModel.findByIdAndUpdate(userCheck._id, {
      profilePicture: profile,
    });

    return this.getUser(user.id);
  }

  async updateProfilePictures(user: any, body: UpdateProfilePictureDto) {
    const userCheck = await this.getUser(user.id);
    if (!userCheck) {
      throw new BadRequestException(['No User found']);
    }

    const { file } = body;

    const profile = await this.firebaseStorageService.uploadFile(
      file,
      randomUUID(),
      'users',
    );
    // const link = this.firebaseStorageService.getPreSignedUrl(profile.uuid, 'users');

    await this.userModel.findByIdAndUpdate(userCheck._id, {
      profilePicture: { ...profile },
    });

    return { message: 'Profile updated successfully' };
  }

  async updateLastSeen(userId) {
    return this.userModel.findByIdAndUpdate(userId, {
      lastSeen: new Date(Date.now()),
    });
  }

  async deleteUser(userId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    await user.deleteOne();
    return { message: 'User deleted successfully' };
  }

  async updateStreak(userId: string, dto: any): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    const { streakCount } = dto;
    const lastActivityDate = new Date(Date.now()).toISOString().split('T')[0];
    const lastActivityRecord = await this.userActivityRecordModel.findOne({
      userId: user._id,
      lastActivityDate,
    });
    if (!lastActivityRecord) {
      const activityRecord = new this.userActivityRecordModel({
        userId: user._id,
        lastActivityDate,
        streakCount,
      });
      await activityRecord.save();
    } else {
      lastActivityRecord.streakCount = streakCount;
      await lastActivityRecord.save();
    }
    return 'Streak updated successfully';
  }

  async getUsersActivityRecords(userId, type: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    if (type == 'all') {
      return await this.userActivityRecordModel
        .find()
        .populate({
          path: 'userId',
          select: 'name', // only include 'name' field
        })
        .sort({ streakCount: -1 })
        .limit(10);
    }
    const lastActivityDate = new Date(Date.now()).toISOString().split('T')[0];
    return await this.userActivityRecordModel.findOne({
      userId: user._id,
      lastActivityDate,
    });
  }

  // Extra code
  // async findAllRequests(user, queryData: FindAllRequestsDto) {
  //   const { search, limit, page } = queryData;
  //   // Build query
  //   const query: any = {};
  //   if (user.role !== 'admin') {
  //     query.$and = [{ createdBy: user.id }];
  //   }

  //   if (search) {
  //     query.$or = [
  //       { name: { $regex: search, $options: 'i' } },
  //       { country: { $regex: search, $options: 'i' } },
  //     ];
  //   }

  //   // Fetch places with the constructed query
  //   const data = await findAll(
  //     this.withdrawalRequestModel,
  //     limit,
  //     search,
  //     page,
  //     [],
  //     query,
  //     [],
  //     ['createdBy'],
  //     {},
  //   );

  //   return data;
  // }

  // async withdrawReferralBonus(userId, body: CreateRequestDto) {
  //   const { amount, email } = body;
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new BadRequestException(['User not found']);
  //   }

  //   console.log(user);
  //   if (!user?.referralBonus || amount > user.referralBonus) {
  //     throw new BadRequestException(['Insufficient balance']);
  //   }

  //   const userRequests = await this.withdrawalRequestModel.findOne({
  //     createdBy: userId,
  //     status: 'pending',
  //   });
  //   if (userRequests) {
  //     throw new BadRequestException([
  //       'You have already requested for withdrawal',
  //     ]);
  //   }
  //   const withdrawalRequest = new this.withdrawalRequestModel({
  //     email,
  //     createdBy: userId,
  //     withdrawalAmount: amount,
  //     status: requestStatus.PENDING,
  //   });
  //   await withdrawalRequest.save();
  //   return withdrawalRequest;
  // }

  // async changeRequestStatus(id: string, body: ChangeRequestStatusDto) {
  //   const { status, comments } = body;
  //   const withdrawalRequest = await this.withdrawalRequestModel.findById(id);
  //   if (!withdrawalRequest) {
  //     throw new BadRequestException(['Withdrawal request not found']);
  //   }
  //   if (withdrawalRequest.status !== requestStatus.PENDING) {
  //     throw new BadRequestException(['Withdrawal request already ressolved']);
  //   }
  //   if (status === requestStatus.APPROVED) {
  //     const user = await this.userModel.findById(withdrawalRequest.createdBy);
  //     if (!user) {
  //       throw new BadRequestException(['User not found']);
  //     }
  //     user.referralBonus -= withdrawalRequest.withdrawalAmount;
  //     await user.save();
  //   }
  //   withdrawalRequest.status = status;
  //   withdrawalRequest.comments = comments;
  //   await withdrawalRequest.save();
  //   return withdrawalRequest;
  // }
}
