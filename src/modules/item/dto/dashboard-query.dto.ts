import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Date for filtering (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
