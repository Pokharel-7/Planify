export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string; purpose: 'reset' | 'register' };
  ResetPassword: { email: string; otp: string };
  PasswordChanged: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  TasksTab: undefined;
  CalendarTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  ProjectsList: undefined;
  ProjectDetail: { projectId: string };
  TaskDetail: { taskId: string };
  CreateTask: { projectId?: string } | undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ConversationList: undefined;
  Chat: { conversationId: string };
  TimeTracking: undefined;
  Reports: undefined;
  Subscription: undefined;
  BillingHistory: undefined;
  TeamMembers: undefined;
  MemberProfile: { memberId: string };
  AdminDashboard: undefined;
  ManageUsers: undefined;
  Invitations: undefined;
  PaymentWebView: {
    paymentUrl: string;
    paymentRequest: import("../services/subscriptionService").EsewaPaymentRequest;
  };
  NotFound: undefined;
  ServerError: undefined;
  NetworkError: undefined;
  Maintenance: undefined;
  AccessDenied: undefined;
};

export type RootStackParamList = {
  AuthFlow: undefined;
  MainFlow: undefined;
};
