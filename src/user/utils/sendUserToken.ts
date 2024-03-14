import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

export class UserTokenSender {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  public sendUserToken(user: User) {
    const accessToken = this.jwt.sign(
      {
        id: user.id,
      },
      {
        secret: this.config.get<string>('VENDOR_ACCESS_TOKEN_SECRET'),
        expiresIn: '1d',
      },
    );

    // const refreshToken = this.jwt.sign(
    //   {
    //     id: user.id,
    //   },
    //   {
    //     secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
    //     expiresIn: '3d',
    //   },
    // );
    // return { user, accessToken, refreshToken };

    //refreshToken
    return { user, accessToken };
  }
}
