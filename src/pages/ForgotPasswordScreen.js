import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import AwsCognito from 'react-native-aws-cognito';
import Snackbar from 'react-native-snackbar';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

const styles = StyleSheet.create({
  scrollview: {
    backgroundColor: '#65b4ce',
    paddingHorizontal: 30,
  },
  submit: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    marginHorizontal: 24,
  },
  textbox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: '600',
    height: 50,
    color: '#595856',
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
    fontWeight: '500',
    textAlign: 'center',
    paddingBottom: 50,
  },
});
class ForgotPasswordScreen extends Component {
  static navigationOptions = {
    title: 'Forgot Password',
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
    this.state = {
      emailValidationMessage: 'Email Required.',
      showEmailValidation: true,
      submitClicked: false,
      emailText: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.initRouteParams();
    Analytics.setScreenName(
      AnalyticsConstants.screens.FORGOT_PASSWORD_SCREEN.name,
    );
  }

  initRouteParams() {
    this.routeParams = this.props.navigation.state.params || {};
    const {email} = this.routeParams;
    this.setState({emailText: email});
    this.emailValidation(email);
  }

  onEmailTextChange(text) {
    this.setState({emailText: text});
    this.emailValidation(text);
  }

  emailValidation(text) {
    if (text.length < 1) {
      this.setState({showEmailValidation: true});
      this.setState({emailValidationMessage: 'Email Required.'});
    } else if (!this.validateEmail(text)) {
      this.setState({showEmailValidation: true});
      this.setState({emailValidationMessage: 'Please enter a valid Email.'});
    } else {
      this.setState({showEmailValidation: false});
      this.setState({emailValidationMessage: ''});
    }
  }

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  onSendForgotPasswordPressed() {
    this.setState({submitClicked: true});
    if (!this.checkValidation()) {
      return;
    }
    this.sendForgotPassword();
  }

  sendForgotPassword() {
    this.setState({isLoading: true});
    AwsCognito.forgotPasswordAsync(this.state.emailText.toLowerCase())
      .then(res => {
        Snackbar.show({
          title: 'Password Recovery mail send.',
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
        this.navigate('ResetPasswordScreen', {email: this.state.emailText});
        this.setState({isLoading: false});
      })
      .catch(err => {
        let errorMessage = '';
        if (Platform.OS === 'ios')
          errorMessage =
            err.userInfo.__type === 'UserNotFoundException'
              ? 'Email not registered.'
              : 'Please try again later!';
        else if (Platform.OS === 'android')
          errorMessage =
            err.code === 'UserNotFoundException'
              ? 'Email not registered.'
              : 'Please try again later!';
        Snackbar.show({
          title: 'Error: ' + errorMessage,
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

  checkValidation() {
    if (this.state.showEmailValidation) return false;
    return true;
  }

  render() {
    const {params} = this.props.navigation.state;
    return (
      <KeyboardAwareScrollView
        style={styles.scrollview}
        contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
        <View style={{flex: 0.5, justifyContent: 'flex-end'}}>
          <Text style={styles.textLabel}>Enter your registered email.</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
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
                keyboardType="email-address"
                defaultValue={this.state.emailText}
                autoCapitalize={'none'}
                placeholderTextColor="#CDCDCD"
                autoCorrect={false}
                onChangeText={this.onEmailTextChange.bind(this)}
                onSubmitEditing={this.onSendForgotPasswordPressed.bind(this)}
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
            <Button
              label="SEND CODE"
              isLoading={this.state.isLoading}
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={this.onSendForgotPasswordPressed.bind(this)}
            />
          </Container>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default ForgotPasswordScreen = ForgotPasswordScreen;
