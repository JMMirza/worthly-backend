import { Injectable } from '@nestjs/common';
import { FirebaseStorageService, OpenAIService } from 'src/services';
import { StoreOpenAiDto } from '../dto';
import { resaleValuationPrompt, itemValuationAssistant } from 'src/commons/constants';
import { randomUUID } from 'crypto';
import { User, UserDocument } from 'src/modules/user/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OpenAiService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly openAiAPI: OpenAIService,
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  async generateItemWorth(userId: any, dto: StoreOpenAiDto) {
    const { image } = dto;
    const picture: any = await this.firebaseStorageService.uploadFile(
      image,
      randomUUID(),
      'items',
    );
    const pictureLink = await this.firebaseStorageService.getSignedUrl(
      `items/${picture.uuid}`,
    );
    const openaiResponse = await this.openAiAPI.analyzeImage(
      pictureLink,
      resaleValuationPrompt,
      JSON.stringify(itemValuationAssistant, null, 2),
    );

    return {
      message: 'Item scanned successfully',
      picture:{...picture, link: pictureLink},
      openAIResponse: openaiResponse,
    };
  }
}
