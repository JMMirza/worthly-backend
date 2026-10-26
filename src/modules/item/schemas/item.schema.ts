import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';
import { User } from 'src/modules/user/schemas';

export type ItemDocument = HydratedDocument<Item>;

@Schema()
export class Item extends Base {
  @Prop({ required: true, trim: true })
  title: string; // e.g., "Basic T-Shirt"

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  itemWorth: number; // e.g., 63

  @Prop({ required: false, min: 1, default: 1 })
  quantity: number;

  @Prop({ required: false, min: 0, default: 0 })
  totalWorth: number; // e.g., 63

  @Prop({ required: true, min: 0 })
  buyingPrice: number; // e.g., 20

  @Prop({ required: false, default: 0, min: 0 })
  profit: number; // will be computed in service

  @Prop({ required: false, default: 'USD' })
  currency: string;

  @Prop({ required: false, default: '2-3 days' })
  sellTime: string;

  @Prop({ type: [String], required: false, default: [] })
  recommendedPlatforms: string[]; // ["Facebook", "Ebay", "Poshmark", "Depop"]

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  image: {};

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId; // owner
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// extend with common fields
ItemSchema.add(BaseSchema);
