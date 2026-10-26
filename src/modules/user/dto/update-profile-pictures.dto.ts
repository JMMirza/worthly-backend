import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsFileSizeValid } from 'src/commons/dto/file-size.dto';

export class UpdateProfilePictureDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture file to upload (max 35 MB)',
    required: false,
  })
  @IsNotEmpty()
  @IsFileSizeValid({
    message: 'File size exceeds the maximum allowed limit of 35 MB',
  })
  readonly file: string;
}
