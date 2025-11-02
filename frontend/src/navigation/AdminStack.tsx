import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboard';
import SettingScreen from '../screens/main/Setting';
import DocumentListScreen from '../screens/admin/AdminDashboard/DocumentListScreen';
import PdfViewerScreen from '../components/common/PdfViewer';
import CompleteProfileScreen from '../screens/auth/CompleteProfile';
import VerificationRequestsScreen from '../screens/admin/AdminDashboard/VerificationRequestsScreen';
import VerificationRequestDetail from '../screens/admin/AdminDashboard/VerificationRequestDetail';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen name="DocumentList" component={DocumentListScreen} />
      <Stack.Screen
        name="VerificationRequests"
        component={VerificationRequestsScreen}
      />
      <Stack.Screen
        name="VerificationRequestDetail"
        component={VerificationRequestDetail}
      />
      <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
}
