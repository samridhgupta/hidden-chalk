import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NavigationActions, StackActions} from 'react-navigation';
import AwsCognito from 'react-native-aws-cognito';
import Snackbar from 'react-native-snackbar';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

import bugsnag from '../config/bugsnag';
import soundService from '../services/sound-service';
import {soundKeyConstants} from '../config/soundData';
import ReachablityService from '../services/reachability-service';
import Utility from '../Utilities/utility';
import Constants from '../Utilities/constants';

// const resetAndShowStudentDashboard = StackActions.reset({
//     index: 0,
//     actions: [NavigationActions.navigate({ routeName: "StudentDashboard" })]
// });
const resetAndShowStudentDashboard = () => {
  this.props.navigation.navigate('App');
};

const styles = StyleSheet.create({
  scrollview: {
    backgroundColor: '#65b4ce',
    paddingHorizontal: 30,
  },
  textboxContainer: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 5,
  },
  textboxContainerWithValidation: {
    borderWidth: 2,
    borderColor: 'rgba(194,0,0,0.6)',
    borderRadius: 5,
  },
  submit: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    marginHorizontal: 24,
  },
  submit2: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0)',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  buttonWhiteText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonBlackText: {
    fontSize: 15,
    color: '#595856',
    fontWeight: 'bold',
  },
  titleTextLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  textLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  textbox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 17,
    fontWeight: '600',
    height: 50,
    color: '#595856',
  },
});

class LoginExisting extends Component {
  static navigationOptions = {
    title: 'Login',
    headerBackTitle: null,
    headerStyle: {
      backgroundColor: '#65b4ce',
    },
    headerTintColor: 'white',
    headerTitleStyle: styles.titleTextLabel,
  };

  constructor(props) {
    super(props);
    this.navigate = props.navigation.navigate;
    this.navigationDispatch = props.navigation.dispatch;
    this.state = {
      emailValidationMessage: 'Email Required.',
      showEmailValidation: true,
      passwordValidationMessage: 'Password Required.',
      showPasswordValidation: true,
      emailText: '',
      passwordText: '',
      submitClicked: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.initRouteParams();
    Analytics.setScreenName(AnalyticsConstants.screens.LOGIN_SCREEN.name);
  }

  initRouteParams() {
    if (!this.props.navigation.state.params) return;
    this.routeParams = this.props.navigation.state.params || {};
    const {email} = this.routeParams;
    this.setState({emailText: email});
    this.onChangeEmailAndValidate(email);
  }

  onChangeEmailAndValidate(text) {
    this.setState({emailText: text});
    if (text.length <= 0) {
      this.setState({showEmailValidation: true});
      this.setState({emailValidationMessage: 'Email Required.'});
    } else if (!this.validateEmail(text)) {
      this.setState({showEmailValidation: true});
      this.setState({
        emailValidationMessage: 'Please enter a valid Email.',
      });
    } else {
      this.setState({showEmailValidation: false});
      this.setState({emailValidationMessage: ''});
    }
  }

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  onChangePasswordAndValidate(text) {
    this.setState({passwordText: text});
    if (text.length <= 0) {
      this.setState({showPasswordValidation: true});
      this.setState({passwordValidationMessage: 'Password Required.'});
    } else {
      this.setState({showPasswordValidation: false});
      this.setState({passwordValidationMessage: ''});
    }
  }

  onSubmitPressed() {
    this.setState({submitClicked: true});
    if (!this.validateUserLogin()) return;
    console.log('Login clicked:::');
    this.checkConnectivityAndLogin();
  }

  checkConnectivityAndLogin() {
    ReachablityService.checkNetworkConnection().then(isConnected => {
      if (isConnected) {
        this.loginUser();
      } else {
        Snackbar.show({
          title: 'No Network Connection Available.',
          duration: 5000,
          backgroundColor: '#f44336',
          action: {
            title: 'DISMISS',
            onPress: () => {
              console.log('Dismiss Pressed');
            },
            color: 'white',
          },
        });
      }
    });
  }

  loginUser() {
    console.log('Login User');
    this.setState({isLoading: true});
    AwsCognito.getUserSessionAsync(
      this.state.emailText.toLowerCase(),
      this.state.passwordText,
    )
      .then(res => {
        AwsCognito.getCurrentUserDetailsAsync()
          .then(details => {
            // bugsnag.setUser(
            //     details.username,
            //     `${details.userAttributes.given_name} ${details.userAttributes.family_name}`,
            //     details.userAttributes.email
            // );
            Analytics.setUserId(details.username);
            Analytics.setUserProperty(
              AnalyticsConstants.userProperties.EMAIL.name,
              details.userAttributes.email,
            );
            this.checkStateforUser(details);
          })
          .then(() => {
            this.props.navigation.navigate('App');
            Analytics.logEvent(AnalyticsConstants.events.LOGIN.name, {
              login_method: 'Email Password',
              sign_up_method: 'Email Address',
            });
          });
        console.log('AWS Login success', res);
        soundService.playSound(soundKeyConstants.USER_LOGIN_SOUND);
        Snackbar.show({
          title: 'Login Successful',
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: '#2195f3',
          action: {
            title: 'DISMISS',
            onPress: () => {
              console.log('Dismiss Pressed');
            },
            color: 'white',
          },
        });
        // this.props.navigation.navigate("App");
        this.setState({isLoading: false});
      })
      .catch(error => {
        console.log('AWS Login Failure:', error);
        Snackbar.show({
          title: 'Incorrect Username or Password.',
          duration: 5000,
          backgroundColor: '#f44336',
          action: {
            title: 'DISMISS',
            onPress: () => {
              console.log('Dismiss Pressed');
            },
            color: 'white',
          },
        });
        this.setState({isLoading: false});
      });
  }

  checkStateforUser(oldUserDetails) {
    Utility.getState(Constants.stateKeys.USERDETAILS).then(newUserDetails => {
      if (newUserDetails != oldUserDetails) {
        Utility.resetState().then(() => {
          console.log('Reset States Data for new User');
        });
      }
    });
  }

  validateUserLogin() {
    if (this.state.showEmailValidation || this.state.showPasswordValidation)
      return false;
    return true;
  }

  onForgotPasswordButtonPress() {
    this.navigate('ForgotPasswordScreen', {email: this.state.emailText});
  }

  render() {
    return (
      <KeyboardAwareScrollView
        style={styles.scrollview}
        contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
        <View>
          <Text style={styles.textLabel}>
            Login with your registered email and password.
          </Text>
          <Container>
            <View
              style={
                this.state.showEmailValidation && this.state.submitClicked
                  ? styles.textboxContainerWithValidation
                  : styles.textboxContainer
              }>
              <TextInput
                style={styles.textbox}
                underlineColorAndroid="transparent"
                placeholder="Email"
                placeholderTextColor="#CDCDCD"
                keyboardType="email-address"
                defaultValue={this.state.emailText}
                autoCapitalize={'none'}
                autoCorrect={false}
                returnKeyType={'next'}
                onChangeText={this.onChangeEmailAndValidate.bind(this)}
                onSubmitEditing={() => {
                  this.refs.passwordInput.focus();
                }}
              />
            </View>
            {this.state.showEmailValidation && this.state.submitClicked && (
              <View style={{flexDirection: 'row'}}>
                <IconMaterial
                  style={{paddingTop: 5, fontSize: 18}}
                  name="error"
                  color="rgba(194,0,0,0.6)"
                />
                <Text
                  style={{
                    color: 'rgba(194,0,0,0.6)',
                    paddingTop: 5,
                    paddingLeft: 3,
                    flex: 1,
                    fontWeight: '500',
                  }}>
                  {this.state.emailValidationMessage}
                </Text>
              </View>
            )}
          </Container>
          <Container>
            <View
              style={
                this.state.showPasswordValidation && this.state.submitClicked
                  ? styles.textboxContainerWithValidation
                  : styles.textboxContainer
              }>
              <TextInput
                secureTextEntry={true}
                underlineColorAndroid="transparent"
                ref="passwordInput"
                style={styles.textbox}
                placeholder="Password"
                placeholderTextColor="#CDCDCD"
                onChangeText={this.onChangePasswordAndValidate.bind(this)}
                onSubmitEditing={this.onSubmitPressed.bind(this)}
              />
            </View>
            {this.state.showPasswordValidation && this.state.submitClicked && (
              <View style={{flexDirection: 'row'}}>
                <IconMaterial
                  style={{paddingTop: 5, fontSize: 18}}
                  name="error"
                  color="rgba(194,0,0,0.6)"
                />
                <Text
                  style={{
                    color: 'rgba(194,0,0,0.6)',
                    paddingTop: 5,
                    paddingLeft: 3,
                    flex: 1,
                    fontWeight: '500',
                  }}>
                  {this.state.passwordValidationMessage}
                </Text>
              </View>
            )}
          </Container>
          <Container>
            <Button
              label="LOGIN"
              isLoading={this.state.isLoading}
              styles={{
                button: styles.submit,
                label: styles.buttonBlackText,
              }}
              onPress={this.onSubmitPressed.bind(this)}
            />
            <Button
              label="Forgot Password?"
              underlayColor={'transparent'}
              styles={{
                button: styles.submit2,
                label: styles.buttonWhiteText,
              }}
              onPress={this.onForgotPasswordButtonPress.bind(this)}
            />
          </Container>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default LoginExisting = LoginExisting;
