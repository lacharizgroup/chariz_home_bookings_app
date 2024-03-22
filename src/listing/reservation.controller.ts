import {
    BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { UserAuthGuard } from 'src/user/guards/user-auth.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  async getAllReservations() {
    //   return await this.listingService.getAllListedProperties();
    return 'All resrevations on the way';
  }



  /*********===================================================AUTHENTICATED USERS ==================================*/
  /***
   * AUTHENTICATED RESERVATION ACTIVITIES BY USERS
   */
  /***Get User booked trips */
  @Get('user-trips')
  @UseGuards(UserAuthGuard)
  async getUsersTripsReservations(@Request() req: any) {
    // console.log('All user trips on the way')
    //   return await this.listingService.getAllListedProperties();
    return await this.listingService.getUserTrips(req);
  }

  /***Get User booked trips */
  @Get('user-trip/:id')
  @UseGuards(UserAuthGuard)
  async getUserSingleTripReservation(
    @Param() params: any,
    @Request() req: any,
  ) {
    console.log('Single user trip on the way');
    //   return await this.listingService.getAllListedProperties();
    return await this.listingService.getUserReservationByReservationID(
      params.id,
      req,
    );
  }

    /***Get User trips-inview Or Liked/favorited listings */
    @Get('/inview/user-trip/:listingid')
    @UseGuards(UserAuthGuard)
    async getUserTripInview(
      @Param() params: any,
      @Request() req: any,
    ) {
      return await this.listingService.getUserFavoritedListing(
        // params.id,
        req,
      );
    }

   /***Get User booked trips */
   @Delete('user-trip/:reservationId')
   @UseGuards(UserAuthGuard)
   async userCancelReservation(
     @Param() params: any,
     @Request() req: any,
   ) {
    const {reservationId} = params
    if(!reservationId || typeof reservationId !== 'string'){
        throw new BadRequestException('Invalide request parameter detected')
    }
  
     return await this.listingService.getUserReservationByReservationID(
        reservationId,
       req,
     );
   }
}
