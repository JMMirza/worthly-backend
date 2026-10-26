import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ItemsService } from '../services';
import { Item } from '../schemas';
import {
  ChartQueryDto,
  CreateItemDto,
  QueryItemDto,
  UpdateItemDto,
} from '../dto';
import { DecryptTokenInterceptor } from 'src/interceptors';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';

@ApiTags('items')
@ApiBearerAuth() // keep if you use auth; safe to remove if not
@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Create a new item' })
  @ApiCreatedResponse({ description: 'Item created', type: Item })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateItemDto, @Request() request: any) {
    const user = request.user;
    return this.itemsService.create(user, dto);
  }

  @Get()
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'List items with pagination' })
  @ApiOkResponse({ description: 'Items fetched' })
  findAll(@Query() query: QueryItemDto, @Request() request: any) {
    const user = request.user;
    return this.itemsService.findAll(user.id, query);
  }

  @Get('dashboard')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'List items with pagination' })
  @ApiOkResponse({ description: 'Items fetched' })
  findDashboardItems(@Query() query: DashboardQueryDto,@Request() request: any) {
    const user = request.user;
    return this.itemsService.getUserDashboard(user.id, query);
  }

  @Get('chart')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Get chart data of items over time' })
  @ApiOkResponse({ description: 'Chart data fetched' })
  getChart(@Query() query: ChartQueryDto, @Request() request: any) {
    const user = request.user;
    return this.itemsService.getChartData(user.id, query.days);
  }

  @Get(':id')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Get single item by id' })
  @ApiOkResponse({ description: 'Item fetched', type: Item })
  @ApiNotFoundResponse({ description: 'Item not found' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Update an item' })
  @ApiOkResponse({ description: 'Item updated', type: Item })
  @ApiNotFoundResponse({ description: 'Item not found' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  @UseInterceptors(DecryptTokenInterceptor)
  @ApiOperation({ summary: 'Delete an item' })
  @ApiOkResponse({ description: 'Item deleted' })
  @ApiNotFoundResponse({ description: 'Item not found' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
