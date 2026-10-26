import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePromoCodeDto } from '../dto';
import { PromoCode, PromoCodeDocument } from '../schemas';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectModel(PromoCode.name)
    private promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  async create(userId: string, dto: CreatePromoCodeDto): Promise<PromoCode> {
    const exists = await this.promoCodeModel.findOne({ code: dto.code });
    if (exists) {
      throw new BadRequestException('Promo code already exists');
    }

    const created = new this.promoCodeModel({
      ...dto,
      createdFor: new Types.ObjectId(dto.createdFor),
      createdBy: new Types.ObjectId(userId),
    });

    return created.save();
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoCodeModel
      .find()
      .populate([
        { path: 'createdBy' },
        { path: 'createdFor' },
        { path: 'usedBy.user' },
      ])
      .lean();
  }

  async findById(id: string): Promise<PromoCode> {
    const promo = await this.promoCodeModel.findById(id).lean();
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  async delete(id: string): Promise<PromoCode> {
    const promo = await this.promoCodeModel
      .findByIdAndDelete(id)
      .lean<PromoCode>();
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }
}
