import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCode, PromoCodeSchema } from './schemas';
import { PromoCodeController } from './controllers';
import { PromoCodeService } from './services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }]),
  ],
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports: [PromoCodeService],
})
export class PromoCodeModule {}
