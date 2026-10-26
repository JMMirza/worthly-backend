import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
import { User } from 'src/modules/user/schemas';

export type PromoCodeDocument = HydratedDocument<PromoCode>;

@Schema()
export class PromoCode extends Base {
  @Prop({ required: true, unique: true, trim: true })
  code: string; // e.g. "WELCOME50"

  @Prop({ required: false, default: 0, min: 0 })
  discount: number; // percentage or fixed amount

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdFor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId; // who created this code

  @Prop({ type: Date, required: false })
  expiresAt?: Date;

  @Prop({ required: false, default: true })
  active: boolean;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: User.name, required: true },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  usedBy: { user: Types.ObjectId; usedAt: Date }[];
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
PromoCodeSchema.add(BaseSchema);
