import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Base, BaseSchema } from 'src/commons/schemas/abstract.schema';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema()
export class RefreshToken extends Base {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  ipAddress?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Extend with BaseSchema for common fields
RefreshTokenSchema.add(BaseSchema);