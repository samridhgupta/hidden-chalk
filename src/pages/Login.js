import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, Image} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

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
    fontSize: 17,
    color: '#595856',
    fontWeight: 'bold',
  },
  bottomContainer: {
    flex: 0,
  },
});
class Login extends Component {
  static navigationOptions = {
    title: '',
    headerBackTitle: null,
    headerStyle: {
      backgroundColor: '#65b4ce',
    },
    headerTintColor: 'white',
  };
  constructor(props) {
    super(props);
    this.navigate = props.navigation.navigate;
  }

  componentDidMount() {
    Analytics.setScreenName(AnalyticsConstants.screens.LANDING_SCREEN.name);
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
            <Button
              label="Sign Up"
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={() => this.navigate('SignUp')}
            />
          </Container>

          <Container>
            <Button
              label="Login"
              styles={{button: styles.submit, label: styles.buttonBlackText}}
              onPress={() => this.navigate('LoginExisting')}
            />
          </Container>
        </View>
        <View style={styles.bottomContainer}></View>
      </View>
    );
  }
}
export default Login = Login;
