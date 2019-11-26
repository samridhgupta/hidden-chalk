// import React, { Component } from "react";

import './config';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Login from './pages/Login';
import AutoLogin from './pages/AutoLogin';
import SignUp from './pages/SignUp';
import SignUpConfirmation from './pages/SignUpConfirmation';
import LoginExisting from './pages/LoginExisting';
import StudentDashboard from './pages/StudentDashboard';
import ClassDashboard from './pages/ClassDashboard';
import DownloadScreen from './pages/DownloadScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import WorkPad from './pages/WorkPad';
import CourseWork from './pages/CourseWork';

const AppHomeStack = createStackNavigator(
  {
    StudentDashboard: {screen: StudentDashboard},
    ClassDashboard: {screen: ClassDashboard, title: 'ClassDashboard'},
    DownloadScreen: {screen: DownloadScreen, title: 'Downloads'},
    CourseWork: {screen: CourseWork, title: 'CourseWork'},
    WorkPad: {screen: WorkPad},
  },
  {
    initialRouteName: 'StudentDashboard',
    headerMode: 'screen',
  },
);

const AppAuthStack = createStackNavigator(
  {
    Login: {screen: Login},
    SignUp: {screen: SignUp, title: 'SignUp'},
    SignUpConfirmation: {
      screen: SignUpConfirmation,
      title: 'SignUp Confirmation',
    },
    LoginExisting: {screen: LoginExisting, title: 'Login Existing'},
    ForgotPasswordScreen: {
      screen: ForgotPasswordScreen,
      title: 'Forgot Password',
    },
    ResetPasswordScreen: {
      screen: ResetPasswordScreen,
      title: 'Reset Password',
    },
  },
  {
    initialRouteName: 'Login',
    // headerMode: "none"
  },
);

const RootNavStack = createStackNavigator(
  {
    AuthLoading: AutoLogin,
    Auth: AppAuthStack,
    App: AppHomeStack,
  },
  {
    initialRouteName: 'AuthLoading',
    headerMode: 'none',
  },
);

export default AppIndex = createAppContainer(RootNavStack);
