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

@Controller('vendorlisting')
export class VendorListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  async getAllVendorListings() {
    return 'All resrevations on the way';
  }

  @UseGuards(UserAuthGuard)
  @Get('get/listings/:id')
  async getSinglePropertManagersListing(@Param() params: any,  @Request() req: any,) {
    console.log('@VENDOR_REQUESTING_SINGLE_LISTING____1')
    return await this.listingService.getManagerSingleListedProperty(params.id, req);
  }
 
}
