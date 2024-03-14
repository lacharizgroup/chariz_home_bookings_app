import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateReservationDto {

    

    @IsNotEmpty({ message: 'Reservation start date is required.' })
    // @IsString({ message: 'Category must need to be one string.' })
    startDate: string;

    @IsNotEmpty({ message: 'Reservation start date is required.' })
    // @IsString({ message: 'Category must need to be one string.' })
    endDate: string;

    @IsNotEmpty({ message: 'Property to reserve required.' })
    @IsString({ message: 'Listing must need to be one string.' })
    listingId: string;


    @IsNotEmpty({ message: 'Guest count is required.' })
    @IsNumber()
    totalPrice: number;
 
}

export class getReservationsDto {
    // @IsNotEmpty({ message: 'Property to reserve required.' })
    @IsString({ message: 'Listing must need to be one string.' })
    listingId: string;

    // @IsNotEmpty({ message: 'Property to reserve required.' })
    @IsString({ message: 'Listing must need to be one string.' })
    userId: string;

     // @IsNotEmpty({ message: 'Property to reserve required.' })
     @IsString({ message: 'Listing must need to be one string.' })
     authorId: string;



    // @IsNotEmpty({ message: 'Reservation start date is required.' })
    // // @IsString({ message: 'Category must need to be one string.' })
    // startDate: string;

    // @IsNotEmpty({ message: 'Reservation start date is required.' })
    // // @IsString({ message: 'Category must need to be one string.' })
    // endDate: string;

   


    // @IsNotEmpty({ message: 'Guest count is required.' })
    // @IsNumber()
    // totalPrice: number;
 
}

