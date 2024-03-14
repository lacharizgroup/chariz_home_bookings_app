import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {

    @IsNotEmpty({ message: 'Name is required.' })
    @IsString({ message: 'Name must need to be one string.' })
    name: string;
  
  
    @IsNotEmpty({ message: 'Password is required.' })
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    password: string;
  
  
    @IsNotEmpty({ message: 'Email is required.' })
    @IsEmail({}, { message: 'Email is invalid.' })
    email: string;
  
  
    //  @IsNotEmpty({ message: 'Phone Number is required.' })
    // phone_number: number;
}



export class AdminActivationDto {

  @IsNotEmpty({ message: 'Activation Token is required.' })
  activationToken: string;


  @IsNotEmpty({ message: 'Activation Code is required.' })
  activationCode: string;
}


export class AdminLoginDto {

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;


  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}


export class AdminForgotPasswordDto {

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;
}


export class AdminResetPasswordDto {

  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string;


  @IsNotEmpty({ message: 'Activation Token is required.' })
  activationToken: string;
}
