import { UserController } from 'src/modules/user/controllers';
import { UserService } from 'src/modules/user/services';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseStorageService, OpenAIService } from 'src/services';
import { User, UserActivityHistory, UserActivityHistorySchema, UserSchema, WithdrawalRequest, WithdrawalRequestSchema } from './schemas';
import { Item, ItemSchema } from '../item/schemas';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_TOKEN_KEY'),
        signOptions: {
          expiresIn: String(configService.get('TEM_JWT_EXPIRES_IN')),
        },
      }),
      inject: [ConfigService],
    }),
    NestjsFormDataModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WithdrawalRequest.name, schema: WithdrawalRequestSchema },
      { name: UserActivityHistory.name, schema: UserActivityHistorySchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, FirebaseStorageService, OpenAIService],
  exports: [UserService],
})
export class UserModule {}
