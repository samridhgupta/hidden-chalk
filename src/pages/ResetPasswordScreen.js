import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, TextInput} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AwsCognito from 'react-native-aws-cognito';
import * as Progress from 'react-native-progress';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Snackbar from 'react-native-snackbar';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

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
    paddingTop: 20,
    paddingBottom: 20,
  },
  textLabelEmail: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    paddingBottom: 7,
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
});
class ResetPasswordScreen extends Component {
  static navigationOptions = {
    title: 'Reset Password',
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
      codeValidationMessage: 'Reset Code Required.',
      showCodeValidation: true,
      passwordValidationMessage: 'Password Required.',
      showPasswordValidation: true,
      confirmPasswordValidationMessage: 'Confirm Password Required.',
      showConfirmPasswordValidation: true,
      submitClicked: false,
      isLoading: false,
      emailText: '',
      ResetCode: '',
      newPassword: '',
    };
  }
  componentWillMount() {
    this.initRouteParams();
  }

  componentDidMount() {
    Analytics.setScreenName(
      AnalyticsConstants.screens.RESET_PASSWORD_SCREEN.name,
    );
  }

  initRouteParams() {
    this.routeParams = this.props.navigation.state.params || {};
    const {email} = this.routeParams;
    this.setState({emailText: email});
  }

  validateCode(text) {
    this.setState({ResetCode: text});
    if (text.length < 1) {
      this.setState({showCodeValidation: true});
      this.setState({codeValidationMessage: 'Reset Code Required.'});
    }
    // if (text.length < 8) {
    //   this.setState({ showCodeValidation: true });
    //   this.setState({ passwordValidationMessage: "Please enter valid Password with atleast 8 characters." });
    // }
    else {
      this.setState({showCodeValidation: false});
      this.setState({codeValidationMessage: ''});
    }
  }
  validatePassword(text) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()]{8,}$/;
    this.setState({newPassword: text});
    if (text.length < 1) {
      this.setState({showPasswordValidation: true});
      this.setState({passwordValidationMessage: 'Password Required.'});
    }
    if (text.length < 8) {
      this.setState({showPasswordValidation: true});
      this.setState({
        passwordValidationMessage:
          'Password should contain atleast 8 characters.',
      });
    }
    if (!re.test(text)) {
      this.setState({showPasswordValidation: true});
      this.setState({
        passwordValidationMessage:
          'Password should include at least 1 Uppercase Letter, 1 Lowercase Letter and 1 Number.',
      });
    } else {
      this.setState({showPasswordValidation: false});
      this.setState({passwordValidationMessage: ''});
    }
  }

  validateConfirmPassword(text) {
    if (text.length < 1) {
      this.setState({showConfirmPasswordValidation: true});
      this.setState({
        confirmPasswordValidationMessage: 'Confirm Password Required.',
      });
    }
    if (text !== this.state.newPassword) {
      this.setState({showConfirmPasswordValidation: true});
      this.setState({
        confirmPasswordValidationMessage: "Passwords don't match.",
      });
    } else {
      this.setState({showConfirmPasswordValidation: false});
      this.setState({confirmPasswordValidationMessage: ''});
    }
  }

  onSubmitPressed() {
    this.setState({submitClicked: true});
    if (!this.checkValidation()) return;
    this.sendResetPassword();
  }

  sendResetPassword() {
    this.setState({isLoading: true});
    AwsCognito.confirmForgotPasswordAsync(
      this.state.emailText.toLowerCase(),
      this.state.ResetCode,
      this.state.newPassword,
    )
      .then(res => {
        Snackbar.show({
          title: 'Password Successfully Changed.',
          duration: 5000,
          backgroundColor: '#2195f3',
          action: {
            color: 'white',
            title: 'DISMISS',
            onPress: () => {
              console.log('Dismiss Pressed');
            },
          },
        });
        this.navigate('LoginExisting');
        this.setState({isLoading: false});
      })
      .catch(err => {
        Snackbar.show({
          title: 'Error Please try again Later',
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
    if (
      this.state.showCodeValidation ||
      this.state.showPasswordValidation ||
      this.state.showConfirmPasswordValidation
    )
      return false;
    return true;
  }

  render() {
    const {params} = this.props.navigation.state;
    return (
      <KeyboardAwareScrollView
        style={styles.scrollview}
        contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
        <View>
          <Text style={styles.textLabel}>
            Please enter Reset Code and New Password.
          </Text>
        </View>
        <View>
          <Container>
            <Text style={styles.textLabelEmail}>
              For user:{' '}
              <Text style={{fontSize: 18}}>{this.state.emailText}</Text>
            </Text>
            <View
              style={
                this.state.showCodeValidation && this.state.submitClicked
                  ? styles.textboxContainerWithValidation
                  : styles.textboxContainer
              }>
              <TextInput
                style={styles.textbox}
                underlineColorAndroid="transparent"
                placeholder="Reset Code"
                autoCorrect={false}
                placeholderTextColor="#CDCDCD"
                onChangeText={this.validateCode.bind(this)}
                autoFocus={true}
                returnKeyType={'next'}
                onSubmitEditing={event => {
                  this.refs.newPasswordInput.focus();
                }}
              />
            </View>
            {this.state.showCodeValidation && this.state.submitClicked && (
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
                  {this.state.codeValidationMessage}
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
                style={styles.textbox}
                ref="newPasswordInput"
                placeholder="New Password"
                placeholderTextColor="#CDCDCD"
                returnKeyType={'next'}
                onChangeText={this.validatePassword.bind(this)}
                onSubmitEditing={event => {
                  this.refs.confirmPasswordInput.focus();
                }}
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
            <View
              style={
                this.state.showConfirmPasswordValidation &&
                this.state.submitClicked
                  ? styles.textboxContainerWithValidation
                  : styles.textboxContainer
              }>
              <TextInput
                secureTextEntry={true}
                underlineColorAndroid="transparent"
                style={styles.textbox}
                ref="confirmPasswordInput"
                placeholder="Confirm Password"
                placeholderTextColor="#CDCDCD"
                onChangeText={this.validateConfirmPassword.bind(this)}
                onSubmitEditing={this.onSubmitPressed.bind(this)}
              />
            </View>
            {this.state.showConfirmPasswordValidation &&
              this.state.submitClicked && (
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
                    {this.state.confirmPasswordValidationMessage}
                  </Text>
                </View>
              )}
          </Container>
          <Container>
            <Button
              label="RESET PASSWORD"
              isLoading={this.state.isLoading}
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={this.onSubmitPressed.bind(this)}
            />
          </Container>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

export default ResetPasswordScreen = ResetPasswordScreen;
