import { AmdinUser } from "@prisma/client";




export class ErrorType {
  message: string;
  code?: string;
}


export class RegisterResponse {
  activation_token: string;
  error?: ErrorType;
}


export class ActivationResponse {
  user: AmdinUser | any;
  error?: ErrorType;
}


export class LoginResponse {
  user?: AmdinUser | any;
  accessToken?: string;
  refreshToken?: string;
  error?: ErrorType;
}


export class LogoutResposne {
  message?: string;
}


export class ForgotPasswordResponse {
  message: string;
  error?: ErrorType;
}


export class ResetPasswordResponse {
  user: AmdinUser | any;
  error?: ErrorType;
}
