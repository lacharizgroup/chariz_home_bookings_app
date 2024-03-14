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
import { AdminService } from './admin.service';
import { AdminActivationDto, AdminForgotPasswordDto, AdminLoginDto, AdminResetPasswordDto, CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {
  //  Request,
   Response } from 'express';
import { ForgotPasswordResponse, LoginResponse, ResetPasswordResponse } from './types/adminuser.types';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  //Register an admin user
  @Post('register') /***Done */
  async registerAdmin(@Body() createAdminDto: CreateAdminDto, res: Response) {
    if (
      !createAdminDto.email ||
      !createAdminDto.name ||
      !createAdminDto.password
    ) {
      throw new BadRequestException('Please fill in all fields');
    }

    // const user = await this.adminService.create(createAdminDto)

    const { activation_token } = await this.adminService.register(
      createAdminDto,
      // res,
    );

    return { activation_token };

    // return user;
  }

  //activate registered admin-user
  @Post('activate-admin-user') /***Done */
  async activateUser(@Body() activateAdminDto: AdminActivationDto) {
   
    return await this.adminService.activateUser(activateAdminDto);
  }
//login admin
  @Post('login') /***Done */
  async loginAdmin(@Body() loginAdminDto: AdminLoginDto) : Promise<LoginResponse> {

    // console.log(loginAdminDto)

    // return
    return await this.adminService.Login(loginAdminDto);
  }
//admin forgot password
  @Post('forgot-password')
  async forgotAdminPassword(@Body() forgotPassAdminDto: AdminForgotPasswordDto) : Promise<ForgotPasswordResponse> {
    return await this.adminService.forgotPassword(forgotPassAdminDto);
  }
//reset an admin password
  @Post('reset-password')
  async resetAdminPassword(@Body() resetPassAdminDto: AdminResetPasswordDto) : Promise<ResetPasswordResponse> {
    return await this.adminService.resetPassword(resetPassAdminDto);
  }

  /***======================================**
   * AUTHENTICATED ACTICVITIES STARTS HERE  |
   *========================================**/
  @UseGuards(AdminAuthGuard)
  @Get('get-auth-admin') /***Done */
  async getLoggedInUser(@Request() req:any) {
    return await this.adminService.getLoggedInUser(req);
  }


  @Post('logout-admin') /***Done */
  @UseGuards(AdminAuthGuard)
  async logOutUser(@Request()  req:any) {
    return await this.adminService.LogoutAdmin(req);
  }


   /***======================================**
   * AUTHENTICATED ACTICVITIES ENDS HERE  |
   *========================================**/

}
