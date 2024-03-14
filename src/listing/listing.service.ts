import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import {
  CreateReservationDto,
  getReservationsDto,
} from './dto/reservation.dto';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  /**========================================================
   *              USERS CONCERNS                             |
   * @param req FOR ALL PROPERTY MANAGERS TO MANAGE LISTINGS |
   * @returns ================================================
   */
  /***Create Listing by property manager */
  async createListProperty(listingDto: CreateListingDto, req: any) {
    const user = req.user;

    const listing = await this.prisma.listing.create({
      data: {
        title: listingDto.title,
        description: listingDto.description,
        imageSrc: listingDto.imageSrc,
        category: listingDto.category,
        roomCount: listingDto.roomCount,
        bathroomCount: listingDto.bathroomCount,
        guestCount: listingDto.guestCount,
        locationValue: listingDto.location.value,
        price: listingDto.price,
        userId: user.id,
      },
    });

    return { listing };
  }

  /***Get Listing by property manager */
  async getAllListedPropertiesByManagers(req: any) {
    const user = req.user;

    const listings = await this.prisma.listing.findMany({
      where: {
        userId: user?.id,
      },
    });

    return { listings };
  }

  /**========================================================
   *              USERS CONCERNS                             |
   * @param req FOR ALL USERS TO GET LISTINGS                |
   * @returns ================================================
   */
  async getAllListedProperties() {
    // const user = req.user;

  try {
    const listings = await this.prisma.listing.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { listings };
  } catch (error: any) {
    throw new BadRequestException(error);
  }
  }

  /***Get Listing by property manager */
  async getSingleListedProperty(id: string) {
    // const user = req.user;

  try {
    const listing = await this.prisma.listing.findUnique({
      where: {
        id: id,
      },
    });

    return listing;
  } catch (error: any) {
    throw new BadRequestException(error);
  }
  }

  /**=======================================================================
   *              RESERVATION CONCERNS                                     |
   * @param req FOR ALL LISTINGS-RESERVATIONS HANDLING                     |
   * @returns ==============================================================
   */

  /**create a resrvation */
  async createReservation(reservationDto: CreateReservationDto, req: any) {
    const user = req.user;

    const listingAndReservation = await this.prisma.listing.update({
      where: {
        id: reservationDto.listingId,
      },
      data: {
        resevations: {
          create: {
            userId: user?.id,
            startDate: reservationDto.startDate,
            endDate: reservationDto.endDate,
            totalPrice: reservationDto.totalPrice,
          },
        },
      },
    });

    return { listingAndReservation };
  }

  /**get resrvations by user or author */
  async getReservations(reservationDto: getReservationsDto, req?: any) {
    // const user = req.user;

    const { listingId, userId, authorId } = reservationDto;
    const query: any = {};

    if (listingId) {
      query.listingId = listingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.listingId = { userId: authorId };
    }

    try {
      const reservations = await this.prisma.reservation.findMany({
        where: query,
        include: {
          listing: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reservations;
    } catch (error: any) {
      // return error;
      throw new BadRequestException(error);
    }
  }

  /**get resrvations by Listing-ID */
  async getReservationsByListingId(id: string, req?: any) {
    // const user = req.user;

    try {
      const reservations = await this.prisma.reservation.findMany({
        where: {
          listingId: id,
        },
        include: {
          listing: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reservations;
    } catch (error: any) {
      // return error;
      throw new BadRequestException(error);
    }
  }

   /**get user trips*/
   async getUserTrips(req: any) {
    const user = req.user;

    console.log("AUTH_USER", user)

    try {
      const reservations = await this.prisma.reservation.findMany({
        where: {
          userId: user?.id,
        },
        include: {
          listing: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reservations;
    } catch (error: any) {
      // return error;
      throw new BadRequestException(error);
    }
  }

}
