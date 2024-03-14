import { PropertyVendor } from "@prisma/client";




export class ErrorType {
  message: string;
  code?: string;
}


export class RegisterVendorResponse {
  activation_token: string;
  error?: ErrorType;
}


export class ActivationVendorResponse {
  user: PropertyVendor | any;
  error?: ErrorType;
}


export class LoginVendorResponse {
  user?: PropertyVendor | any;
  accessToken?: string;
  refreshToken?: string;
  error?: ErrorType;
}


export class LogoutResposne {
  message?: string;
}


export class VendorForgotPasswordResponse {
  message: string;
  error?: ErrorType;
}


export class VendorResetPasswordResponse {
  user: PropertyVendor | any;
  error?: ErrorType;
}
