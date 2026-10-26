import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {
  HydratedDocument,
  Types,
  Schema as MongooseSchema,
} from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Base {
  @Prop({ required: false, default: [] })
  fcmTokens: string[];

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: '' })
  name: string;

  @Prop({ required: false, default: '' })
  language: string;

  @Prop({ required: true, default: '' })
  currency: string;

  @Prop({ required: false, default: '' })
  goal: string;

  @Prop({ required: false, default: '' })
  socialPlatform: string;

  @Prop({ required: false, default: '' })
  sellingPlatform: string;

  @Prop({ required: false, default: '' })
  itemsToSell: string;

  @Prop({ required: false, default: '' })
  helpRequest: string;

  @Prop({ required: false, default: '' })
  sellingItemFrequency: string;

  @Prop({ required: false, default: '' })
  hearAboutUs: string;

  @Prop({ required: false, default: '' })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: false })
  socialId: string;

  @Prop({ required: false })
  socialType: string;

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  profilePicture: {};

  @Prop({ required: false, default: false })
  isPremium: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  premiumExpiry: Date;

  @Prop({ required: false, default: false })
  profileSetup: boolean;

  @Prop({ required: false, default: false })
  allowPushNotification: boolean;

  @Prop({ type: String, required: true, unique: true })
  referralLink: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  referredBy: Types.ObjectId;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  ])
  referredUsers: User[];

  @Prop({ required: false, default: 0 })
  referralBonus: number;

  @Prop({ type: Date, default: Date.now })
  lastSeen: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;

    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Extend with BaseSchema for common fields
UserSchema.add(BaseSchema);
