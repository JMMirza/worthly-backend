import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { PromoCodeService } from '../services';
import { CreatePromoCodeDto } from '../dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PromoCode } from '../schemas';
import { AdminInterceptor } from 'src/interceptors/admin.interceptor';
import { DecryptTokenInterceptor } from 'src/interceptors';

@ApiTags('PromoCodes')
@ApiBearerAuth()
@Controller()
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Post()
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Create a new promo code' })
  @ApiBody({ type: CreatePromoCodeDto })
  @ApiResponse({
    status: 201,
    description: 'Promo code created successfully',
    type: PromoCode,
  })
  @ApiResponse({ status: 400, description: 'Promo code already exists' })
  async create(@Request() req, @Body() dto: CreatePromoCodeDto) {
    return this.promoCodeService.create(req.user.id, dto);
  }

  @Get()
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Get all promo codes' })
  @ApiResponse({
    status: 200,
    description: 'List of promo codes',
    type: [PromoCode],
  })
  async findAll() {
    return this.promoCodeService.findAll();
  }

  @Get(':id')
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Get a promo code by ID' })
  @ApiParam({ name: 'id', description: 'Promo code ID' })
  @ApiResponse({
    status: 200,
    description: 'Promo code found',
    type: PromoCode,
  })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async findOne(@Param('id') id: string) {
    return this.promoCodeService.findById(id);
  }

  @Delete(':id')
  @UseInterceptors(DecryptTokenInterceptor, AdminInterceptor)
  @ApiOperation({ summary: 'Delete a promo code by ID' })
  @ApiParam({ name: 'id', description: 'Promo code ID' })
  @ApiResponse({
    status: 200,
    description: 'Promo code deleted successfully',
    type: PromoCode,
  })
  @ApiResponse({ status: 404, description: 'Promo code not found' })
  async delete(@Param('id') id: string) {
    return this.promoCodeService.delete(id);
  }
}
