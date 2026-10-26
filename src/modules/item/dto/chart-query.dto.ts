import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class ChartQueryDto {
  @ApiPropertyOptional({
    description: 'Number of past days to fetch',
    default: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  days?: number = 90;
}
