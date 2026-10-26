import { Module } from '@nestjs/common';
import { FirebaseStorageService, OpenAIService } from 'src/services';
import { OpenAiService } from './services';
import { OpenAiController } from './controllers';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NestjsFormDataModule,
  ],
  controllers: [OpenAiController],
  providers: [OpenAIService, FirebaseStorageService, OpenAiService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
