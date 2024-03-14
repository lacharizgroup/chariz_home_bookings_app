import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateListingDto {

    @IsNotEmpty({ message: 'Title is required.' })
    @IsString({ message: 'Title must need to be one string.' })
    title: string;
  
    @IsNotEmpty({ message: 'Description is required.' })
    @IsString({ message: 'Description must need to be one string.' })
    description: string;

    @IsNotEmpty({ message: 'Category is required.' })
    @IsString({ message: 'Category must need to be one string.' })
    category: string;

    // @IsNotEmpty({ message: 'Category is required.' })
    // @IsString({ message: 'Category must need to be one string.' }) 
    @IsNotEmpty({ message: 'Location is required.' })
    location: any;

    @IsNotEmpty({ message: 'Guest count is required.' })
    @IsNumber()
    guestCount: number;

    @IsNotEmpty({ message: 'Room count is required.' })
    @IsNumber()
    roomCount: number;
  

    @IsNotEmpty({ message: 'Bathroom count is required.' })
    @IsNumber()
    bathroomCount: number;

    @IsNotEmpty({ message: 'Image is required.' })
    @IsString({ message: 'Image must need to be one string.' })
    imageSrc: string;

    @IsNotEmpty({ message: 'Price is required.' })
    @IsNumber()
    price: number;
  
  /**============================================================ */
    // @IsNotEmpty({ message: 'Password is required.' })
    // @MinLength(8, { message: 'Password must be at least 8 characters.' })
    // password: string;
  
  
    // @IsNotEmpty({ message: 'Email is required.' })
    // @IsEmail({}, { message: 'Email is invalid.' })
    // email: string;
  
  
    //  @IsNotEmpty({ message: 'Phone Number is required.' })
    // phone_number: number;
}



// export class AdminActivationDto {

//   @IsNotEmpty({ message: 'Activation Token is required.' })
//   activationToken: string;


//   @IsNotEmpty({ message: 'Activation Code is required.' })
//   activationCode: string;
// }


// export class AdminLoginDto {

//   @IsNotEmpty({ message: 'Email is required.' })
//   @IsEmail({}, { message: 'Email must be valid.' })
//   email: string;


//   @IsNotEmpty({ message: 'Password is required.' })
//   password: string;
// }


// export class AdminForgotPasswordDto {

//   @IsNotEmpty({ message: 'Email is required.' })
//   @IsEmail({}, { message: 'Email must be valid.' })
//   email: string;
// }


// export class AdminResetPasswordDto {

//   @IsNotEmpty({ message: 'Password is required.' })
//   @MinLength(8, { message: 'Password must be at least 8 characters.' })
//   password: string;


//   @IsNotEmpty({ message: 'Activation Token is required.' })
//   activationToken: string;
// }
