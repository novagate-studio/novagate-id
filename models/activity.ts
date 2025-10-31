export enum UserActivityLogsType {
  Login = 'login',
  ForgotPassword = 'forgot_password',
  ResetPassword = 'reset_password',
  UpdateProfile = 'update_profile',
  UpdatePassword = 'update_password',
  UpdateEmail = 'update_email',
  UpdatePhone = 'update_phone',
}

export type UserActivity = {
  id: number;
  action: string;
  city: string;
  country: string;
  ip_address: string;
  latitude: string;
  location: string;
  longitude: string;
  user_agent: string;
  user_agent_formatted: string;
  created_at: string;
}