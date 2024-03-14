import { BadRequestException, Injectable, Req } from '@nestjs/common';
// import {
//   AdminActivationDto,
//   AdminForgotPasswordDto,
//   AdminLoginDto,
//   AdminResetPasswordDto,
//   CreateAdminDto,
// } from './dto/create-admin.dto';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { TokenSender } from './utils/sendToken';
import * as bcrypt from 'bcrypt';
import {  PropertyVendor } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { CreateVendorDto, VendorActivationDto, VendorForgotPasswordDto, VendorLoginDto, VendorResetPasswordDto } from './dto/create-vendor.dto';
import { VendorTokenSender } from './utils/sendVendorToken';

// import { Response } from 'express';

interface vendorData {
  name: string;
  email: string;
  password: string;
  // phone_number: number;
}

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}



  /*******===================================*****
   * Services from Property Vendors Service
   *********=======================================***/

  // register user service
  async registerVendor(registerDto: CreateVendorDto) {
    // response: Response
    //phone_number
    const { name, email, password } = registerDto;

    const isEmailExist = await this.prisma.propertyVendor.findUnique({
      where: {
        email,
      },
    });
    // if (isEmailExist.isFirstSettingAdmin) {
    //   throw new BadRequestException('Only one super-admin can be created!');
    // }
    if (isEmailExist) {
      throw new BadRequestException('This Vendor already exist with this email!');
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      // phone_number,
    };

    const activationToken = await this.createVendorActivationToken(user);

    const activationCode = activationToken.activationCode;

    const activation_token = activationToken.token;

    const isSentMail = await this.emailService
      .sendMail({
        email,
        subject: 'Activate your account!',
        template: './vendor-activation-mail',
        name,
        activationCode,
      })

      .then((response) => {
        console.log("Mail sent at this point");
        return { activation_token };
      })
      .catch((error) => {
        console.log('MailError', error);
      });

    // await client.sendMail({
    //   email,
    //   subject: 'Activate your account!',
    //   template: './activation-mail',
    //   name,
    //   activationCode,
    // });
    //response


    if (isSentMail) {
      return { activation_token };
    } else {
      throw new BadRequestException(
        'There was an error sending an activation mail for this registration!',
      );
    }
    // return { activation_token };
  }


  // create activation token
  async createVendorActivationToken(user: vendorData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

  // activation user
  async activateVendor(activationDto: VendorActivationDto) {
    //, response: Response
    const { activationToken, activationCode } = activationDto;

    try {
      const newUser: { user: vendorData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      } as JwtVerifyOptions) as { user: vendorData; activationCode: string };

    if (!newUser) {
      throw new BadRequestException('token expired');
    }

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException('Invalid activation code');
    }
    //phone_number
    const { name, email, password } = newUser.user;

    const existUser = await this.prisma.propertyVendor.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new BadRequestException('User already exist with this email!');
    }

    const vendor = await this.prisma.propertyVendor.create({
      data: {
        name,
        email,
        hashedPassword : password,
        //  phone_number,
      },
    });
    //, response
    return { vendor };
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    
  }

  // Login service
  async LoginVendor(loginDto: VendorLoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.propertyVendor.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials!');
    }

    if (user && (await this.compareVendorPassword(password, user.hashedPassword))) {
      const tokenSender = new VendorTokenSender(this.configService, this.jwtService);
      return tokenSender.sendVendorToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        // refreshToken: null,
        error: {
          message: 'Invalid credentials',
        },
      };
    }
  }

 
  // forgot password
  async forgotVendorPassword(forgotPasswordDto: VendorForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.propertyVendor.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exist!');
    }
    const forgotPasswordToken = await this.generateVendorForgotPasswordLink(user);
      console.log("forgotPassToken", forgotPasswordToken)
    const resetPasswordUrl =
      this.configService.get<string>('VENDOR_CLIENT_SIDE_URI') +
      `/reset-password?verify=${forgotPasswordToken}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your Password!',
      template: './vendor-forgot-password',
      name: user.name,
      activationCode: resetPasswordUrl,
    });

    return { message: `Your forgot password request succesful,please check your e-mail for a reset link!` };
  }

  // reset password
  async resetVendorPassword(resetPasswordDto: VendorResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new BadRequestException('Invalid token!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.propertyVendor.update({
      where: {
        id: decoded.user.id,
      },
      data: {
        hashedPassword: hashedPassword,
      },
    });

    return { user };
  }

  // get logged in user
  async getLoggedInVendor(req : any) {

    // console.log("LoggedUser&&Req", req)
    const user = req.user;
    // refreshToken,
    // const refreshToken = req.refreshtoken;
    // const accessToken = req.accesstoken;
//accessToken
    //console.log("Access_TOKEN,", accessToken)
    return { user  };
  }

  // log out Admin-User
  async LogoutVendor(req: any) {
    req.user = null;
    req.refreshtoken = null;
    req.accesstoken = null;
    return { message: 'Logged out successfully!' };
  }

  // get all users service
  async getVendors() {
    return this.prisma.propertyVendor.findMany({});
  }

  /*****
   * RE-USABLE FUNCTIONS FOR USER AUTHENTICATIONS
   * 
   */


  // compare with hashed password
  async compareVendorPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

 // generate forgot password link
 async generateVendorForgotPasswordLink(user: PropertyVendor) {
  const forgotPasswordToken = this.jwtService.sign(
    {
      user,
    },
    {
      secret: this.configService.get<string>('FORGOT_PASSWORD_SECRET'),
      expiresIn: '5m',
    },
  );
  return forgotPasswordToken;
}




}
