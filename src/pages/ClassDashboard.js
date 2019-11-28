import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  ListView,
  Dimensions,
  Alert,
  DeviceEventEmitter,
  InteractionManager,
  ActivityIndicator,
  AppState,
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import TouchableView from './components/TouchableView';
import * as Progress from 'react-native-progress';

import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconOcticons from 'react-native-vector-icons/Octicons';
import {List} from 'native-base';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';

import courseWorkService from '../services/coursework-service';
import classDashboardService from '../services/class-dashboard-service';
import unlockCourseService from '../services/unlock-course-service';
import {ReachableComponent} from './components/ReachableComponent';
import Loader from './components/Loader';
import DownloadMediaService from '../services/download-media-service';
import ReachabilityService from '../services/reachability-service';
const window = Dimensions.get('window');
import appLoginTasks from '../app-login';
import downloadManagerService from '../services/download-manager-service';
import {EventRegister} from 'react-native-event-listeners';
class ClassDashboard extends Component {
  static navigationOptions = ({navigation}) => {
    let {courseName} = navigation.state.params;
    return {
      title: courseName || '',
      headerBackTitle: null,
      headerStyle: {
        backgroundColor: '#F1F1F1',
      },
      headerTintColor: '#666',
    };
  };

  constructor(props) {
    super(props);
    this.navigate = props.navigation.navigate;
    this.footerText = 'Continue with the Course.';
    this.state = {
      course: {},
      isLoading: true,
      isPageLoading: false,
      modules: [],
      downloadProgressData: [],
      modulesListUpdateKeyCount: 0,
      appState: AppState.currentState,
      downloadData: [],
    };
  }

  componentWillMount() {
    let {courseId} = this.props.navigation.state.params;
    this.setState({isLoading: true});
    setImmediate(() => {
      this.fetchDashboardData(courseId)
        .then(() => this.downloadProgress(courseId))
        .then(() => this.setState({isLoading: false}));
    });
    this.registerRefreshListener();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  downloadProgress(courseId) {
    return DownloadMediaService.getMediaDownloadProgress(courseId)
      .then(downloads => {
        return downloads.map(course => {
          return course.modules.map(module => {
            var _mod = module;
            _mod.progress = module.downloadedMedia / module.totalMedia;
            _mod.isDownloaded = module.downloadedMedia / module.totalMedia == 1;
            _mod.isDownloading = module.downloadingMediaCount > 0;
            return _mod;
          });
        });
      })
      .then(downloadStatus => {
        console.log('Download Status::', downloadStatus);
        const {modulesListUpdateKeyCount} = this.state;
        this.setState({
          downloadProgressData: downloadStatus,
          modulesListUpdateKeyCount: modulesListUpdateKeyCount + 1,
        });
      });
  }

  componentDidMount() {
    Analytics.setScreenName(
      AnalyticsConstants.screens.CLASS_DASHBOARD_SCREEN.name,
    );

    EventRegister.addEventListener('DownloadingInprogress', data => {
      var downloadData = this.state.modules.map(module => {
        var _mod = module;
        _mod.dowloadingItems = data.filter(
          item => item.media.moduleId == _mod.id,
        );
        return _mod;
      });

      const {modulesListUpdateKeyCount} = this.state;
      this.setState({
        downloadData: downloadData,
        modulesListUpdateKeyCount: modulesListUpdateKeyCount + 1,
      });
    });

    EventRegister.addEventListener('DownloadComplete', () => {
      let {courseId} = this.props.navigation.state.params;
      Promise.resolve(this.downloadProgress(courseId));
    });
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
      this.refreshPromise = setImmediate(() => {
        let {courseId} = this.props.navigation.state.params;
        return this.fetchDashboardData(courseId);
      });
    });
    this.setState({backListener});
  }

  componentWillUnmount() {
    this.state.backListener && this.state.backListener.remove();
    clearImmediate(this.refreshPromise);
    this._interval && clearInterval(this._interval);
    DeviceEventEmitter.emit('backPress');
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  fetchDashboardData(courseId) {
    let courseStatePromise = classDashboardService
      .getCombinedCourseAsync(courseId)
      .then(course => ({course}));
    let modulesStatePromise = classDashboardService
      .getCombinedModulesAndSections(courseId)
      .then(modules => ({modules}));
    courseStatePromise.then(this.setState.bind(this));
    modulesStatePromise.then(this.setState.bind(this));
    return courseStatePromise.then(state => {
      this.props.navigation.setParams({
        courseName: state.course.name,
        courseId,
      });
      return modulesStatePromise.then(() => {
        if (state.course.studentCourse.isUnlocked) return;
        return unlockCourseService.unlockCourse(courseId);
      });
    });
  }

  navigateToCourseWork(pageId) {
    courseWorkService
      .unlockPageAndCascadeUp(pageId)
      .then(() => courseWorkService.updateSectionWithLocalPages(pageId))
      .then(() => {
        this.setState({isPageLoading: false});
        this.navigate('CourseWork', {pageId});
      });
  }

  navigateToDownloadScreen() {
    this.navigate('DownloadScreen');
  }

  openCourseWorkWithModule(module) {
    this.setState({isPageLoading: true});
    Analytics.logEvent(AnalyticsConstants.events.MODULE_CLICK.name, {
      module_name: module.name,
      module_id: module.id,
    });

    let pageId = this.getNextPageIdFromModule(module);
    if (pageId) this.navigateToCourseWork(pageId);
  }

  openCourseWorkWithSection(section) {
    this.setState({isPageLoading: true});
    Analytics.logEvent(AnalyticsConstants.events.SECTION_CLICK.name, {
      section_name: section.name,
      section_id: section.id,
    });

    let pageId = this.getNextPageIdFromSection(section);
    if (pageId) this.navigateToCourseWork(pageId);
  }

  onContinueWithCourse(course, modules) {
    this.setState({isPageLoading: true});
    Analytics.logEvent(AnalyticsConstants.events.CONTINUE_COURSE_CLICK.name, {
      course_name: course.name,
      course_id: course.id,
    });

    let pageId = this.getNextPageIdFromCourse(course, modules);
    if (pageId) this.navigateToCourseWork(pageId);
  }

  getNextPageIdFromModule(module) {
    if (!module) return;
    let {nextSection} = module.studentModule;
    let getStartSection = module => {
      return module.sections.find(
        section => section.id === module.startSectionId,
      );
    };
    return !nextSection
      ? this.getNextPageIdFromSection(getStartSection(module))
      : nextSection.nextPage.pageId;
  }

  getNextPageIdFromSection(section) {
    if (!section) return;
    let {nextPage} = section.studentSection;
    return !nextPage ? section.startPageId : nextPage.pageId;
  }

  getNextPageIdFromCourse(course, modules) {
    let {nextModule} = course.studentCourse;
    let getStartModule = (course, modules) => {
      return modules.find(module => module.id === course.startModuleId);
    };
    return !nextModule
      ? this.getNextPageIdFromModule(getStartModule(course, modules))
      : nextModule.nextSection.nextPage.pageId;
  }

  downloadCourseModule(moduleData) {
    ReachabilityService.checkNetworkConnection().then(isConnected => {
      if (isConnected) {
        Alert.alert(
          'Download this Module for offline viewing?',
          '(This download is large. To avoid potential delays or extra data usage charges, use WiFi only.)',
          [
            {
              text: 'Yes',
              onPress: () => {
                DownloadMediaService.getMediaListForModule(
                  moduleData,
                ).then(() => this.downloadProgress(this.state.course.id));
              },
            },
            {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
          ],
        );
        return;
      }
      Alert.alert(
        'No Connectivity',
        'Device is currently offline please connect to Internet to download module media.',
        [
          {
            text: 'Ok',
            onPress: () => {
              console.log('Pressed Ok ');
            },
          },
        ],
      );
    });
  }

  getCourseCompletionProgress(course) {
    let totalModules = this.getTotalModules(course);
    if (totalModules === 0) return 0;
    return this.getCompletedModules(course) / this.getTotalModules(course);
  }

  getTotalModules(course) {
    return course.studentCourse ? course.studentCourse.totalModules : 0;
  }

  getCompletedModules(course) {
    return course.studentCourse ? course.studentCourse.completedModules : 0;
  }

  getCompletedSections(module) {
    return module.studentModule ? module.studentModule.completedSections : 0;
  }

  getTotalSections(module) {
    return module.studentModule ? module.studentModule.totalSections : 0;
  }

  getCompletedPages(section) {
    return section.studentSection ? section.studentSection.completedPages : 0;
  }

  getColorFromProgress(progress) {
    return progress * 100 < 51
      ? '#ab1d1d'
      : progress * 100 < 76
      ? '#ab9a1d'
      : '#1dab7d';
  }

  shouldShowCourseProgress(course) {
    return this.getCompletedModules(course) > 0;
  }

  shouldShowContinueFooter(course) {
    return this.getCourseCompletionProgress(course) < 1;
  }

  getSectionCompletionProgress(section) {
    let totalPages = this.getTotalPages(section);
    if (totalPages === 0) return 0;
    return this.getCompletedPages(section) / totalPages;
  }

  getTotalPages(section) {
    return section.studentSection ? section.studentSection.totalPages : 0;
  }

  showSectionProgress(section) {
    let {studentSection} = section;
    if (studentSection.isCompleted) {
      return (
        <IconIonicons
          style={{
            fontSize: 22,
            paddingLeft: 5,
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          name="ios-checkmark-circle"
          color="#1dab7d"
        />
      );
    }
    return (
      <Progress.Circle
        thickness={8}
        progress={this.getSectionCompletionProgress(section)}
        size={18}
        borderWidth={1}
        color={'#1d88ab'}
        style={{paddingLeft: 2}}
      />
    );
  }

  showLoadingView() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FDFDFD',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator
          animating={true}
          color="gray"
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
      </View>
    );
  }

  moduleIsDownloaded(moduleData, rowId) {
    const {downloadProgressData} = this.state;
    var isDownloaded = false;
    if (downloadProgressData.length > 0) {
      isDownloaded = downloadProgressData[0][rowId].isDownloaded;
    }
    return isDownloaded;
  }

  moduleIsDownloading(moduleData, rowId) {
    const {downloadData} = this.state;
    var isDownloading = false;
    if (downloadData.length > 0) {
      isDownloading = downloadData[rowId].dowloadingItems.length > 0;
    }
    return isDownloading;
  }

  getModuleDownloadProgress(moduleData, rowId) {
    const {downloadProgressData} = this.state;
    if (downloadProgressData.length > 0) {
      return downloadProgressData[0][rowId].progress;
    }
    return 0;
  }

  render() {
    const {
      isLoading,
      course,
      modules,
      downloadProgressData,
      modulesListUpdateKeyCount,
    } = this.state;
    if (isLoading) return this.showLoadingView();
    return (
      <View style={{flex: 1, backgroundColor: '#FDFDFD'}}>
        <ReachableComponent width={window.width}></ReachableComponent>
        <Loader loading={this.state.isPageLoading} />
        <ScrollView>
          <View
            style={{
              flexDirection: 'column',
              padding: 20,
              alignItems: 'center',
            }}>
            <View>
              <Progress.Circle
                thickness={2}
                size={50}
                borderWidth={1}
                progress={this.getCourseCompletionProgress(course)}
                color={this.getColorFromProgress(
                  this.getCourseCompletionProgress(course),
                )}
                showsText
                formatText={progress => (
                  <Text
                    style={{
                      fontSize: 15,
                      color: this.getColorFromProgress(
                        this.getCourseCompletionProgress(course),
                      ),
                    }}>
                    {(this.getCourseCompletionProgress(course) * 100).toFixed(
                      0,
                    ) + '%'}
                  </Text>
                )}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: 15,
                alignItems: 'center',
              }}>
              <Text style={{color: '#888', fontSize: 18, fontWeight: '400'}}>
                Completed Modules: {this.getCompletedModules(course)} of{' '}
                {this.getTotalModules(course)}
              </Text>
            </View>
          </View>
          <View>
            <List
              key={modulesListUpdateKeyCount}
              dataArray={modules}
              renderRow={(data, sectionID, rowID) => (
                <TouchableView
                  style={{
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
                  }}
                  underlayColor="rgba(255,255,255,1)"
                  onPress={this.openCourseWorkWithModule.bind(this, data)}>
                  <View>
                    <View
                      style={{
                        flexDirection: 'column',
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderTopColor: '#ECECEC',
                        borderTopWidth: 1,
                        borderBottomColor: '#ECECEC',
                        backgroundColor: '#F5F5F5',
                        alignItems: 'flex-start',
                      }}>
                      <View style={{flexDirection: 'row'}}>
                        {this.moduleIsDownloading(data, rowID) ? (
                          <TouchableView
                            onPress={() => {
                              this.navigateToDownloadScreen();
                            }}>
                            <Progress.CircleSnail
                              size={35}
                              thickness={2}
                              showsText={true}
                              color={'#1d88ab'}
                            />
                            <IconIonicons
                              style={{
                                position: 'absolute',
                                justifyContent: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: 'transparent',
                              }}
                              name="md-download"
                              size={20}
                              color="#1d88ab"
                            />
                          </TouchableView>
                        ) : this.moduleIsDownloaded(data, rowID) ? (
                          <Icons
                            name="play-circle-outline"
                            size={30}
                            color="#1d88ab"
                            thickness="1"
                          />
                        ) : (
                          <Button
                            onPress={() => this.downloadCourseModule(data)}
                            styles={{button: {padding: 0}}}
                            underlayColor="rgba(255,255,255,0)">
                            <IconOcticons
                              name="cloud-download"
                              size={27}
                              color="#1d88ab"
                            />
                          </Button>
                        )}
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#888',
                            fontWeight: '200',
                            alignSelf: 'center',
                            paddingLeft: 10,
                            flex: 1,
                          }}>{`Module ${data.order}`}</Text>
                        {
                          //data.studentModule.isUnlocked ?
                          <Text
                            style={{
                              fontSize: 16,
                              color: '#1d88ab',
                              fontWeight: '200',
                              alignSelf: 'center',
                            }}>
                            {this.getCompletedSections(data)}{' '}
                            <Text style={{color: '#888'}}>/</Text>{' '}
                            {this.getTotalSections(data)}{' '}
                          </Text>
                          //      :
                          //      <View style={{ height: 20, width: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}><IconIonicons style={{ fontSize: 22, paddingLeft: 2, }} name="md-lock" color="#1d88ab" /></View>
                        }
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#888',
                          fontWeight: '600',
                          paddingTop: 5,
                        }}>
                        {data.name}
                      </Text>
                    </View>

                    <List
                      dataArray={data.sections}
                      style={{backgroundColor: '#FDFDFD'}}
                      renderRow={sec => (
                        <TouchableView
                          underlayColor="rgba(155,155,155,0.2)"
                          onPress={this.openCourseWorkWithSection.bind(
                            this,
                            sec,
                          )}>
                          <View
                            style={{
                              flex: 1,
                              paddingVertical: 8,
                              justifyContent: 'center',
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              borderBottomColor: '#eee',
                              borderBottomWidth: 1,
                            }}>
                            <View style={{flex: 0.1, alignItems: 'center'}}>
                              {this.showSectionProgress(sec)}
                            </View>
                            <Text
                              style={{
                                fontSize: 16,
                                color: '#888',
                                fontWeight: '200',
                                flex: 1,
                                paddingLeft: 8,
                                paddingRight: 2,
                                alignSelf: 'center',
                              }}>
                              {sec.name}
                            </Text>
                            <View style={{paddingLeft: 2, flex: 0.05}}>
                              <IconIonicons
                                style={{
                                  fontSize: 22,
                                  paddingLeft: 2,
                                  alignSelf: 'center',
                                  alignItems: 'flex-end',
                                }}
                                name="ios-arrow-forward"
                                color="#c7c7c7"
                              />
                            </View>
                          </View>
                        </TouchableView>
                      )}
                    />
                  </View>
                </TouchableView>
              )}
            />
          </View>
        </ScrollView>
        {this.shouldShowContinueFooter(course) ? (
          <TouchableView
            onPress={() =>
              this.onContinueWithCourse(this.state.course, this.state.modules)
            }>
            <View
              style={{
                height: window.height * 0.075,
                minHeight: 45,
                backgroundColor: '#1d88ab',
                flexDirection: 'row',
                paddingHorizontal: 20,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#DDD',
                  fontWeight: '600',
                }}>
                {this.footerText}
              </Text>

              <Icons
                name="play-circle-outline"
                style={{fontSize: 30, paddingLeft: 20}}
                color="#DDD"
              />
            </View>
          </TouchableView>
        ) : (
          <View></View>
        )}
      </View>
    );
  }
}
export default ClassDashboard = ClassDashboard;
