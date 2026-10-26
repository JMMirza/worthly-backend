import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
} from 'class-validator';
import { IsFileSizeValid } from 'src/commons/dto/file-size.dto';

export class CreateProfilePictureDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture file to upload',
  })
  @IsOptional()
  @IsFileSizeValid({
    message: 'File size exceeds the maximum allowed limit of 35 MB',
  })
  readonly file: string;

}
