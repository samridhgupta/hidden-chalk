import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import AwsCognito from 'react-native-aws-cognito';
import Snackbar from 'react-native-snackbar';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#65b4ce',
  },
  bottomContainer: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
    backgroundColor: '#65b4ce',
    paddingHorizontal: 30,
    flexDirection: 'column',
  },
  submit: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: 5,
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
    marginTop: 5,
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  textLabel2: {
    marginTop: 5,
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  submit2: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0)',
    marginHorizontal: 24,
    marginTop: 10,
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
});

class SignUpConfirmation extends Component {
  static navigationOptions = {
    title: 'Confirm Your Account',
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
    this.initRouteParams();
    this.state = {
      ConfirmationCodeText: '',
      codeValidationMessage: 'Confirmation Code Required.',
      showCodeValidation: true,
      confirmCodeClicked: false,
      signupConfirmationSuccess: false,
      isWorking: false,
    };
  }

  componentDidMount() {
    Analytics.setScreenName(
      AnalyticsConstants.screens.SIGNUP_CONFIRMATION_SCREEN.name,
    );
  }

  initRouteParams() {
    this.routeParams = this.props.navigation.state.params || {};
    const {username, email} = this.routeParams;
    this.email = email;
    this.username = username;
  }

  onConfirmationCodeTextChange(text) {
    this.setState({showCodeValidation: text.length < 1});
    this.setState({ConfirmationCodeText: text});
  }

  checkValidation() {
    if (this.state.showCodeValidation) return false;
    return true;
  }

  onConfirmButtonPress() {
    this.setState({confirmCodeClicked: true});
    if (!this.checkValidation()) return;
    this.sendSignUpConfirmation();
  }

  sendSignUpConfirmation() {
    this.setState({isWorking: true});
    AwsCognito.confirmSignUpWithAliasCreateFlagAsync(
      this.username,
      this.state.ConfirmationCodeText,
      false,
    )
      .then(res => {
        Analytics.logEvent(AnalyticsConstants.events.SIGN_UP_CONFIRM.name);
        this.setState({signupConfirmationSuccess: true, isWorking: false});
      })
      .catch(err => {
        Snackbar.show({
          title: 'Confirmation Code Invalid.',
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
        this.setState({
          isWorking: false,
          confirmCodeClicked: false,
          showCodeValidation: true,
        });
      });
  }

  onResendConfirmationButtonPress() {
    this.setState({isWorking: true});
    AwsCognito.resendConfirmationCodeAsync(this.username)
      .then(res => {
        this.setState({isWorking: false});
        Snackbar.show({
          title: 'Confirmation Code Sent.',
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
      })
      .catch(err => {
        Snackbar.show({
          title: 'Resend Confirmation Failure: Please try again Later',
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
        this.setState({isWorking: false});
      });
  }

  onLoginButtonPress() {
    this.navigate('LoginExisting', {email: this.email});
  }

  ToggleSignUpConfirmationView(signupConfirmed) {
    if (signupConfirmed) {
      return (
        <View>
          <Container>
            <View
              style={{
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: 10,
              }}>
              <IconMaterial
                style={{fontSize: 50, alignSelf: 'center'}}
                name="done"
                color="#0a8300"
              />
              <View>
                <Text style={styles.textLabel2}>
                  SignUp Confirmation Successful
                </Text>
              </View>
            </View>
          </Container>
          <Container>
            <Button
              label="PROCEED TO LOGIN"
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={this.onLoginButtonPress.bind(this)}
            />
          </Container>
        </View>
      );
    } else {
      return (
        <View>
          <Container>
            <View
              style={
                this.state.showCodeValidation && this.state.confirmCodeClicked
                  ? styles.textboxContainerWithValidation
                  : styles.textboxContainer
              }>
              <TextInput
                ref={input => (this.CodeTextInput = input)}
                style={styles.textbox}
                underlineColorAndroid="transparent"
                placeholder="Enter Confirmation Code"
                placeholderTextColor="#CDCDCD"
                autoCapitalize={'none'}
                autoCorrect={false}
                onChangeText={this.onConfirmationCodeTextChange.bind(this)}
                onSubmitEditing={this.onConfirmButtonPress.bind(this)}
              />
            </View>
            {this.state.showCodeValidation && this.state.confirmCodeClicked && (
              <View style={{flexDirection: 'row'}}>
                <IconMaterial
                  style={{padding: 5, fontSize: 18}}
                  name="error"
                  color="rgba(194,0,0,0.6)"
                />
                <Text style={{color: 'rgba(194,0,0,0.6)', padding: 5, flex: 1}}>
                  {this.state.codeValidationMessage}
                </Text>
              </View>
            )}
          </Container>
          <Container>
            <Button
              label="CONFIRM ACCOUNT"
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={this.onConfirmButtonPress.bind(this)}
            />
            <Button
              label="Resend Confirmation Email"
              underlayColor={'transparent'}
              styles={{button: styles.submit2, label: styles.buttonWhiteText}}
              onPress={this.onResendConfirmationButtonPress.bind(this)}
            />
          </Container>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.scrollview}>
        <View style={styles.container}>
          <Text style={styles.textLabel}>
            We want your information to be secure in our system. An email was
            sent to {this.email} containing a Confirmation code. Please enter
            the code in the text box and confirm your account.
          </Text>
        </View>
        <View style={styles.bottomContainer}>
          {this.state.isWorking && (
            <ActivityIndicator
              animating={true}
              color="white"
              style={[
                {
                  flex: 1,
                  height: 80,
                  alignItems: 'center',
                  alignSelf: 'center',
                },
              ]}
              size="large"
            />
          )}
          {!this.state.isWorking &&
            this.ToggleSignUpConfirmationView(
              this.state.signupConfirmationSuccess,
            )}
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }
}

export default SignUpConfirmation = SignUpConfirmation;
