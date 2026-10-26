// store-openai.dto.ts
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsFileSizeValid } from 'src/commons/dto/file-size.dto';

export class StoreOpenAiDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Item picture to upload',
  })
  @IsNotEmpty()
  @IsFileSizeValid({
    message: 'File size exceeds the maximum allowed limit of 35 MB',
  })
  readonly image: string;
}
