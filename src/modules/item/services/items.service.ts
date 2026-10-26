import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Item, ItemDocument } from '../schemas';
import { CreateItemDto, QueryItemDto, UpdateItemDto } from '../dto';
import { findAll, FirebaseStorageService } from 'src/services';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  async create(user: any, dto: CreateItemDto): Promise<Item> {
    const {
      unitWorth,
      quantity = 1,
      buyingPrice = 0,
      image,
      recommendedPlatforms,
      title,
      description,
      sellTime,
      createdAt
    } = dto;

    const totalWorth = unitWorth * quantity;
    const profit = totalWorth - buyingPrice;

    const created = new this.itemModel({
      image,
      recommendedPlatforms,
      title,
      description,
      sellTime,
      itemWorth: unitWorth,
      quantity,
      totalWorth,
      buyingPrice,
      profit,
      user: user.id,
      createdAt,
      updatedAt:createdAt
    });

    return created.save();
  }

  async findAll(user, query: QueryItemDto) {
    const { page = 1, limit = 10, currency, search } = query;
    const filter: FilterQuery<ItemDocument> = {};
    if (user) filter.user = user;
    if (currency) filter.currency = currency;

    const data = await findAll(
      this.itemModel,
      limit,
      search,
      page,
      ['title', 'description'],
      filter,
      [],
      [],
      { createdAt: -1 },
    );
    await Promise.all(
      data?.results.map(async (record: any) => {
        const uuid = record?.image?.uuid;
        if (uuid) {
          const profilePicLink = await this.firebaseStorageService.getSignedUrl(
            `items/${uuid}`,
          );
          if (!record.image) {
            record.image = {};
          }
          record.image.link = profilePicLink;
        }
      }),
    );
    return data;
  }

  async findOne(id: string): Promise<Item> {
    const item: any = await this.itemModel
      .findById(id)
      .populate('user')
      .lean<Item>();
    if (!item) throw new NotFoundException('Item not found');
    if (item?.image) {
      const uuid = item?.image?.uuid;
      if (uuid) {
        const profilePicLink = await this.firebaseStorageService.getSignedUrl(
          `items/${uuid}`,
        );
        item.image.link = profilePicLink;
      }
    }
    return item;
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    // fetch current doc
    const current = await this.itemModel.findById(id).lean<Item>();
    if (!current) throw new NotFoundException('Item not found');

    // determine latest values
    const itemWorth = dto.unitWorth ?? current.itemWorth; // unit worth
    const quantity = dto.quantity ?? current.quantity ?? 1;
    const buyingPrice = dto.buyingPrice ?? current.buyingPrice ?? 0;

    // recompute
    const totalWorth = itemWorth * quantity;
    const profit = totalWorth - buyingPrice;
    const { image, recommendedPlatforms, title, description, sellTime } = dto;
    const update: any = {
      image,
      recommendedPlatforms,
      title,
      description,
      sellTime,
      itemWorth,
      quantity,
      totalWorth,
      buyingPrice,
      profit,
    };

    const item = await this.itemModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean<Item>();

    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.itemModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Item not found');
    return { deleted: true };
  }

  async getUserDashboard(userId: any, query: DashboardQueryDto) {
    const { date } = query;

    // build filter
    const matchFilter: any = { user: new Types.ObjectId(userId) };

    // if date provided, match only items created on that day
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      matchFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Aggregation for totals
    const totals = await this.itemModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalWorth: { $sum: '$totalWorth' },
          totalItems: { $sum: 1 },
          netProfit: { $sum: '$profit' },
        },
      },
    ]);

    const {
      totalWorth = 0,
      totalItems = 0,
      netProfit = 0,
    } = totals.length > 0 ? totals[0] : {};

    // Last 10 items with same filter
    const recentItems = await this.itemModel
      .find(matchFilter)
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // attach signed image links
    await Promise.all(
      recentItems?.map(async (item: any) => {
        if (item?.image) {
          const uuid = item?.image?.uuid;
          if (uuid) {
            const profilePicLink =
              await this.firebaseStorageService.getSignedUrl(`items/${uuid}`);
            item.image.link = profilePicLink;
          }
        }
      }),
    );

    return {
      totalWorth,
      totalItems,
      netProfit,
      recentItems,
    };
  }

  async getChartData(userId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [result] = await this.itemModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $facet: {
          chartData: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' },
                },
                totalWorth: { $sum: '$totalWorth' },
              },
            },
            {
              $project: {
                _id: 0,
                date: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day',
                  },
                },
                totalWorth: 1,
              },
            },
            { $sort: { date: 1 } },
          ],
          total: [
            { $group: { _id: null, totalItemWorth: { $sum: '$totalWorth' } } },
          ],
        },
      },
    ]);

    return {
      totalItemWorth:
        result.total.length > 0 ? result.total[0].totalItemWorth : 0,
      chartData: result.chartData,
    };
  }
}
