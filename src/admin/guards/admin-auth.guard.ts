import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Next,
  UnauthorizedException,
} from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    // const gqlContext = GqlExecutionContext.create(context);
    const req = context.switchToHttp().getRequest();
    // const { req } = gqlContext.getContext();
    // console.log('RequestHeaders|', req.headers);
    const accessToken = req.headers.accesstoken as string;
    // const refreshToken = req.headers.refreshtoken as string;

    // if (!accessToken || !refreshToken) {
    //   throw new UnauthorizedException('Please login to access this resource!');
    // }

    if (!accessToken ) {
      throw new UnauthorizedException('Please login to access this resource!');
    }

    if (accessToken) {
      // const decoded = this.jwtService.decode(accessToken);
      // console.log('DecodedToken', decoded);
      // const expirationTime = decoded?.exp;

      // if (expirationTime * 1000 < Date.now()) {
      //   await this.updateAccessToken(req);
      // } else {
      //   try {
      //     const payload = await this.jwtService.verifyAsync(accessToken, {
      //       secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      //     });
      //     console.log('VerifiedUser', payload);
      //     req['user'] = payload;
      //   } catch {
      //     throw new UnauthorizedException();
      //   }
      // }

      try {
        const payload = await this.jwtService.verifyAsync(accessToken, {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'), 
        });
        console.log('VerifiedUser', payload);
        const user = await this.prisma.amdinUser.findUnique({
          where: {
            id: payload.id,
          },
        });

        console.log('VerifiedUser_DATA', user);
        req.accesstoken = accessToken;
        req.user = user;
      } catch {
        throw new UnauthorizedException('Unauthorized. Please login to access this resource!');
      }

    }

    return true;
  }

  private async updateAccessToken(context: ExecutionContext): Promise<void> {
    console.log('RefreshTokenCalled....');
    const req = context.switchToHttp().getRequest();
    try {
      const refreshTokenData = req.headers.refreshtoken as string;

      const decoded = this.jwtService.decode(refreshTokenData);
      console.log('decodeRefreshToken', decoded);
      const expirationTime = decoded.exp * 1000;

      if (expirationTime < Date.now()) {
        throw new UnauthorizedException(
          'Please login to access this resource!',
        );
      }

      const user = await this.prisma.amdinUser.findUnique({
        where: {
          id: decoded.id,
        },
      });

      const accessToken = this.jwtService.sign(
        { id: user.id },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '5m',
        },
      );

      console.log('NewRefreshedAccessToken', accessToken);
      console.log('UserFromNew__AccessToken', user);

      // const refreshToken = this.jwtService.sign(
      //   { id: user.id },
      //   {
      //     secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      //     expiresIn: '7d',
      //   },
      // );

      // console.log("NewRefreshed__refreshToken", refreshToken)

      req.accesstoken = accessToken;
      // req.refreshtoken = refreshToken;
      req.user = user;
      // Next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
