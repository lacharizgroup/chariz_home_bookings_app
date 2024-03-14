import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserActivationDto, UserForgotPasswordDto, UserLoginDto, UserResetPasswordDto } from './dto/create-user.dto';
import { LoginUserResponse, UserForgotPasswordResponse, UserResetPasswordResponse } from './types/user.types';
import { UserAuthGuard } from './guards/user-auth.guard';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

   //Register an vendor user
   @Post('register') /***Done */
   async registerUser(@Body() createUserDto: CreateUserDto, res: Response) {
     if (
       !createUserDto.email ||
       !createUserDto.name ||
       !createUserDto.password
     ) {
       throw new BadRequestException('Please fill in all fields');
     }
 
     // const user = await this.adminService.create(createUserDto)
 
    //  const { activation_token, message } = await this.userService.registerUser(
    //    createUserDto,
    //    // res,
    //  );

    return await this.userService.registerUser(
      createUserDto,
      // res,
    );
 
    // console.log('controlerCreateUserRespose', activation_token)
    //  return { activation_token };
 
     // return user;
   }
 
   //activate registered vendor-user
   @Post('activate-user') /***Done */
   async activateUser(@Body() activateUsetDto: UserActivationDto) {
     //, res: Response
     //, context.res
     return await this.userService.activateUser(activateUsetDto);
   }
 //login User
   @Post('login') /***Done */
   async loginUser(@Body() loginUserDto: UserLoginDto) : Promise<LoginUserResponse> {
     return await this.userService.LoginUser(loginUserDto);
   }
 //User forgot password
   @Post('forgot-password') /***Done */
   async forgotUserPassword(@Body() forgotPassVendorDto: UserForgotPasswordDto) : Promise<UserForgotPasswordResponse> {
     return await this.userService.forgotUserPassword(forgotPassVendorDto);
   }
 //reset an user password
   @Post('reset-password') /***Done */
   async resetUserPassword(@Body() resetPassUserDto: UserResetPasswordDto) : Promise<UserResetPasswordResponse> {
     return await this.userService.resetUserPassword(resetPassUserDto);
   }
 
   /***======================================**
    * AUTHENTICATED ACTICVITIES STARTS HERE  |
    *========================================**/
   @UseGuards(UserAuthGuard)
   @Get('get-auth-user') /***Done */
  
   async getLoggedInUser(@Request() req:any) {
     return await this.userService.getLoggedInUser(req);
   }
 
   @Post('logout-user') /***Done */
   @UseGuards(UserAuthGuard)
   async logOutUser(@Request()  req:any) {
     return await this.userService.LogoutUser(req);
   }
 
   /**Handling listings activities */
   @UseGuards(UserAuthGuard)
   @Post('/favorite-list/:id')
   async favoriteAList(@Param() params: any, @Request() req:any){
     return await this.userService.userFavoritedListing(params.id, req);
   }

   @UseGuards(UserAuthGuard)
   @Post('/unfavorite-list/:id')
   async unfavoriteAList(@Param() params: any, @Request() req:any){
     return await this.userService.userFUnavoriteListing(params.id, req);
   }
 
    /***======================================**
    * AUTHENTICATED ACTICVITIES ENDS HERE  |
    *========================================**/
 
}
