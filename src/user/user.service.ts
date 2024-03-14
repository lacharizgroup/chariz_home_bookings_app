import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UserActivationDto,
  UserForgotPasswordDto,
  UserLoginDto,
  UserResetPasswordDto,
} from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';
import { UserTokenSender } from './utils/sendUserToken';
import { User } from '@prisma/client';

interface userData {
  name: string;
  email: string;
  password: string;
  // phone_number: number;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  /*******===================================*****
   * Services from Property Vendors Service
   *********=======================================***/

  // register user service
  async registerUser(registerDto: CreateUserDto) {
    // response: Response
    //phone_number
    const { name, email, password } = registerDto;

    const isEmailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    // if (isEmailExist.isFirstSettingAdmin) {
    //   throw new BadRequestException('Only one super-admin can be created!');
    // }
    if (isEmailExist) {
      throw new BadRequestException('A user already exist with this email!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      // phone_number,
    };

    const activationToken = await this.createUserActivationToken(user);

    const activationCode = activationToken.activationCode;

    const activation_token = activationToken.token;
    const isSentMail = 
    await this.emailService
      .sendMail({
        email,
        subject: 'Activate your account!',
        template: './user-activation-mail',
        name,
        activationCode,
      })

      .then((response) => {
        console.log('Mail sent at this point' + response);
        console.log('codeSent_IN_MAIL', activation_token)
        return { activation_token, message:'A mail has been sent to your e-mail with an activation code to activate your account' };
      })
      .catch((error) => {
        console.log('MailError', error);
        throw new BadRequestException(error);
        
      });

    // await client.sendMail({
    //   email,
    //   subject: 'Activate your account!',
    //   template: './activation-mail',
    //   name,
    //   activationCode,
    // });
    //response

    // return { activation_token , message:'A mail has been sent to your e-mail with an activation code to activate your account'};
    if (isSentMail) {
      return { activation_token , message:'A mail has been sent to your e-mail with an activation code to activate your account'};
    } else {
      throw new BadRequestException(
        'There was an error sending an activation mail for this registration!',
      );
    }
    // return { activation_token };
  }

  // create activation token
  async createUserActivationToken(user: userData) {
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
  async activateUser(activationDto: UserActivationDto) {
    //, response: Response
    const { activationToken, activationCode } = activationDto;

    try {
      const newUser: { user: userData; activationCode: string } =
        this.jwtService.verify(activationToken, {
          secret: this.configService.get<string>('ACTIVATION_SECRET'),
        } as JwtVerifyOptions) as { user: userData; activationCode: string };

      if (!newUser) {
        throw new BadRequestException('token expired');
      }

      if (newUser.activationCode !== activationCode) {
        throw new BadRequestException('Invalid activation code');
      }
      //phone_number
      const { name, email, password } = newUser.user;

      const existUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existUser) {
        throw new BadRequestException('User already exist with this email!');
      }

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          hashedPassword: password,
          //  phone_number,
        },
      });
      //, response
      return { user, message:'Account activated, please you can login now' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Login service
  async LoginUser(loginDto: UserLoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials!');
    }

    if (
      user &&
      (await this.compareUserPassword(password, user.hashedPassword))
    ) {
      const tokenSender = new UserTokenSender(
        this.configService,
        this.jwtService,
      );
      return tokenSender.sendUserToken(user);
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
  async forgotUserPassword(forgotPasswordDto: UserForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exist!');
    }
    const forgotPasswordToken = await this.generateUserForgotPasswordLink(user);
    console.log('forgotPassToken', forgotPasswordToken);
    const resetPasswordUrl =
      this.configService.get<string>('CLIENT_SIDE_URI') +
      `/reset-password?verify=${forgotPasswordToken}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your Password!',
      template: './user-forgot-password',
      name: user.name,
      activationCode: resetPasswordUrl,
    });

    return {
      message: `Your forgot password request succesful,please check your e-mail for a reset link!`,
    };
  }

  // reset password
  async resetUserPassword(resetPasswordDto: UserResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decoded = await this.jwtService.decode(activationToken);

    if (!decoded || decoded?.exp * 1000 < Date.now()) {
      throw new BadRequestException('Invalid token!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.update({
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
  async LogoutUser(req: any) {
    req.user = null;
    req.refreshtoken = null;
    req.accesstoken = null;
    return { message: 'Logged out successfully!' };
  }

  // get all users service
  async getUserss() {
    return this.prisma.user.findMany({});
  }

  /*****
   * RE-USABLE FUNCTIONS FOR USER AUTHENTICATIONS
   *
   */

  // compare with hashed password
  async compareUserPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // generate forgot password link
  async generateUserForgotPasswordLink(user: User) {
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

  /**===================================================================================================================== */
  /**
   * ==============================================================================
   * @param || ALL AUTHETICATED ROUTES FOR HANDLING LISTINGS BY USERS ENGAGEMENTS STARTS HERE
   * @param req ===================================================================
   * @returns
   */
  /**===================================================================================================================== */

  /***Favorite a listing by user */
  async userFavoritedListing(listingId: string, req: any) {
    const user = req.user;

    // console.log('User=Liking-List', user)
    console.log('-List_ID', listingId);
    if (!listingId || typeof listingId !== 'string') {
      throw new BadRequestException('Invalid ID!');
    }

    let favoritedIds = [...(user?.favoritedListings || [])];
    if(favoritedIds.includes(listingId)){
      throw new BadRequestException('listing liked already!');
    }
    favoritedIds.push(listingId);

    console.log('FAVORITES', favoritedIds)
    const updatedUser = await  this.prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        favoritedListings: favoritedIds,
      },
    });

    console.log('FAVORITES_UPDATED', updatedUser)

    if (updatedUser) {
      return { updatedUser };
    }else{
      return { error: 'Something unusual happened' };
    }
  }

  /***Un-Favorite a listing by user  */
  async userFUnavoriteListing(listingId: string, req: any) {
    const user = req.user;

    if (!listingId || typeof listingId !== 'string') {
      throw new BadRequestException('Invalid ID!');
    }

    let favoritedIds = [...(user?.favoritedListings || [])];
    favoritedIds = favoritedIds.filter((id) => id !== listingId);

    console.log('poppedFAVORITED_DATA', favoritedIds)

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        favoritedListings: favoritedIds,
      },
    });

    console.log('USER-UPDATED_DATA', updatedUser)

    return { updatedUser };
  }
}
