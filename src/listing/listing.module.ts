import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ReservationController } from './reservation.controller';
import { VendorListingController } from './vendor-listing.controller';

@Module({
  controllers: [ListingController, ReservationController, VendorListingController],
  providers: [ListingService, PrismaService, JwtService]
})
export class ListingModule {}
