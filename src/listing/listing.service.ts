import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateListingDto, GetListingsByParams } from './dto/create-listing.dto';
import {
  CreateReservationDto,
  getReservationsDto,
} from './dto/reservation.dto';

@Injectable()
export class ListingService {
  constructor(private prisma: PrismaService) {}

  /**========================================================
   *             GENERAL USERS CONCERNS                      |
   * @param req FOR ALL USERS TO GET LISTINGS STARTS         |
   * @returns ================================================
   */
  async getAllListedProperties(request: GetListingsByParams) {
    // const user = req.user;
    console.log("userId", request.userId)
    console.log("location", request.locationValue)
    console.log("searchPARAMS", request)
    let searchParams: any = {}

    if(request.userId){
      searchParams.userId = request.userId
    }

    if(request.category){
      searchParams.category = request.category
    }

    if(request.guestCount){
      searchParams.guestCount = {
        gte: +request.guestCount
      }
    }

    if(request.roomCount){
      searchParams.roomCount = {
        gte: +request.roomCount
      }
    }

    if(request.bathroomCount){
      searchParams.bathroomCount = {
        gte: +request.bathroomCount
      }
    }

    if(request.locationValue){
      searchParams.locationValue = request.locationValue
    }

    if(request.startDate && request.endDate){
      searchParams.NOT = {
        reservations: {
          same: {
            OR: [
              {
                endDate: {gte: request.startDate},
                startDate: {gte: request.startDate}
              },
              {
                startDate: {gte: request.endDate},
                endDate: {gte: request.endDate}
              },
            ]
          }
        }
      }
    }

   


    try {
      const listings = await this.prisma.listing.findMany({
        where: searchParams,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return { listings };
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }

  /***------------------------Get Listing by property manager-----------------*/
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
    /**========================================================
   *              USERS CONCERNS                             |
   * @param req FOR ALL USERS TO GET LISTINGS ENDS           |
   * @returns ================================================
   */


  /**===============================================================
   *            AUTHENTICATED  USERS CONCERNS                       |
   * @param req FOR ALL PROPERTY MANAGERS TO MANAGE LISTINGS  STARTS|
   * @returns ======================================================
   */

  /***-------------Create Listing by property manager-----------------------*/
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

  /***Get Listing by PROPERTY_MANAGER */
  async getAllListedPropertiesByManagers(req: any) {
    const user = req.user;

    const listings = await this.prisma.listing.findMany({
      where: {
        userId: user?.id,
      },
    });

    return { listings };
  }

  

    /**===============================================================
   *            AUTHENTICATED  USERS CONCERNS                       |
   * @param req FOR ALL PROPERTY MANAGERS TO MANAGE LISTINGS  ENDS|
   * @returns ======================================================
   */

  /**=======================================================================
   *             AUTHENTICATED USER RESERVATION CONCERNS                   |
   * @param req FOR ALL LISTINGS-RESERVATIONS HANDLING STARTS              |
   * @returns ==============================================================
   */

  /**------------------------create a resrvation by user--------------------------------*/
  async createReservation(reservationDto: CreateReservationDto, req: any) {
    const user = req.user;

    const listingAndReservation = await this.prisma.listing.update({
      where: {
        id: reservationDto.listingId,
      },
      data: {
        resevations: {
          create: {
            authorOrOwnerId:'iii',
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

  /**-----------------get resrvations by user or author-------------------------*/
  async getReservations(reservationDto: getReservationsDto, req?: any) {
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
      throw new BadRequestException(error);
    }
  }

  /**-------------------------get resrvations by Listing-ID---------------*/
  async getReservationsByListingId(id: string, req?: any) {
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
      throw new BadRequestException(error);
    }
  }

  /**------------get user trips-------------------------*/
  async getUserTrips(req: any) {
    const user = req.user;

    console.log('AUTH_USER', user);

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
      throw new BadRequestException(error);
    }
  }

  /**--------------------get user trips-------------------------*/
  async getUserReservationByReservationID(param: string, req: any) {
    const user = req.user;

    if (!user) {
      throw new BadRequestException('Un-authorized user request');
    }
    try {
      const reservations = await this.prisma.reservation.findUnique({
        where: {
          id: param,
        },
        include: {
          listing: true,
        },
      });

      return reservations;
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }

  /**--------------Cancel user trips-------------------*/
  async userCancelReservation(param: string, req: any) {
    const user = req.user;

    if (!user) {
      throw new BadRequestException('Un-authorized user request');
    }

    try {
      const reservations = await this.prisma.reservation.delete({
        where: {
          id: param,
          OR: [{ userId: user?.id }],
        },
      });

      return reservations;
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }

  /**--------------------get user  trips-inview Or Liked/favorited listings-------------------------*/
  async getUserFavoritedListing( req: any) {
    const user = req.user;

    if (!user) {
      throw new BadRequestException('Un-authorized user request');
    }
    try {
      const favorites = await this.prisma.listing.findMany({
        where: {
          id: {
            in:[...(user.favoritedListings || [])],
          }
        },
        // include: {
        //   listing: true,
        // },
      });

      return favorites;
    } catch (error: any) {
      throw new BadRequestException(error);
    }
  }
}

  /**=======================================================================
   *             AUTHENTICATED USER RESERVATION CONCERNS                   |
   * @param req FOR ALL LISTINGS-RESERVATIONS HANDLING ENDS              |
   * @returns ==============================================================
   */
