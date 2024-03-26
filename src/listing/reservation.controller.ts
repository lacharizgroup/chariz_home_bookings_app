import {
    BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
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

   /***User Cancel booked trips */
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



    /*********===================================================AUTHENTICATED USERS ==================================*/
  /***
   * PAYEMT RELATED ACTIVITIES FOR AUTHENTICATED RESERVATION ACTIVITIES BY USERS
   * ==========================================================================================================
   */
  /***Server action on payment for reservation  */

   /***User Cancel booked trips */
   @Put('update-on-payment/:reservationId')
   @UseGuards(UserAuthGuard)
   async onPaymentForReservation(
     @Param() params: any,
     @Body() paymentMetaData: any,
     @Request() req: any,
   ) {
    const {reservationId} = params
    console.log('UPDATE_PAYMENT_DATA', paymentMetaData)

    // return
    if(!reservationId || typeof reservationId !== 'string'){
        throw new BadRequestException('Invalide request parameter detected')
    }
  
     return await this.listingService.updateReservationOnPayment(
        reservationId,
        paymentMetaData,
       req,
     );
   }
}
