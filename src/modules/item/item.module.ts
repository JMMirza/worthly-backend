import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './schemas';
import { ItemsController } from './controllers';
import { ItemsService } from './services';
import { FirebaseStorageService } from 'src/services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService, FirebaseStorageService],
  exports: [ItemsService],
})
export class ItemsModule {}
