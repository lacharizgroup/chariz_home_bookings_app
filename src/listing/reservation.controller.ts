import { Controller, Get, Req, Request, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { UserAuthGuard } from 'src/user/guards/user-auth.guard';

@Controller('reservation')
export class ReservationController {
    constructor(private readonly listingService: ListingService) {}


    @Get()
    async getAllReservations() {
    //   return await this.listingService.getAllListedProperties();
    return "All resrevations on the way"
    }


    @Get('user-trips')
    @UseGuards(UserAuthGuard)
    async getUsersTripsReservations(
        @Request() req: any
    ) {
        console.log('All user trips on the way')
    //   return await this.listingService.getAllListedProperties();
    return await this.listingService.getUserTrips(req)

    }
}
