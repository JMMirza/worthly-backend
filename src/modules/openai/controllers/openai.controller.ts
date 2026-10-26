import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OpenAiService } from '../services';
import { StoreOpenAiDto } from '../dto';
import { DecryptTokenInterceptor } from 'src/interceptors';
import { FormDataRequest } from 'nestjs-form-data';

@ApiTags('OpenAI')
@ApiBearerAuth()
@Controller()
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @UseInterceptors(DecryptTokenInterceptor)
  @Post()
  @FormDataRequest()
  @ApiOperation({ summary: 'Store OpenAI Response' })
  @ApiConsumes('multipart/form-data')
  async storeOpenAiResponse(
    @Request() request: any,
    @Body() dto: StoreOpenAiDto,
  ) {
    const userId = request.user.id;
    return this.openAiService.generateItemWorth(userId, dto);
  }
}
