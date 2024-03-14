import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { PropertyvendorModule } from './propertyvendor/propertyvendor.module';
import { UserModule } from './user/user.module';
import { ListingModule } from './listing/listing.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    PropertyvendorModule,
    UserModule,
    ListingModule,
  
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService, JwtService],
})
export class AppModule {}
