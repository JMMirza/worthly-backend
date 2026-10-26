import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ArrayUnique,
  ValidateNested,
  IsDate,
} from 'class-validator';
class FileTypeDto {
  @ApiProperty({ example: 'jpg', description: 'File extension' })
  @IsString()
  readonly ext: string;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME type of the file' })
  @IsString()
  readonly mime: string;
}

export class ImageDto {
  @ApiProperty({
    example: '41b76626-2d31-4a89-bec3-dfd684401de6',
    description: 'Unique file UUID',
  })
  @IsString()
  @IsNotEmpty()
  readonly uuid: string;

  @ApiProperty({ example: 'IMG_8493.JPG', description: 'Original file name' })
  @IsString()
  readonly originalName: string;

  @ApiProperty({ type: FileTypeDto, description: 'File type details' })
  @ValidateNested()
  @Type(() => FileTypeDto)
  readonly fileType: FileTypeDto;

  @ApiProperty({ example: 143706, description: 'File size in bytes' })
  @IsNumber()
  readonly size: number;

  @ApiProperty({ example: '7bit', description: 'Encoding type' })
  @IsString()
  readonly encoding: string;
}

export class CreateItemDto {
  @ApiProperty({ example: 'Basic T-Shirt' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Black cotton tee', required: false, default: '' })
  @IsString()
  @IsOptional()
  description?: string = '';

  @ApiProperty({ example: '2-3', required: false, default: '' })
  @IsString()
  @IsOptional()
  sellTime?: string = '';

  @ApiProperty({ example: 63, description: 'Worth of a single unit' })
  @IsNumber()
  @Min(0)
  unitWorth: number;

  @ApiProperty({ example: 2, description: 'Quantity of items', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity: number = 1;

  @ApiProperty({
    example: 80,
    description: 'Total buying price for all units (default 0)',
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  buyingPrice: number = 0;

  @ApiProperty({
    example: ['Facebook', 'Ebay', 'Poshmark', 'Depop'],
    required: false,
    isArray: true,
    type: String,
    default: [],
  })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  recommendedPlatforms?: string[] = [];

  @ApiProperty({ type: ImageDto, description: 'Item picture object' })
  @ValidateNested()
  @Type(() => ImageDto)
  readonly image: ImageDto;

  @ApiProperty({
    example: '2025-09-19T12:34:56.000Z',
    description: 'Date when the item was created',
    required: false,
    default: () => new Date(),
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date = new Date();
}
