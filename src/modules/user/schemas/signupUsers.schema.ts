import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
export type SignUpUserDocument = HydratedDocument<SignUpUser>;

@Schema()
export class SignUpUser extends Base {
  @Prop({ required: false, default: '' })
  name: string;

  @Prop({ required: false, default: '' })
  language: string;

  @Prop({ required: false, default: '' })
  currency: string;

  @Prop({ required: false, default: '' })
  goal: string;

  @Prop({ required: false, default: '' })
  socialPlatform: string;

  @Prop({ required: false, default: '' })
  sellingPlatform: string;

  @Prop({ required: false, default: false })
  isUsed: boolean;

  @Prop({ required: false, default: '' })
  itemsToSell: string;

  @Prop({ required: false, default: '' })
  helpRequest: string;

  @Prop({ required: false, default: '' })
  hearAboutUs: string;

  @Prop({ required: false, default: '' })
  sellingItemFrequency: string;

  @Prop({ required: false, default: false })
  allowPushNotification: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  referredBy: Types.ObjectId;

  @Prop({ required: false, default: false })
  promoCodeUser: boolean;

  @Prop({ required: false, trim: true })
  code: string;

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  profilePicture: {};
}

export const SignUpUserSchema = SchemaFactory.createForClass(SignUpUser);

// Extend with BaseSchema for common fields
SignUpUserSchema.add(BaseSchema);
