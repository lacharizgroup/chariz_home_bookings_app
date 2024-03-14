import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { UserAuthGuard } from 'src/user/guards/user-auth.guard';
import { ListingService } from './listing.service';
import { CreateReservationDto, getReservationsDto } from './dto/reservation.dto';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  /**===================================================================================================================== */
  /**
   * ==============================================================================
   * @param || ALL AUTHETICATED ROUTES FOR HANDLING LISTINGS BY ALL USER CONCERNS
   * @param req ===================================================================
   * @returns
   */
  /**===================================================================================================================== */

  @Get()
  async getAllListedProperties() {
    return await this.listingService.getAllListedProperties();
  }

  @Get(':id')
  async getOneProperty(@Param() params: any) {
    return await this.listingService.getSingleListedProperty(params.id);
  }

  /**===================================================================================================================== */
  /**
   * ==============================================================================
   * @param || ALL AUTHETICATED ROUTES FOR HANDLING LISTINGS BY PROPERTY MANAGERS
   * @param req ===================================================================
   * @returns
   */
  /**===================================================================================================================== */
  @UseGuards(UserAuthGuard)
  @Get('managers/properties')
  async getMyListingManagers(
    @Body() createListing: CreateListingDto,
    @Request() req: any,
  ) {
    if (!createListing.title) {
      throw new BadRequestException('Please fill in all fields');
    }

    return await this.listingService.createListProperty(createListing, req);
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
  console.log("Checking-Get-Resevations CALLS", params.id)
  // if(!reservationDto.listingId || !reservationDto.userId || !reservationDto.authorId ){
  //   throw new BadRequestException('getting reservations needs atleast one query parameter!');
  // }

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
