import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';

export class QueryItemDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Limit of results per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  search?: string;
}
