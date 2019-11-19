/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  useEffect,
} from 'react-native';
import 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';

import {WebView} from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
const myIcon = <Icon name="rocket" size={30} color="#900" />;
import Video from 'react-native-video';
var Sound = require('react-native-sound');
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-community/async-storage';

var RNFS = require('react-native-fs');

// Enable playback in silence mode
Sound.setCategory('Playback');

class App extends Component {
  componentDidMount() {
    // do stuff while splash screen is shown
    // After having done stuff (such as async tasks) hide the splash screen
    SplashScreen.hide();

    RNFetchBlob.fetch('GET', 'http://incident.net/v8/files/mp4/13.mp4', {
      // more headers  ..
    })
      .then(res => {
        console.log('Heeloasdjnkajsfbkadsnkjbkjdbjk');
        let status = res.info().status;

        if (status == 200) {
          // the conversion is done in native code
          let base64Str = res.base64();
          // the following conversions are done in js, it's SYNC
          let text = res.text();
          let json = res.json();
        } else {
          // handle other status codes
        }
      })
      // Something went wrong:
      .catch((errorMessage, statusCode) => {
        // error handling
      });
  }
  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Header />

            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <WebView
              source={{uri: 'https://infinite.red'}}
              style={{marginTop: 20, height: 200, height: 200}}
            />
            {/* <Video
            source={{uri: 'http://incident.net/v8/files/mp4/13.mp4'}} // Can be a URL or a local file.
            // ref={ref => {
            //   this.player = ref;
            // }} // Store reference
            // onBuffer={this.onBuffer} // Callback when remote video is buffering
            // onError={this.videoError} // Callback when video cannot be loaded
            style={styles.backgroundVideo}
          /> */}

            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Step One</Text>
                <Text style={styles.sectionDescription}>
                  Edit <Text style={styles.highlight}>App.js</Text> to change
                  this screen and then come back to see your edits.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sectionContainer}
                onPress={() => {
                  Snackbar.show({
                    title: 'Hello world',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }}>
                <Text style={styles.sectionTitle}>See Your Changes</Text>
                <Text style={styles.sectionDescription}>
                  <ReloadInstructions />
                </Text>
              </TouchableOpacity>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Learn More</Text>
                <Text style={styles.sectionDescription}>
                  Read the docs to discover what to do next:
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  NetInfo.fetch().then(state => {
                    Snackbar.show({
                      title: state.type,
                      duration: Snackbar.LENGTH_SHORT,
                    });
                    console.log('Connection type', state.type);
                    console.log('Is connected?', state.isConnected);
                  });
                  // AsyncStorage.setItem('@storage_Key', 'stored valueaksbdk')
                  //   .then(AsyncStorage.getItem('@storage_Key'))
                  //   .then(() => {
                  //     Snackbar.show({
                  //       title: value,
                  //       duration: Snackbar.LENGTH_SHORT,
                  //     });
                  //   });

                  // RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
                  //   .then(result => {
                  //     console.log('GOT RESULT', result);

                  //     // stat the first file
                  //     return Promise.all([
                  //       RNFS.stat(result[0].path),
                  //       result[0].path,
                  //     ]);
                  //   })
                  //   .then(statResult => {
                  //     if (statResult[0].isFile()) {
                  //       // if we have a file, read it
                  //       return RNFS.readFile(statResult[1], 'utf8');
                  //     }

                  //     return 'no file';
                  //   })
                  //   .then(contents => {
                  //     // log the file contents
                  //     console.log(contents);
                  //     Snackbar.show({
                  //       title: 'Hello world',
                  //       duration: Snackbar.LENGTH_SHORT,
                  //     });
                  //   })

                  //   .catch(err => {
                  //     console.log(err.message, err.code);
                  //     Snackbar.show({
                  //       title: 'error',
                  //       duration: Snackbar.LENGTH_SHORT,
                  //     });
                  //   });
                }}>
                {myIcon}
              </TouchableOpacity>
              <LearnMoreLinks />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    backgroundColor: 'red',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 10,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default App;
