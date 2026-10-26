import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDate,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'WELCOME50' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 20,
    description: 'Discount in percentage or fixed amount',
  })
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiProperty({
    example: '64f13f97e8a2a9d1b34d7c12',
    description: 'User ID for whom this promo code is created',
  })
  @IsMongoId()
  createdFor: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Whether the promo code is active or not',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
