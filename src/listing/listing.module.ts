import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ReservationController } from './reservation.controller';

@Module({
  controllers: [ListingController, ReservationController],
  providers: [ListingService, PrismaService, JwtService]
})
export class ListingModule {}
