import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateListingDto, GetListingsByParams } from './dto/create-listing.dto';
import { UserAuthGuard } from 'src/user/guards/user-auth.guard';
import { ListingService } from './listing.service';
import { CreateReservationDto, getReservationsDto } from './dto/reservation.dto';
import { query } from 'express';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  /**===================================================================================================================== */
  /**
   * ==============================================================================
   * @param || ALL UN-AUTHETICATED ROUTES FOR HANDLING LISTINGS BY ALL USER CONCERNS
   * @param req ===================================================================
   * @returns
   */
  /**===================================================================================================================== */

  @Get()
  async getAllListedProperties(
    // @Req() request: GetListingsByParams
    @Query() query: GetListingsByParams
    ) {

    // console.log
    return await this.listingService.getAllListedProperties(query);
  }

  @Get(':id')
  async getOneProperty(@Param() params: any) {
    return await this.listingService.getSingleListedProperty(params.id);
  }



/**|||||||||||||||||||||||||||||||||||LISTING HANDLING BY VENDORS=||||||||||||||||||||||||||||||||||||||||||||||| */
  /**===================================================================================================================== */
  /**
   * ==============================================================================
   * @param || ALL AUTHETICATED ROUTES FOR HANDLING LISTINGS BY PROPERTY MANAGERS
   * @param req ===================================================================
   * @returns
   */
  /**==============================================UserAuthGuard======================================================================= */
  @UseGuards(UserAuthGuard)
  @Get('managers/properties')
  async getMyListingManagers(
    @Request() req: any,
  ) {
    console.log('Entered Managers Listings find111')
    return await this.listingService.getAllListedPropertiesByManagers(req);
  }

 

  /***Create a listing by property manager: (for now on users) */
  @UseGuards(UserAuthGuard)
  @Post('chariz-my-property')
  async createListingByUsers(
    @Body() createListing: CreateListingDto,
    @Request() req: any,
  ) {
    if (!createListing.title) {
      throw new BadRequestException('Please fill in all fields');
    }

    return await this.listingService.createListProperty(createListing, req);
  }




  /**|||||||||||||||||||||||||||||||||||RESERVATIONS HANDLING=||||||||||||||||||||||||||||||||||||||||||||||| */
  /**=================================================================================
 *              RESERVATION CONCERNS                                     |
 * @param req FOR ALL LISTINGS-RESERVATIONS HANDLING  STARTS HERE                   |
 * @returns ========================================================================
 */
 /***Create a reservation (for now on users) */
 @UseGuards(UserAuthGuard)
 @Post('reserve-a-property')
 async reserveListingByUsers(
   @Body() reservationDto: CreateReservationDto,
   @Request() req: any,
 ) {
  if(!reservationDto.startDate || !reservationDto.endDate || !reservationDto.listingId || !reservationDto.totalPrice){
    throw new BadRequestException('reservation start-date, end-date, property of intent and price are required datas!');
  }

   return await this.listingService.createReservation(reservationDto, req);
 }

 /***get reservations  */
//  @UseGuards(UserAuthGuard)
 @Get('get-reservations/:listingId/:userId/:authorId')
 async getReservationsByUsersAndAuthors(
  @Param() reservationDto: getReservationsDto,
  //  @Body() reservationDto: CreateReservationDto,
   @Request() req: any,
 ) {

  console.log('ReservatioQueryPARAMS', reservationDto)

  if(!reservationDto.listingId || !reservationDto.userId || !reservationDto.authorId ){
    throw new BadRequestException('getting reservations needs atleast one query parameter!');
  }

   return await this.listingService.getReservations(reservationDto, req);
 }

 @Get('get-listing-reservations/:id')
 async getReservationsByListingId(
  @Param() params: any,
  //  @Body() reservationDto: CreateReservationDto,
   @Request() req: any,
 ) {
   return await this.listingService.getReservationsByListingId(params.id, req);
 }


 
//  @Get('get-mytrips')
//  @UseGuards(UserAuthGuard)
//  async getUserTrips(
//   // @Param() params: any,
//   //  @Body() reservationDto: CreateReservationDto,
//    @Request() req: any,
//  ) {
//   console.log("GETTING_TRIPS")
//     return await this.listingService.getUserTrips(req);
//  }


}



/**===================================================================================================================== */
/**
 * ==============================================================================
 * @param || ALL AUTHETICATED ROUTES FOR HANDLING LISTINGS BY PROPERTY ADMIN DASHBOARD
 * @param req ===================================================================
 * @returns
 */
/**===================================================================================================================== */
