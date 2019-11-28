import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  Dimensions,
  Alert,
  DeviceEventEmitter,
  ActivityIndicator,
  AppState,
  RefreshControl,
} from 'react-native';

import * as Progress from 'react-native-progress';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import StudentDashboardListPortrait from './components/StudentDashboardListPortrait';
import StudentDashboardListLandscape from './components/StudentDashboardListLandscape';
import TouchableView from './components/TouchableView';
import {NavigationActions, StackActions} from 'react-navigation';
import IconOcticons from 'react-native-vector-icons/Octicons';
import IconIonicons from 'react-native-vector-icons/Ionicons';

import AwsCognito from 'react-native-aws-cognito';
import {AwsS3} from 'react-native-aws-s3';
import cloudfrontConfig from '../config/aws/cloudfront-config';

import Snackbar from 'react-native-snackbar';

import studentDashboardService from '../services/student-dashboard-service';
import realm from '../models/realm';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';
import soundService from '../services/sound-service';
import {soundKeyConstants} from '../config/soundData';
import schoolData from '../config/schoolData';
import ReachabilityService from '../services/reachability-service';
import Constants from '../Utilities/constants';
import Utility from '../Utilities/utility';

import voca from 'voca';
import unlockCourseService from '../services/unlock-course-service';
import {ReachableComponent} from './components/ReachableComponent';
import DownloadMediaService from '../services/download-media-service';
import downloadManagerService from '../services/download-manager-service';
import appLoginTasks from '../app-login';
import * as RNIap from 'react-native-iap';

import CourseCard from './components/CourseCard';

const iapItemList = Platform.select({
  ios: ['com.execusolve.hiddenchalk.algebraCourse'],
  android: ['products.com.hiddenchalk.algebra'],
});

const styles = StyleSheet.create({
  imagePickerButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginTop: 10,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#e1e1e1',
  },
  profileImage: {
    height: 76,
    width: 76,
    borderRadius: 38,
  },
});
let window = Dimensions.get('window');
const defaultProfilePhoto = require('../media/DefaultUserImage.png');

class StudentDashboard extends Component {
  constructor(props) {
    super(props);
    this.navigate = props.navigation.navigate;
    this.navigateFormListItem = 'ClassDashboard';
    this.navigationDispatch = props.navigation.dispatch;
    this.state = {
      PortraitStatus: window.height < window.width ? false : true,
      courses: [],
      loadingData: false,
      pullToRefreshLoading: false,
      userDetails: {},
      userPhoto: {
        uriSource: defaultProfilePhoto,
      },
      studentInfo: {
        coursesEnrolled: 0,
        coursesInProgress: 0,
        coursesCompleted: 0,
      },
      downloadStatus: {},
      updateKey: 0,
      appState: AppState.currentState,
      downloadData: [],
      selectedCourse: null,
      showDetailView: false,
    };
  }

  static leftHeader() {
    return (
      <TouchableView
        style={{flexDirection: 'row'}}
        onPress={() => {
          let {handleDownload} = StudentDashboard;
          handleDownload && handleDownload();
        }}>
        <IconEntypo
          style={{paddingHorizontal: 8, fontSize: 25}}
          name="download"
          color="#444"
        />
      </TouchableView>
    );
  }

  static rightHeader() {
    return (
      <TouchableView
        style={{flexDirection: 'row'}}
        onPress={() => {
          let {handleLogout} = StudentDashboard;
          handleLogout && handleLogout();
        }}>
        <IconMaterial
          style={{paddingHorizontal: 8, fontSize: 25}}
          name="logout"
          color="#444"
        />
      </TouchableView>
    );
  }

  componentWillMount() {
    appLoginTasks();
    AppState.addEventListener('change', this._handleAppStateChange);
    this.setState({loadingData: true});
    this.getCurrentUserDetails()
      .then(this.updateStudentCourses.bind(this))
      .then(this.fetchDataAndSetState.bind(this))
      .then(this.registerRefreshListener.bind(this))
      .catch(err => {
        Alert.alert('Alert', 'Error on reading course data.  ' + err.message);
      })
      .finally(() => this.setState({loadingData: false}));
    StudentDashboard.handleLogout = this.onLogoutPressed.bind(this);
    StudentDashboard.handleDownload = this.onDownloadsButtonPress.bind(this);
    Analytics.setScreenName(
      AnalyticsConstants.screens.STUDENT_DASHBOARD_SCREEN.name,
    );
  }

  fetchInAppPurchases = () => {};

  componentDidMount() {
    console.log('Helelo');
    this.initIAP();
  }

  initIAP = () => {
    try {
      RNIap.initConnection().then(result => {
        RNIap.clearTransactionIOS();
        console.log('result', result);
        this.initIAPListeners();
      });
    } catch (err) {
      console.warn('err.code', err.message);
    }
  };
  initIAPListeners = () => {
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(purchase => {
      console.log('purchaseUpdatedListener', purchase);
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        const {userDetails} = this.state;
        console.log('Inisde L::::', userDetails);
        networkServices
          .postAddUserToCourse(userDetails.email, course.id, receipt)
          .then(res => res.json())
          .then(res => {
            console.log('Inisde L::::RES', res);
            if (res.status === '200') {
              if (Platform.OS === 'ios') {
                RNIap.finishTransactionIOS(purchase.transactionId);
              } else if (Platform.OS === 'android') {
                // If consumable (can be purchased again)
                RNIap.consumePurchaseAndroid(purchase.purchaseToken);
                // If not consumable
                RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
              }
            } else {
              // Retry / conclude the purchase is fraudulent, etc...
              console.log('Purchase error:: error adding user to the db');
            }
          });
        purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
          console.log('purchaseErrorListener', error);
          Alert.alert('purchase error', JSON.stringify(error));
        });
      }
    });
  };

  handlePayment = () => {
    RNIap.getProducts(iapItemList).then(availableProduct => {
      console.log('Available products ::::', availableProduct);
      if (availableProduct.length > 0) {
        RNIap.requestPurchase(availableProduct[0]);
      }
    });
  };

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
  }

  processPayment = paymentResponse => {
    console.log('Payment Received :::', paymentResponse);
    //show Loading
    this.handlePayment();

    //api call to add name to the Hc table

    //refresh the data
    this.refreshData();
  };
  refreshData() {
    this.setState({pullToRefreshLoading: true});
    this.getCurrentUserDetails()
      .then(this.updateStudentCourses.bind(this))
      .then(this.fetchDataAndSetState.bind(this))
      .then(this.registerRefreshListener.bind(this))
      .catch(err => {
        Alert.alert('Alert', 'Error on reading course data.  ' + err.message);
      })
      .finally(() =>
        this.setState({
          pullToRefreshLoading: false,
          updateKey: this.state.updateKey + 1,
        }),
      );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    this.state.backListener && this.state.backListener.remove();
    DeviceEventEmitter.emit('backPress');
    StudentDashboard.handleLogout = null;
    StudentDashboard.handleDownload = null;
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      downloadManagerService.killDownloadManager();
      appLoginTasks();
    }

    this.setState({appState: nextAppState});
  };

  registerRefreshListener() {
    let backListener = DeviceEventEmitter.addListener('backPress', () => {
      this.fetchDataAndSetState(this.state);
    });
    this.setState({backListener});
  }

  fetchDataAndSetState(state) {
    return this.fetchData(state).then(state => this.setState(state));
  }

  fetchData(state) {
    return this.getCourses(state).then(this.getStudentInfo.bind(this));
  }

  getCourses(state) {
    return studentDashboardService
      .getCombinedCoursesAsync(state.userDetails.username)
      .then(courses => ({...state, courses}));
  }

  getStudentInfo(state) {
    return studentDashboardService
      .getStudentInfo(state.userDetails.username)
      .then(studentInfo => ({...state, studentInfo}));
  }

  updateStudentCourses(state) {
    return studentDashboardService
      .updateStudentCourses(state.userDetails.username, true)
      .then(() => state);
  }

  saveUserDetailState(userDetails) {
    Utility.saveState(
      Constants.stateKeys.USERDETAILS,
      JSON.stringify(userDetails),
    ).then(() => console.log('UserDetails Saved'));
  }

  getUserDetailState() {
    console.log('Get USer ofline details');
    return Utility.getState(Constants.stateKeys.USERDETAILS);
  }

  getUserDetailsAsync() {
    console.log('Get USer  details');
    return new Promise((resolve, reject) => {
      ReachabilityService.checkNetworkConnection().then(status => {
        if (status) {
          AwsCognito.getCurrentUserDetailsAsync().then(res => resolve(res));
        } else {
          this.getUserDetailState()
            .then(res => {
              return JSON.parse(res);
            })
            .then(res => resolve(res));
        }
      });
    });
  }

  getCurrentUserDetails() {
    return new Promise((resolve, reject) => {
      this.getUserDetailsAsync()
        .then(details => {
          let username = details['username'];
          let userAttributes = details['userAttributes'];
          let firstName = userAttributes['given_name'];
          let lastName = userAttributes['family_name'];
          let schoolId = userAttributes['custom:school_id'];
          let imageId = userAttributes['custom:profile_image_id'];
          let email = userAttributes['email'];
          let schoolName = schoolData.filter(school => {
            return school.id == schoolId;
          })[0].name;
          this.saveUserDetailState(details);
          resolve({
            userDetails: {
              username,
              firstName,
              lastName,
              schoolName,
              email,
            },
            userPhoto: {
              uriSource: {
                uri: `${cloudfrontConfig.profileImageBase}/${imageId}`,
              },
            },
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static navigationOptions = {
    title: 'Dashboard',
    headerRight: StudentDashboard.rightHeader(),
    headerLeft: StudentDashboard.leftHeader(),
    headerStyle: {
      backgroundColor: '#F1F1F1',
    },
    headerTintColor: '#555',
  };

  resetAndShowHome = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: 'Auth'})],
  });

  logoutAndNavigatetoHome(navOption) {
    AwsCognito.signOutCurrentUserAsync()
      .then(res => {
        console.log('AWS-Logout success', res);
        Snackbar.show({
          title: 'Logout Successful',
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
        this.navigationDispatch(navOption);
      })
      .then(res => {
        Analytics.logEvent(AnalyticsConstants.events.LOGOUT.name, {});
        //Reset usersession keys
        Utility.removeState(Constants.stateKeys.ACCESSTOKEN).then(() =>
          console.log('Logout Success cleared State'),
        );
      })
      .catch(error => {
        console.log('AWS-Logout Failure:', error);
        Snackbar.show({
          title: 'Unable to Logout. Try Again!',
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
      });
  }

  onLogoutPressed() {
    Alert.alert('Logout', 'Do you wish to Logout ?', [
      {
        text: 'Yes',
        onPress: () => {
          soundService.playSound(soundKeyConstants.USER_LOGOUT_SOUND);
          this.logoutAndNavigatetoHome(this.resetAndShowHome);
        },
      },
      {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
    ]);
  }

  onDownloadsButtonPress() {
    this.navigate('DownloadScreen');
  }

  getNewDimensions(event) {
    if (Dimensions.get('window').height < Dimensions.get('window').width) {
      this.setState({PotraitStatus: false});
    } else {
      this.setState({PotraitStatus: true});
    }
  }

  onListItemPress(course) {
    if (!course.isFree) {
      this.handlePayment();
      return;
    }
    this.closeCourseCard();
    Analytics.logEvent(AnalyticsConstants.events.COURSE_CLICK.name, {
      course_name: course.name,
      course_id: course.id,
    });
    this.navigateToClassDashboard(course);
  }

  navigateToClassDashboard(course) {
    this.navigate(this.navigateFormListItem, {courseId: course.id});
  }

  onDownloadCoursePress(course) {
    return ReachabilityService.checkNetworkConnection().then(isConnected => {
      return new Promise((resolve, reject) => {
        if (isConnected) {
          Alert.alert(
            'Download this Course for offline viewing?',
            '(This download is large. To avoid potential delays or extra data usage charges, use WiFi only.)',
            [
              {
                text: 'Yes',
                onPress: () => {
                  DownloadMediaService.getMediaListForCourse(course.id);
                  Snackbar.show({
                    title: 'Download Initalizing',
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: '#2195f3',
                    action: {
                      title: 'DISMISS',
                      onPress: () => {
                        console.log('Dismiss Pressed');
                      },
                      color: 'white',
                    },
                  });
                  resolve(true);
                },
              },
              {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
            ],
          );
          return;
        }
        Alert.alert(
          'No Connectivity',
          'Device is currently offline please connect to Internet to download course media.',
          [
            {
              text: 'Ok',
              onPress: () => {
                console.log('Pressed Ok ');
                resolve(false);
              },
            },
          ],
        );
      });
    });
  }

  getNoOfCoursesEnrolled() {
    return this.state.courses.length;
  }

  getNoOfCoursesInProgress() {
    return this.state.studentInfo.coursesInProgress || 0;
  }

  getNoOfCoursesCompleted() {
    return this.state.studentInfo.coursesCompleted || 0;
  }

  getProgress(course) {
    let totalModules = course.studentCourse.totalModules;
    if (totalModules === 0) return 0;
    return course.studentCourse.completedModules / totalModules;
  }

  getCoursesCompletionPercent() {
    let totalModules = 0;
    let totalCompletedModules = 0;
    let totalCourses =
      this.getNoOfCoursesCompleted() + this.getNoOfCoursesInProgress();
    this.state.courses.map(course => {
      totalModules =
        totalModules + course.studentCourse.totalModules
          ? course.studentCourse.totalModules
          : 0;
      totalCompletedModules =
        totalCompletedModules + course.studentCourse.completedModules
          ? course.studentCourse.completedModules
          : 0;
    });
    let completionPercent =
      totalCourses !== 0 ? totalCompletedModules / totalModules : 0;
    completionPercent = completionPercent * 100;
    return Math.round(completionPercent);
  }

  getCourseCount() {
    return this.state.courses.length;
  }

  getNoAvailableCoursesView() {
    return (
      <View
        style={{
          opacity: 0.6,
          backgroundColor: '#FAFAFA',
          marginHorizontal: 15,
          marginBottom: 15,
          borderColor: '#DDD',
          borderRadius: 5,
          borderWidth: 1,
          shadowColor: '#DDD',
          shadowOpacity: 0.8,
          shadowRadius: 2,
          shadowOffset: {height: 1, width: 0},
          elevation: 1,
        }}>
        <View style={{paddingVertical: 80, paddingHorizontal: 10}}>
          <Text style={[{flex: 1, alignItems: 'center', textAlign: 'center'}]}>
            <Text style={{fontSize: 22}}>No Courses Found!</Text>
            {'\n'}
            {'\n'}
            Pull down to refresh{'\n'}
            or{'\n'}
            Please contact your School Representative for assistance.{'\n'}
            You are currently logged in as{' '}
            <Text style={{fontWeight: '800'}}>
              {this.state.userDetails.email}
            </Text>
          </Text>
        </View>
      </View>
    );
  }

  courseDownloadStatus(courseId) {
    if (this.state.downloadStatus && this.state.downloadStatus[courseId]) {
      return this.state.downloadStatus[courseId];
    }
    return 'Not Started';
  }

  renderPriceTag() {
    return (
      <View
        style={{
          position: 'absolute',
          right: 0,
          backgroundColor: 'transparent',
          padding: 5,
        }}>
        <View
          style={{
            padding: 4,
            backgroundColor: '#fff',
            borderRadius: 25,
            borderWidth: 1,
            borderColor: 'green',
            flexDirection: 'row',
          }}>
          <Text style={{textDecorationLine: 'line-through'}}>$19.99</Text>
          <Text
            style={{
              color: 'green',
              fontWeight: '800',
              paddingHorizontal: 2,
            }}>
            $14.99
          </Text>
        </View>
      </View>
    );
  }

  renderDownloadButton(course) {
    const downloadStatus = this.courseDownloadStatus(course.id);
    let onPress = () => {};
    let downloadView = () => {};

    switch (downloadStatus) {
      case 'Not Started':
        onPress = () => {
          return this.onDownloadCoursePress(course).then(isDownloading => {
            if (isDownloading) {
              const {downloadStatus, updateKey} = this.state;
              const newDownloadStatus = {...downloadStatus};
              newDownloadStatus[course.id] = 'In Progress';
              this.setState({
                downloadStatus: newDownloadStatus,
                updateKey: updateKey + 1,
              });
            }
          });
        };
        downloadView = () => (
          <IconOcticons name="cloud-download" size={27} color="#1d88ab" />
        );
        break;
      case 'In Progress':
        onPress = () => {
          this.onDownloadsButtonPress();
        };
        downloadView = () => (
          <View>
            <Progress.Circle
              thickness={2}
              size={35}
              borderWidth={1}
              progress={1}
              color={'#1d88ab'}
              showsText
              formatText={progress => (
                <IconIonicons name="md-download" size={15} color="#1d88ab" />
              )}
            />

            {/* <Progress.Circle
              size={35}
              thickness={2}
              showsText
              color={'#1d88ab'}
            /> */}
          </View>
        );
        break;
      case 'Complete':
        onPress = () => {
          this.onDownloadsButtonPress();
        };
        downloadView = () => (
          <IconMaterialNew
            style={{
              fontSize: 27,
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            name="check-circle"
            color="rgba(29, 171, 125,0.9)"
          />
        );
    }

    return (
      <View
        style={{
          position: 'absolute',
          right: 0,
          backgroundColor: '#FFFFFF7F',
          borderRadius: 35,
        }}>
        <TouchableView
          onPress={() => onPress()}
          style={{paddingVertical: 8, paddingHorizontal: 10}}
          underlayColor="rgba(255,255,255,0)">
          {downloadView()}
        </TouchableView>
      </View>
    );
  }

  showCourseCard = course => {
    this.setState({selectedCourse: course, showDetailView: true});
  };

  closeCourseCard = () => {
    console.log('Close pressed');
    this.setState({selectedCourse: null, showDetailView: false});
  };
  showCourseList() {
    if (this.state.loadingData) {
      return (
        <ActivityIndicator
          animating={this.state.loadingData}
          style={[
            {flex: 1, height: 80, alignItems: 'center', alignSelf: 'center'},
          ]}
          size="large"
        />
      );
    } else if (this.getCourseCount() > 0) {
      return this.state.PortraitStatus ? (
        <StudentDashboardListPortrait
          source={this.state.courses}
          windowWidth={window.width}
          onListItemPress={this.onListItemPress.bind(this)}
          renderDownloadButton={this.renderDownloadButton.bind(this)}
          updateKey={this.state.updateKey}
          onLearnMorePressed={this.showCourseCard}
        />
      ) : (
        <StudentDashboardListLandscape
          source={this.state.courses}
          windowWidth={window.width}
          onListItemPress={this.onListItemPress.bind(this)}
          renderDownloadButton={this.renderDownloadButton.bind(this)}
          updateKey={this.state.updateKey}
          onLearnMorePressed={this.showCourseCard}
        />
      );
    } else {
      return this.getNoAvailableCoursesView();
    }
  }

  render() {
    const {showDetailView, selectedCourse} = this.state;
    return (
      <View style={{flex: 1}}>
        <ReachableComponent width={window.width}></ReachableComponent>
        <CourseCard
          isVisible={showDetailView}
          data={selectedCourse}
          onClosePressed={this.closeCourseCard}
          renderDownloadButton={this.renderDownloadButton.bind(this)}
          onListItemPress={this.onListItemPress.bind(this)}
        />
        <ScrollView
          style={{backgroundColor: '#F1F1F1', height: '90%'}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.pullToRefreshLoading}
              onRefresh={() => {
                this.refreshData();
              }}
            />
          }>
          <View>
            <View onLayout={this.getNewDimensions.bind(this)}>
              <View style={{backgroundColor: '#1d88ab'}}>
                <View style={{flexDirection: 'row', padding: 10}}>
                  <View style={{alignItems: 'center'}}>
                    <View style={styles.imagePickerButton}>
                      <Image
                        style={styles.profileImage}
                        source={this.state.userPhoto.uriSource}
                      />
                    </View>
                  </View>
                  <View style={{paddingLeft: 15, justifyContent: 'center'}}>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 18,
                          fontWeight: '600',
                          paddingBottom: 5,
                        }}>{`${this.state.userDetails.firstName || ''} ${this
                        .state.userDetails.lastName || ''}`}</Text>
                    </View>
                    {/* <View><Text style={{ color: '#FDFDFD', fontSize: 16, fontWeight: '400' }}>{this.state.userDetails.schoolName || ''}</Text></View> */}
                  </View>
                </View>
                <View style={{flexDirection: 'row', paddingVertical: 10}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRightWidth: 1,
                      borderColor: '#FDFDFD',
                    }}>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 18,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        {this.getNoOfCoursesEnrolled()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 14,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        Enrolled
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRightWidth: 1,
                      borderColor: '#FDFDFD',
                    }}>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 18,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        {this.getNoOfCoursesInProgress()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 14,
                          fontWeight: '200',
                          paddingBottom: 5,
                          textAlign: 'center',
                        }}>
                        In Progress
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderRightWidth: 1,
                      borderColor: '#FDFDFD',
                    }}>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 18,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        {this.getNoOfCoursesCompleted()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 14,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        Completed
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 18,
                          fontWeight: '200',
                          paddingBottom: 5,
                        }}>
                        {this.getCoursesCompletionPercent()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          color: '#FDFDFD',
                          fontSize: 14,
                          fontWeight: '200',
                          paddingBottom: 5,
                          textAlign: 'center',
                        }}>
                        Completed %
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{marginTop: 15}}>{this.showCourseList()}</View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
export default StudentDashboard = StudentDashboard;
