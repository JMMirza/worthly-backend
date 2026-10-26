import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UserProfileDto {
@ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  readonly name: string;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString({ message: 'Currency must be a string' })
  readonly currency: string;

  @ApiProperty({ example: 'English' })
  @IsNotEmpty()
  @IsString({ message: 'Language must be a string' })
  readonly language: string;

  @ApiProperty({ example: 'Grow online business' })
  @IsNotEmpty()
  @IsString({ message: 'Goal must be a string' })
  readonly goal: string;

  @ApiProperty({ example: 'Instagram' })
  @IsNotEmpty()
  @IsString({ message: 'Social platform must be a string' })
  readonly socialPlatform: string;

  @ApiProperty({ example: 'Shopify' })
  @IsNotEmpty()
  @IsString({ message: 'Selling platform must be a string' })
  readonly sellingPlatform: string;

  @ApiProperty({ example: 'Instagram' })
  @IsNotEmpty()
  @IsString({ message: 'Item to Sell must be a string' })
  readonly itemsToSell: string;

  @ApiProperty({ example: 'Shopify' })
  @IsNotEmpty()
  @IsString({ message: 'Help Request must be a string' })
  readonly helpRequest: string;

  @ApiProperty({ example: 'Shopify' })
  @IsNotEmpty()
  @IsString({ message: 'Hear About Us must be a string' })
  readonly hearAboutUs: string;

  @ApiProperty({ example: 'Shopify' })
  @IsNotEmpty()
  @IsString({ message: 'Selling Item Frequency must be a string' })
  readonly sellingItemFrequency: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'Allow push notification must be a boolean value' })
  readonly allowPushNotification?: boolean;

  @ApiPropertyOptional({
    example: 'ABCD1234',
    description: 'Referral code of another user',
  })
  @IsOptional()
  @IsString({ message: 'Referral Link must be a string' })
  readonly referralLink?: string;

  @ApiPropertyOptional({
    example: 'fcm_token',
    description: 'FCM token for push notification',
  })
  @IsOptional()
  @IsString({ message: 'FCM token must be a string' })
  readonly fcmToken?: string;
}
