import React, {Component} from 'react';
import {
  View,
  Text,
  SectionList,
  Dimensions,
  ScrollView,
  Alert,
  AppState,
} from 'react-native';
import downloadScreenService from '../services/download-screen-service';
import TouchableView from './components/TouchableView';
import * as Progress from 'react-native-progress';
import IconMaterialNew from 'react-native-vector-icons/MaterialIcons';
import {ReachableComponent} from './components/ReachableComponent';
import reachabilityService from '../services/reachability-service';
import appLoginTasks from '../app-login';

const sum = key => {
  return (prev, next) => {
    return (prev += next[key]);
  };
};

const window = Dimensions.get('window');
class DownloadScreen extends Component {
  static navigationOptions = {
    title: 'Downloads',
    headerStyle: {
      backgroundColor: '#F1F1F1',
    },
    headerTintColor: '#666',
  };

  constructor(props) {
    super(props);
    this.state = {
      downloads: [],
      refreshing: false,
      PortraitStatus: window.height < window.width ? false : true,
      downloadingStatus: false,
      refreshRate: 3000,
      appState: AppState.currentState,
    };
  }

  componentWillMount() {
    this.onRefresh();
    AppState.addEventListener('change', this._handleAppStateChange);
    this._interval = setInterval(() => {
      this.onRefresh(false);
    }, this.state.refreshRate);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');

      downloadScreenService.killDownloadManager();
      appLoginTasks();
    }

    this.setState({appState: nextAppState});
  };

  sectionHeaderView({section}) {
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          borderBottomWidth: 1,
          borderTopColor: '#ECECEC',
          borderTopWidth: 1,
          borderBottomColor: '#ECECEC',
          backgroundColor: '#F5F5F5',
          paddingLeft: 10,
        }}>
        <Text
          style={{
            flex: 0.85,
            fontWeight: 'bold',
            fontSize: 25,
            alignSelf: 'center',
          }}>
          {`${section.name}`}
        </Text>

        <View
          style={{
            flex: 0.15,
            overflow: 'hidden',
            borderBottomWidth: 0,
            borderBottomColor: '#EEE',
            backgroundColor: '#F5F5F5',
            alignSelf: 'center',
          }}>
          {this.state.downloads.length > 0 ? (
            <Progress.Circle
              progress={this.getCourseDownloadProgress()}
              formatText={progress => (
                <Text
                  style={{
                    fontSize: 12,
                    color: this.getColorFromProgress(
                      this.getCourseDownloadProgress(),
                    ),
                  }}>
                  {(this.getCourseDownloadProgress() * 100).toFixed(0) + '%'}
                </Text>
              )}
              thickness={2}
              size={40}
              borderWidth={1}
              showsText={true}
              color={this.getColorFromProgress(
                this.getCourseDownloadProgress(),
              )}
            />
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }

  itemView({item}) {
    var keys = Object.keys(item);
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 64,
          backgroundColor: '#FDFDFD',
          justifyContent: 'center',
          borderBottomWidth: 2,
          borderBottomColor: '#ECECEC',
        }}>
        <View style={{flex: 0.1, justifyContent: 'center', paddingLeft: 5}}>
          <TouchableView
            onPress={() =>
              this.getCanCancelDownload(item)
                ? this.deleteModuleFromDownloading(item)
                : this.resumeModuleDownloading(item)
            }
            disabled={item.downloadedMedia / item.totalMedia == 1}>
            {item.downloadedMedia / item.totalMedia == 1 ? (
              <IconMaterialNew
                style={{
                  fontSize: 23,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                name="check-circle"
                color="rgba(29, 171, 125,0.9)"
              />
            ) : this.getCanCancelDownload(item) ? (
              <IconMaterialNew
                style={{
                  fontSize: 25,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                name="cancel"
                color={'rgba(150,150,150,0.9)'}
              />
            ) : (
              <IconMaterialNew
                style={{
                  fontSize: 25,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                name="file-download"
                color={'rgba(150,150,150,0.9)'}
              />
            )}
          </TouchableView>
        </View>
        <View style={{flex: 0.8}}>
          <Text
            style={{
              paddingTop: 10,
              paddingLeft: 5,
              fontSize: 12,
              backgroundColor: 'transparent',
            }}>
            {`Module - ${item.order}`}{' '}
            <Text
              style={{
                color: '#1d88ab',
                fontWeight: '700',
                fontSize: 13,
              }}>{` ${this.getDownloadingStatusString(item)}`}</Text>
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              backgroundColor: 'transparent',
              paddingLeft: 5,
            }}>{`${this.getTitle(item.name)}`}</Text>
          <View style={{height: 20}}>
            <View style={{flexDirection: 'row'}}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 0.9,
                  paddingTop: 5,
                  paddingBottom: 5,
                  overflow: 'hidden',
                  borderBottomWidth: 0,
                  borderBottomColor: '#EEE',
                  backgroundColor: 'transparent',
                  paddingLeft: 5,
                  paddingRight: 10,
                }}>
                <View
                  style={{
                    flex: item.downloadedMedia / item.totalMedia,
                    height: 5,
                    backgroundColor: '#54c242aa',
                  }}
                />
                <View
                  style={{
                    flex: 1 - item.downloadedMedia / item.totalMedia,
                    backgroundColor: 'lightgray',
                    height: 5,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 0.12,
                  justifyContent: 'center',
                  height: 20,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 10,
                    backgroundColor: 'transparent',
                  }}>{`${Math.round(
                  (item.downloadedMedia / item.totalMedia) * 100,
                )}%`}</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableView
          style={{flex: 0.08, justifyContent: 'center'}}
          disabled={!this.getCanDeleteStatus(item)}
          onPress={() => this.deleteModule(item)}>
          <IconMaterialNew
            style={{
              fontWeight: 'bold',
              fontSize: 30,
              backgroundColor: 'transparent',
            }}
            name="delete-forever"
            color={
              this.getCanDeleteStatus(item)
                ? 'rgba(150,150,150,0.8)'
                : 'rgba(150,150,150,0.1)'
            }
          />
        </TouchableView>
      </View>
    );
  }

  getCanDeleteStatus(item) {
    return (
      !this.getModuleDownloadingStatus(item) &&
      item.downloadedMedia / item.totalMedia != 0
    );
  }

  getDownloadingStatusString(item) {
    return item.downloadingMediaCount > 0 ? '(Downloading)' : '';
  }

  getModuleDownloadingStatus(item) {
    return item.downloadingMediaCount > 0;
  }

  getTitle(stringText) {
    let maxLength = this.state.PortraitStatus
      ? window.width / 12
      : window.width / 4;
    let pageLength = stringText.length;
    return `${stringText.slice(0, maxLength)}${
      pageLength >= maxLength ? '...' : ''
    }`;
  }

  onRefresh(showLoading = true) {
    this.setState({refreshing: showLoading});
    downloadScreenService.getAllDownloads().then(downloads => {
      let newDownloads = downloads.map(course => {
        return {
          ...course,
          data: course.modules,
          key: course.id,
          downloadedMedia: course.modules.reduce(sum('downloadedMedia'), 0),
          totalMedia: course.modules.reduce(sum('totalMedia'), 0),
          totalDownloading: course.modules.reduce(
            sum('downloadingMediaCount'),
            0,
          ),
        };
      });
      this.setState({
        downloads: newDownloads,
        refreshing: false,
        downloadingStatus: newDownloads[0].totalDownloading > 0,
      });
    });

    //check which modules are being downloaded and update
  }

  onResumePauseClicked() {
    if (!downloadScreenService.isDownloadQueuePaused()) {
      //pause Download
      downloadScreenService.pauseDownloading();
    } else {
      //resume Download
      downloadScreenService.resumeDownloading();
    }
  }

  onStopClicked() {
    const {downloads} = this.state;

    Alert.alert('Cancel Download', 'Do you want to cancel all downloading?', [
      {
        text: 'Yes',
        onPress: () => {
          const modulesToRemove = downloads.reduce((prev, course) => {
            const downloadingModules = course.modules.filter(
              module => module.downloadingMediaCount > 0,
            );
            return prev.concat(downloadingModules);
          }, []);
          downloadScreenService.stopDownloading(modulesToRemove);
        },
      },
      {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
    ]);
  }

  getCourseDownloadProgress() {
    return (
      this.state.downloads[0].downloadedMedia /
      this.state.downloads[0].totalMedia
    );
  }
  getColorFromProgress(progress) {
    return progress * 100 < 51
      ? '#ab1d1d'
      : progress * 100 < 76
      ? '#ab9a1d'
      : '#1dab7d';
  }

  deleteModule(item) {
    Alert.alert(
      'Delete Module ',
      'Do you want to delete this Module Content?',
      [
        {
          text: 'Yes',
          onPress: () => {
            downloadScreenService.deleteModuleMedia(item);
          },
        },
        {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
      ],
    );
  }

  deleteModuleFromDownloading(item) {
    Alert.alert(
      'Cancel Module Download',
      'Do you want to cancel this module downloading?',
      [
        {
          text: 'Yes',
          onPress: () => {
            downloadScreenService.cancelModuleDownloading(item);
          },
        },
        {text: 'Not Now', onPress: () => console.log('Cancel Pressed')},
      ],
    );
  }

  resumeModuleDownloading(item) {
    reachabilityService.checkNetworkConnection().then(isConnected => {
      if (isConnected) {
        Alert.alert(
          'Download this Module for offline viewing?',
          '(This download is large. To avoid potential delays or extra data usage charges, use WiFi only.)',
          [
            {
              text: 'Yes',
              onPress: () => {
                downloadScreenService.restartDownloadForModule(item);
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

  getCanCancelDownload(item) {
    //check module working list
    return item.downloadingMediaCount > 0;
  }

  render() {
    const downloads = this.state.downloads;
    return (
      <View style={{flex: 1, height: window.height}}>
        <ReachableComponent width={window.width}></ReachableComponent>
        <View
          style={{
            flex: 1,
            marginBottom: 5,
            borderColor: '#DDD',
            borderRadius: 5,
            borderWidth: 1,
            paddingBottom: 5,
            height: window.height * 0.7,
          }}>
          <SectionList
            sections={downloads}
            renderSectionHeader={this.sectionHeaderView.bind(this)}
            renderItem={this.itemView.bind(this)}
            keyExtractor={(item, index) => item.key}
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh.bind(this)}></SectionList>
        </View>
        <View style={{justifyContent: 'flex-end', flexDirection: 'column'}}>
          <View
            style={{
              justifyContent: 'flex-end',
              backgroundColor: '#1d88ab',
              flexDirection: 'row',
              borderColor: 'rgba(29, 136, 171,0.7)',
              borderTopWidth: 0,
            }}>
            <TouchableView
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              underlayColor="rgba(52,73,94,0.4)"
              disabled={!downloadScreenService.isDownloading()}
              onPress={() => this.onStopClicked()}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 16,
                    color: downloadScreenService.isDownloading()
                      ? '#FFF'
                      : 'rgba(150,150,150,0.8)',
                    fontWeight: '700',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingVertical: 14,
                  }}>
                  Cancel All Downloads
                </Text>
              </View>
            </TouchableView>
          </View>
        </View>
      </View>
    );
  }
}

export default DownloadScreen;
