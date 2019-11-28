import React, {Component} from 'react';

import {StyleSheet, Text, View, Dimensions, Platform} from 'react-native';
import Video from 'react-native-video';
import MediaControls from 'react-native-media-controls';
import ReachabilityService from '../../services/reachability-service';
import WebView from 'react-native-webview';

const window = Dimensions.get('window');
var PLAYER_STATE = {PLAYING: 0, PAUSED: 1, ENDED: 2};
class CourseWorkVideo extends Component {
  constructor(props) {
    super(props);
    this.onSeek = this.onSeek.bind(this);
    this.onPaused = this.onPaused.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onReplay = this.onReplay.bind(this);
    this.onFullScreen = this.onFullScreen.bind(this);
    this.state = {
      rate: 1,
      volume: 1,
      muted: false,
      repeat: false,
      resizeMode: 'contain',
      duration: 0.0,
      currentTime: 0.0,
      controls: false,
      paused: false,
      skin: 'custom',
      isBuffering: false,
      progressStatus: 0.0,
      playerState: PLAYER_STATE.PLAYING,
      videoData: {},
      fullscreenStatus: false,
      isConnected: true,
    };
  }

  componentWillMount() {
    ReachabilityService.checkNetworkConnection().then(status => {
      this.setState({isConnected: status});
    });
  }

  chooseVideoComponent(videoType, videoUri) {
    switch (videoType) {
      case 'proprietary':
        return this.renderProprietaryVideo(videoUri);
      case 'youtube':
        return this.renderYoutubeVideo(videoUri);
    }
  }

  getVideoStyles = () => {
    const PotraitStatus = window.height > window.width;
    return {
      width: '100%',
      ...Platform.select({
        ios: {
          height: PotraitStatus ? window.height * 0.35 : window.height - 120,
        },
        android: {
          height: PotraitStatus ? window.height * 0.35 : window.height - 139,
        },
      }),
    };
  };

  renderProprietaryVideo(videoUri) {
    return (
      <View>
        <Video
          source={{uri: videoUri}}
          ref={ref => {
            this.player = ref;
          }}
          style={{
            backgroundColor: 'white',
            ...this.getVideoStyles(),
          }}
          rate={this.state.rate}
          paused={this.state.paused}
          volume={this.state.volume}
          muted={this.state.muted}
          repeat={this.state.repeat}
          fullscreen={this.state.fullscreenStatus}
          onLoad={data =>
            this.setState({
              duration: data.duration,
              videoData: data.naturalSize,
            })
          }
          onProgress={data =>
            this.setState({
              currentTime:
                data.currentTime < this.state.duration
                  ? data.currentTime
                  : this.state.duration,
              progressStatus:
                parseFloat(data.currentTime) / parseFloat(this.state.duration),
            })
          }
          onEnd={this.onEnd}
          resizeMode="contain"
        />
        <MediaControls
          mainColor={'rgba(101, 180, 206,0.5)'}
          playerState={this.state.playerState}
          progress={this.state.currentTime}
          duration={this.state.duration}
          onPaused={this.onPaused}
          onSeek={this.onSeek}
          onReplay={this.onReplay}
          onFullScreen={this.onFullScreen}
        />
      </View>
    );
  }

  renderYoutubeVideo(videoUri) {
    let regExMatches = videoUri.match(/https:\/\/.+\/(.+)/);
    let videoId = regExMatches ? regExMatches[1] : '';
    videoUri = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&amp;showinfo=0`;
    if (!this.state.isConnected) {
      return (
        <View
          style={{
            opacity: 0.6,
            backgroundColor: '#FAFAFA',
            marginHorizontal: 15,
            marginVertical: 15,
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
            <Text
              style={[{flex: 1, alignItems: 'center', alignSelf: 'center'}]}>
              The internet connection appears to be offline,
            </Text>
            <Text
              style={[{flex: 1, alignItems: 'center', alignSelf: 'center'}]}>
              So you cannot play this Youtube Video.
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <WebView
          style={this.getVideoStyles()}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          source={{uri: videoUri}}
        />
      );
    }
  }

  onSeek(seek) {
    this.player.seek(seek);
  }
  onReplay() {
    this.setState({playerState: PLAYER_STATE.PLAYING});
    this.player.seek(0);
  }

  onPaused() {
    this.setState({
      paused: !this.state.paused,
      playerState: !this.state.paused
        ? PLAYER_STATE.PAUSED
        : PLAYER_STATE.PLAYING,
    });
  }
  onEnd() {
    this.setState({playerState: PLAYER_STATE.ENDED});
  }

  onFullScreen() {
    // this.setState({fullscreenStatus: true});
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.props.title ? (
          <View style={styles.noteView}>
            <Text style={styles.noteText}>{this.props.title} </Text>
          </View>
        ) : (
          <View />
        )}
        <View
          style={{
            borderTopWidth: 5,
            borderBottomWidth: 5,
            borderColor: '#F5F5F5',
          }}>
          {this.chooseVideoComponent(this.props.videoType, this.props.uri)}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  noteView: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  noteText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    justifyContent: 'center',
  },
});

export default CourseWorkVideo = CourseWorkVideo;
