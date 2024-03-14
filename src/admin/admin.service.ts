import { BadRequestException, Injectable, Req } from '@nestjs/common';
import {
  AdminActivationDto,
  AdminForgotPasswordDto,
  AdminLoginDto,
  AdminResetPasswordDto,
  CreateAdminDto,
} from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenSender } from './utils/sendToken';
import * as bcrypt from 'bcrypt';
import { AmdinUser } from '@prisma/client';
import { EmailService } from '../email/email.service';

// import { Response } from 'express';

interface UserData {
  name: string;
  email: string;
  password: string;
  // phone_number: number;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /*******===================================*****
   * Services from Admin Service
   *********=======================================***/

  // register user service
  async register(registerDto: CreateAdminDto) {
    // response: Response
    //phone_number
    const { name, email, password } = registerDto;

    // check if there's an admin user with count > 0
    const checkAdminCount = await this.prisma.amdinUser.findMany({});
    if (checkAdminCount.length > 0) {
      throw new BadRequestException('Only one super-admin can be created!');
    }

    const isEmailExist = await this.prisma.amdinUser.findUnique({
      where: {
        email,
      },
    });
       if (isEmailExist) {
      throw new BadRequestException('User already exist with this email!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      // phone_number,
    };

    const activationToken = await this.createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const activation_token = activationToken.token;

    const isSentMail = await this.emailService
      .sendMail({
        email,
        subject: 'Activate your account!',
        template: './activation-mail',
        name,
        activationCode,
      })

      .then((response) => {
        console.log('SuccessResponse', response);
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
  }

  // create activation token
  async createActivationToken(user: UserData) {
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
  async activateUser(activationDto: AdminActivationDto) {
    //, response: Response
    const { activationToken, activationCode } = activationDto;

    try {
    
      const newUser: { user: UserData; activationCode: string } =
      this.jwtService.verify(activationToken, {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
      } as JwtVerifyOptions) as { user: UserData; activationCode: string };

    if (!newUser) {
      throw new BadRequestException('token expired');
    }

    if (newUser.activationCode !== activationCode) {
      throw new BadRequestException('Invalid activation code');
    }
    //phone_number
    const { name, email, password } = newUser.user;

    const existUser = await this.prisma.amdinUser.findUnique({
      where: {
        email,
      },
    });

    if (existUser) {
      throw new BadRequestException('User already exist with this email!');
    }

    const user = await this.prisma.amdinUser.create({
      data: {
        name,
        email,
        password,
        isFirstSettingAdmin:true
        //  phone_number,
      },
    });
  
    return { user };

    } catch (error) {
       throw new BadRequestException(error.message);
    }

    
  }

  // Login service
  async Login(loginDto: AdminLoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.amdinUser.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials!');
    }

    if (user && (await this.comparePassword(password, user.password))) {
      const tokenSender = new TokenSender(this.configService, this.jwtService);
      return tokenSender.sendToken(user);
    } else {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        error: {
          message: 'Invalid credentials',
        },
      };
    }
  }

  // forgot password
  async forgotPassword(forgotPasswordDto: AdminForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.amdinUser.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exist!');
    }
    const forgotPasswordToken = await this.generateForgotPasswordLink(user);
    console.log('forgotPassToken', forgotPasswordToken);
    const resetPasswordUrl =
      this.configService.get<string>('ADMIN_CLIENT_SIDE_URI') +
      `/reset-password?verify=${forgotPasswordToken}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your Password!',
      template: './forgot-password',
      name: user.name,
      activationCode: resetPasswordUrl,
    });

    return {
      message: `Your forgot password request succesful,please check your e-mail for a reset link!`,
    };
  }

  // reset password
  async resetPassword(resetPasswordDto: AdminResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new BadRequestException('Invalid token!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.amdinUser.update({
      where: {
        id: decoded.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { user };
  }

  // get logged in user
  async getLoggedInUser(req: any) {
    // console.log("LoggedUser&&Req", req)
    const user = req.user;
    // refreshToken,
    // const refreshToken = req.refreshtoken;
    // const accessToken = req.accesstoken;
    //accessToken
    //console.log("Access_TOKEN,", accessToken)
    return { user };
  }

  // log out Admin-User
  async LogoutAdmin(req: any) {
    req.user = null;
    req.refreshtoken = null;
    req.accesstoken = null;
    return { message: 'Logged out successfully!' };
  }

  // get all users service
  async getUsers() {
    return this.prisma.amdinUser.findMany({});
  }

  /*****
   * RE-USABLE FUNCTIONS FOR USER AUTHENTICATIONS
   *
   */

  // compare with hashed password
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // generate forgot password link
  async generateForgotPasswordLink(user: AmdinUser) {
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
