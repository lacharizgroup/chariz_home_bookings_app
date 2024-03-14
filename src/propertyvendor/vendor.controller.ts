import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  Request,
  
} from '@nestjs/common';


import {
  //  Request,
   Response } from 'express';
// import { ForgotPasswordResponse, LoginResponse, ResetPasswordResponse } from './types/vendoruser.types';
import { VendorAuthGuard } from './guards/vendor-auth.guard';
import { VendorService } from './vendor.service';
import { CreateVendorDto, VendorActivationDto, VendorForgotPasswordDto, VendorLoginDto, VendorResetPasswordDto } from './dto/create-vendor.dto';
import { LoginVendorResponse, VendorForgotPasswordResponse, VendorResetPasswordResponse } from './types/vendoruser.types';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}


  //Register an vendor user
  @Post('register') /***Done */
  async registerVendor(@Body() createVendorDto: CreateVendorDto, res: Response) {
    if (
      !createVendorDto.email ||
      !createVendorDto.name ||
      !createVendorDto.password
    ) {
      throw new BadRequestException('Please fill in all fields');
    }

    // const user = await this.adminService.create(createVendorDto)

    const { activation_token } = await this.vendorService.registerVendor(
      createVendorDto,
      // res,
    );

    return { activation_token };

    // return user;
  }

  //activate registered vendor-user
  @Post('activate-vendor-user') /***Done */
  async activateVendor(@Body() activateVendorDto: VendorActivationDto) {
    //, res: Response
    //, context.res
    return await this.vendorService.activateVendor(activateVendorDto);
  }
//login Vendor
  @Post('login') /***Done */
  async loginVendor(@Body() loginVendorDto: VendorLoginDto) : Promise<LoginVendorResponse> {
    return await this.vendorService.LoginVendor(loginVendorDto);
  }
//Vendor forgot password
  @Post('forgot-password') /***Done */
  async forgotVendorPassword(@Body() forgotPassVendorDto: VendorForgotPasswordDto) : Promise<VendorForgotPasswordResponse> {
    return await this.vendorService.forgotVendorPassword(forgotPassVendorDto);
  }
//reset an vendor password
  @Post('reset-password') /***Done */
  async resetVendorPassword(@Body() resetPassVendorDto: VendorResetPasswordDto) : Promise<VendorResetPasswordResponse> {
    return await this.vendorService.resetVendorPassword(resetPassVendorDto);
  }

  /***======================================**
   * AUTHENTICATED ACTICVITIES STARTS HERE  |
   *========================================**/
  @UseGuards(VendorAuthGuard)
  @Get('get-auth-vendor') /***Done */
  async getLoggedInUser(@Request() req:any) {
    return await this.vendorService.getLoggedInVendor(req);
  }


  @Post('logout-vendor') /***Done */
  @UseGuards(VendorAuthGuard)
  async logOutUser(@Request()  req:any) {
    return await this.vendorService.LogoutVendor(req);
  }


   /***======================================**
   * AUTHENTICATED ACTICVITIES ENDS HERE  |
   *========================================**/

}
