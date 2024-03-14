import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({

  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    // GraphQLModule.forRoot<ApolloFederationDriverConfig>({
    //   driver: ApolloFederationDriver,
    //   autoSchemaFile: {
    //     federation: 2,
    //   },
    // }),
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService,ConfigService, JwtService, PrismaService],
})
export class AdminModule {}
