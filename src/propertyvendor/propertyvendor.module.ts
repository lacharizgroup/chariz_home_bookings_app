import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Module({
    imports: [
  
        EmailModule,
      ],
      controllers: [VendorController],
      providers: [VendorService,ConfigService, JwtService, PrismaService],
})
export class PropertyvendorModule {}
