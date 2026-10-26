import { SignupDto, SignUpUserDto } from 'src/modules/auth/dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
  User,
  UserActivityHistory,
  UserActivityHistoryDocument,
  UserDocument,
} from 'src/modules/user/schemas';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { SocialSignupDto } from '../dto/socialSignUp.dto';
import { FirebaseStorageService } from 'src/services';
import { SignUpUser } from 'src/modules/user/schemas/signupUsers.schema';
import { PromoCode, PromoCodeDocument } from 'src/modules/promocode/schemas';
import * as Mixpanel from 'mixpanel';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(PromoCode.name)
    private promoCodeModel: Model<PromoCodeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(UserActivityHistory.name)
    private userActivityModel: Model<UserActivityHistoryDocument>,
    @InjectModel(SignUpUser.name) private signupUserModel: Model<SignUpUser>,
    private jwtService: JwtService,
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  private createToken(user: any): string {
    const payload: JwtPayloadDto = {
      id: user._id,
      email: user.email,
      role: user.role,
      currency: user.currency,
    };

    return this.jwtService.sign(payload);
  }

  async generateTokens(userId: any, ipAddress?: string, user?: any) {
    // Generate access token
    const accessToken = this.createToken(user);

    // Generate refresh token
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');

    // Save refresh token to database
    const refreshToken = new this.refreshTokenModel({
      token: refreshTokenValue,
      userId,
      ipAddress,
    });

    await refreshToken.save();

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  async refreshTokens(
    refreshTokenValue: string,
    ipAddress?: string,
  ) {
    // Find the refresh token in database
    const refreshToken = await this.refreshTokenModel.findOne({
      token: refreshTokenValue,
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user details
    const user = await this.userModel.findById(refreshToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke the current refresh token
    refreshToken.isRevoked = true;
    await refreshToken.save();

    // Generate new tokens
    return this.generateTokens(user._id.toString(), ipAddress, user);
  }

  generateOTP(digits: number): string {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString().padStart(digits, '0');
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

  async seedUser(signupDto: SignupDto) {
    const { email, firstName, lastName, password } = signupDto;
    const role = 'admin';
    const checkEmail = await this.getUser(undefined, email);
    if (checkEmail) {
      throw new BadRequestException(['User already exist']);
    }
    const referralCode = crypto.randomBytes(4).toString('hex');
    return await this.userModel.create({
      email: email.toLowerCase(),
      name: firstName + ' ' + lastName,
      password,
      referralLink: referralCode,
      role,
      profileSetup: true,
    });
  }

  async socialLogin(body: SocialSignupDto) {
    const { email, socialId, socialType, signupUserId } = body;
    // const userCheck = (await this.getUser(undefined, email)) as any;
    const userCheck = (await this.userModel.findOne({ socialId })) as any;
    if (userCheck) {
      if (userCheck.socialType !== socialType) {
        throw new BadRequestException(['Social type mismatch.']);
      }
      const { accessToken, refreshToken } = await this.generateTokens(userCheck?._id, undefined, userCheck);
      await this.updateStreakCount(userCheck._id);
      return { token: accessToken, refreshToken, user: await this.getUser(userCheck?._id) };
    }
    if (email) {
      const emailCheck: any = await this.userModel.findOne({ email });
      if (emailCheck) {
        if (emailCheck?.socialType == socialType) {
          emailCheck.socialId = socialId;
          emailCheck.socialType = socialType;
          await emailCheck.save();
          const { accessToken, refreshToken } = await this.generateTokens(emailCheck?._id, undefined, emailCheck);
          await this.updateStreakCount(emailCheck._id);
          return {
            token: accessToken,
            refreshToken,
            user: await this.getUser(emailCheck?._id),
          };
        } else {
          throw new BadRequestException(['Account already exists']);
        }
      }
    }
    const referralCode = crypto.randomBytes(4).toString('hex');
    if (signupUserId == '') {
      throw new BadRequestException(['Please signup first.']);
    }
    const signupUser = await this.signupUserModel.findById(signupUserId);
    if (!signupUser) {
      throw new BadRequestException(['Please signup first.']);
    }

    const user: any = await this.userModel.create({
      email: email?.toLowerCase(),
      socialId,
      socialType,
      referralLink: referralCode,
      role: 'customer',
      name: signupUser.name,
      language: signupUser.language,
      currency: signupUser.currency,
      goal: signupUser.goal,
      socialPlatform: signupUser.socialPlatform,
      sellingPlatform: signupUser.sellingPlatform,
      itemsToSell: signupUser.itemsToSell,
      helpRequest: signupUser.helpRequest,
      hearAboutUs: signupUser.hearAboutUs,
      sellingItemFrequency: signupUser.sellingItemFrequency,
      allowPushNotification: signupUser.allowPushNotification,
      referredBy: signupUser.referredBy,
      profilePicture: signupUser.profilePicture,
    });

    if (signupUser.referredBy) {
      const referral = await this.userModel.findById(signupUser.referredBy);
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
      referral.referredUsers.push(user._id);
      await referral.save();
      if (signupUser.promoCodeUser) {
        await this.applyPromoCode(user._id, signupUser.code);
      }
    }
    const { accessToken, refreshToken } = await this.generateTokens(user?._id, undefined, user);
    await this.updateStreakCount(user._id);
    return { token: accessToken, refreshToken, user: await this.getUser(user?._id) };
  }

  async create(body: SignUpUserDto) {
    const {
      name,
      currency,
      language,
      goal,
      socialPlatform,
      sellingPlatform,
      itemsToSell,
      hearAboutUs,
      helpRequest,
      sellingItemFrequency,
      allowPushNotification,
      referralLink,
    } = body;
    let referral: User;
    let promoCodeUser = false;
    let code = null;
    if (referralLink) {
      referral = await this.userModel.findOne({ referralLink });
      if (!referral) {
        const promoCode = await this.promoCodeModel.findOne({
          code: referralLink,
        });
        if (!promoCode) {
          throw new BadRequestException(['Invalid referral link']);
        }
        referral = await this.userModel.findById(promoCode.createdFor);
        promoCodeUser = true;
        code = promoCode.code;
      }
    }

    const signUpUser = await this.signupUserModel.create({
      name,
      currency,
      language,
      goal,
      socialPlatform,
      sellingPlatform,
      referredBy: referralLink ? referral.id : null,
      promoCodeUser,
      itemsToSell,
      hearAboutUs,
      helpRequest,
      sellingItemFrequency,
      code,
      allowPushNotification: allowPushNotification || false,
    });
    await this.mixpanelIntegration(signUpUser.id, currency, hearAboutUs);
    return signUpUser;
  }

  async loginForAdmin(body: any): Promise<any> {
    const { email, password } = body;
    const user: any = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.createToken(user);
    return { token, user: await this.getUser(user?._id) };
  }

  async applyPromoCode(userId: string, code: any) {
    const promo = await this.promoCodeModel.findOne({
      code,
      active: true,
    });
    if (!promo) throw new NotFoundException('Promo code not found');

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Promo code expired');
    }

    const alreadyUsed = promo.usedBy.some((u) => u.user.toString() === userId);
    if (alreadyUsed) {
      throw new BadRequestException('Promo code already used by this user');
    }

    promo.usedBy.push({ user: new Types.ObjectId(userId), usedAt: new Date() });
    await promo.save();

    return promo;
  }

  async mixpanelIntegration(
    userId: string,
    currency: any,
    referralSource: any,
  ) {
    const mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN);

    // 2. Track in Mixpanel
    mixpanel.track('Onboarding Completed', {
      distinct_id: userId, // links event to user
      currency_selected: currency,
      referral_source: referralSource,
      completed_at: new Date().toISOString(),
    });

    // Optional: set user profile properties
    mixpanel.people.set(userId, {
      currency_selected: currency,
      referral_source: referralSource,
      onboarded: true,
    });

    return { success: true };
  }

  async checkReferralLink(referralLink: string) {
    const referral = await this.userModel.findOne({ referralLink });
    if (!referral) {
      const promoCode = await this.promoCodeModel.findOne({
        code: referralLink,
      });
      if (!promoCode) {
        throw new BadRequestException(['Invalid referral link']);
      }
    }
    return { success: true };
  }

  async updateStreakCount(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const lastActivityDate = new Date(Date.now()).toISOString().split('T')[0];
    const lastActivityRecord = await this.userActivityModel.findOne({
      userId: user._id,
      lastActivityDate: lastActivityDate,
    });

    if (!lastActivityRecord) {
      const activityRecord = new this.userActivityModel({
        userId: user._id,
        lastActivityDate: lastActivityDate,
        streakCount: 1,
      });
      await activityRecord.save();
    } else {
      lastActivityRecord.streakCount += 1;
      await lastActivityRecord.save();
    }
    return { success: true };
  }
}
