import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import soundService from '../services/sound-service';
import reachabilityService from '../services/reachability-service';
import analyticsConstants from '../analytics/analytics-constants';
import Constants from '../Utilities/constants';
import AwsCognito from 'react-native-aws-cognito';
import {soundKeyConstants} from '../config/soundData';
import SplashScreen from 'react-native-splash-screen';
import Snackbar from 'react-native-snackbar';
import Analytics from '../analytics';
import utility from '../Utilities/utility';

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#65b4ce',
    padding: 30,
  },
  imagecontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },
  submit: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 300,
  },
  buttonBlackText: {
    fontSize: 12,
    color: '#595856',
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 0,
  },
});
class AutoLogin extends Component {
  constructor(props) {
    super(props);
    this.navigate = props.navigation.navigate;
    this.navigationDispatch = props.navigation.dispatch;
    this.state = {
      isChecking: false,
    };
  }

  navigateToApp = () => {
    this.navigate('App');
  };

  navigateToAuth = () => {
    this.navigate('Auth');
  };

  // resetAndShowDashboard = StackActions.reset({
  //     index: 0,
  //     actions: [NavigationActions.navigate({ routeName: "StudentDashboard" })]
  // });

  componentWillMount() {
    soundService.playSound(soundKeyConstants.APP_INTRO_SOUND);
    //Register Cognito Client
    //    this.getUserSession();
  }
  componentDidMount() {
    console.log('Auto Login::::::::');
    SplashScreen.hide();
    reachabilityService.checkNetworkConnection().then(status => {
      if (status) {
        this.getUserSession();
      } else {
        this.getUserSessionState().then(token => {
          if (token != null) {
            this.setState({isChecking: false});
            Snackbar.show({
              title: 'Login Successful offline',
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
            // this.navigationDispatch(this.resetAndShowDashboard);
            this.navigateToApp();
          }
        });
      }
    });

    // SplashScreen.hide();
    // this.setState({ isChecking: false });
    Analytics.setScreenName(analyticsConstants.screens.SPLASH_SCREEN.name);
  }

  saveUserSessionState(token) {
    // const { expirationTime, refreshToken, idToken, accessToken } = userSession;
    utility.saveState(Constants.stateKeys.ACCESSTOKEN, token).then(() => {
      console.log('User Details Saved ');
    });
  }

  getUserSessionState() {
    return utility.getState(Constants.stateKeys.ACCESSTOKEN);
  }

  getUserSession() {
    console.log('GetSession  ');
    // this.setState({ isChecking: true });
    AwsCognito.getCurrentUserSessionAsync()
      .then(res => {
        const {expirationTime, refreshToken, idToken, accessToken} = res;
        console.log('GetSession Success: ', expirationTime);
        this.setState({isChecking: false});
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
        console.log('AccessToken Init Save ', res);
        this.saveUserSessionState(accessToken);
        // this.navigationDispatch(this.resetAndShowDashboard);
        this.navigateToApp();
      })
      .catch(err => {
        console.log('GetSession Error: ', err);
        // this.setState({ isChecking: false });
        this.navigateToAuth();
      });
    // setInterval(() => {
    //     if(this.state.isChecking)
    //         this.setState({ isChecking: false});
    //     }, 4000);
  }
  render() {
    return (
      <View style={styles.scrollview}>
        <View style={styles.imagecontainer}>
          <Image
            style={{maxWidth: 220, height: 150}}
            source={require('../media/HiddenChalkLogo.png')}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={{paddingTop: 20}} />
          <Container>
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
          </Container>
        </View>
        <View style={styles.bottomContainer}></View>
      </View>
    );
  }
}
export default AutoLogin = AutoLogin;
