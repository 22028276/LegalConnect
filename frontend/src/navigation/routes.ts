import SignInScreen from '../screens/auth/SignIn';
import SignUpScreen from '../screens/auth/SignUp';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';
import ResetSuccessScreen from '../screens/auth/ResetSuccess';
import CompleteProfileScreen from '../screens/auth/CompleteProfile';
import HomeScreen from '../screens/main/Home';
import CasesScreen from '../screens/main/Cases';
import MessagesScreen from '../screens/main/Messages';
import DocumentsScreen from '../screens/main/Documents';
import TabNavigator from './TabNavigator';
import LawyerProfileScreen from '../screens/main/LawyerProfile';
import ChatDetailScreen from '../screens/main/Messages/ChatDetail';
import { CaseDetail } from '../screens/main/Cases/CaseDetail';
import BookingScreen from '../screens/main/Booking';
import SettingScreen from '../screens/main/Setting';
import PdfViewerScreen from '../components/common/PdfViewer';
import ChatbotScreen from '../screens/main/Chatbot';
import ScheduleScreen from '../screens/main/LawyerProfile/Schedule';
import LawyerRegistrationScreen from '../screens/main/LawyerRegistration';
import ResetPasswordScreen from '../screens/auth/ResetPassword';

export type StackScreenRoute = {
  name: string;
  component: React.ComponentType<any>;
  options?: any;
};

export const AuthStackNames = {
  Welcome: 'Welcome',
  SignIn: 'SignIn',
  SignUp: 'SignUp',
  ForgotPassword: 'ForgotPassword',
  VerifyCode: 'VerifyCode',
  ResetSuccess: 'ResetSuccess',
  SetNewPassword: 'SetNewPassword',
  CompleteProfile: 'CompleteProfile',
  ResetPassword: 'ResetPassword',
};

export const MainStackNames = {
  HomeTabs: 'HomeTabs',
  LawyerProfile: 'LawyerProfile',
  ChatDetail: 'ChatDetail',
  CaseDetail: 'CaseDetail',
  CompleteProfile: 'CompleteProfile',
  Cases: 'Cases',
  Messages: 'Messages',
  Documents: 'Documents',
  Booking: 'Booking',
  Setting: 'Setting',
  PdfViewer: 'PdfViewer',
  Chatbot: 'Chatbot',
  Schedule: 'Schedule',
  LawyerRegistration: 'LawyerRegistration',
};

export const HomeTabsNames = {
  Home: 'Home',
  Cases: 'Cases',
  Messages: 'Messages',
  Documents: 'Documents',
};

export const AuthStackRoutes: StackScreenRoute[] = [
  {
    name: AuthStackNames.Welcome,
    component: WelcomeScreen,
    options: { headerShown: false },
  },
  {
    name: AuthStackNames.SignIn,
    component: SignInScreen,
    options: { headerShown: false },
  },
  {
    name: AuthStackNames.SignUp,
    component: SignUpScreen,
    options: { headerShown: false },
  },
  {
    name: AuthStackNames.ForgotPassword,
    component: ForgotPasswordScreen,
    options: { headerShown: false },
  },

  {
    name: AuthStackNames.ResetSuccess,
    component: ResetSuccessScreen,
    options: { headerShown: false },
  },

  {
    name: AuthStackNames.CompleteProfile,
    component: CompleteProfileScreen,
    options: { headerShown: false },
  },
  {
    name: AuthStackNames.ResetPassword,
    component: ResetPasswordScreen,
    options: { headerShown: false },
  },
];

export const MainStackRoutes: StackScreenRoute[] = [
  {
    name: MainStackNames.HomeTabs,
    component: TabNavigator,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.LawyerProfile,
    component: LawyerProfileScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.ChatDetail,
    component: ChatDetailScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.CaseDetail,
    component: CaseDetail,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.CompleteProfile,
    component: CompleteProfileScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Cases,
    component: CasesScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Messages,
    component: MessagesScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Documents,
    component: DocumentsScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Booking,
    component: BookingScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Setting,
    component: SettingScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.PdfViewer,
    component: PdfViewerScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Chatbot,
    component: ChatbotScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.Schedule,
    component: ScheduleScreen,
    options: { headerShown: false },
  },
  {
    name: MainStackNames.LawyerRegistration,
    component: LawyerRegistrationScreen,
    options: { headerShown: false },
  },
];

export const HomeTabsRoutes: StackScreenRoute[] = [
  {
    name: HomeTabsNames.Home,
    component: HomeScreen,
    options: { headerShown: false },
  },
  {
    name: HomeTabsNames.Cases,
    component: CasesScreen,
    options: { headerShown: false },
  },
  {
    name: HomeTabsNames.Messages,
    component: MessagesScreen,
    options: { headerShown: false },
  },
  {
    name: HomeTabsNames.Documents,
    component: DocumentsScreen,
    options: { headerShown: false },
  },
];
