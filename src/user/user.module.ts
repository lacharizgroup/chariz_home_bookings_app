import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ConfigService, JwtService, PrismaService],
})
export class UserModule {}
