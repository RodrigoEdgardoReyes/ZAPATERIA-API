import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { BrandsModule } from './brands/brands.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './product_variants/product_variants.module';
import { InventoryModule } from './inventory/inventory.module';
import { AddressesModule } from './addresses/addresses.module';
import { UserProfilesModule } from './user_profiles/user_profiles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT! || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: true,
      synchronize: true,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    RolesModule,
    BrandsModule, 
    PromotionsModule,
    CategoriesModule,
    SubcategoriesModule,
    UsersModule,
    ProductsModule,
    ProductVariantsModule,
    InventoryModule,
    AddressesModule,
    UserProfilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
