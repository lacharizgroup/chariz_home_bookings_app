import {  User } from "@prisma/client";




export class ErrorType {
  message: string;
  code?: string;
}


export class RegisterUserResponse {
  activation_token: string;
  error?: ErrorType;
}


export class ActivationUserResponse {
  user: User | any;
  error?: ErrorType;
}


export class LoginUserResponse {
  user?: User | any;
  accessToken?: string;
  refreshToken?: string;
  error?: ErrorType;
}


export class LogoutResposne {
  message?: string;
}


export class UserForgotPasswordResponse {
  message: string;
  error?: ErrorType;
}


export class UserResetPasswordResponse {
  user: User | any;
  error?: ErrorType;
}
