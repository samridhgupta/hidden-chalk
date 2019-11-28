import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
} from 'react-native';
import Sketch from 'react-native-sketch-view';
import IconEntypo from 'react-native-vector-icons/Entypo';
import TouchableView from './components/TouchableView';
import Orientation from 'react-native-orientation';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';
import RNFS from 'react-native-fs';
import katex from '../libs/katex';
import CourseWorkViewWithTitle from './components/CourseWorkViewWithTitle';
import replaceAll from '../libs/replaceAll';
import cloudfrontConfig from '../config/aws/cloudfront-config';
import Snackbar from 'react-native-snackbar';
import IconIonicons from 'react-native-vector-icons/Ionicons';

const sketchConstants = Sketch.constants;

const tools = {};

const sketchSaveDir = `${RNFS.DocumentDirectoryPath}/workpad`;
RNFS.mkdir(sketchSaveDir);

tools[sketchConstants.toolType.pen.id] = {
  id: sketchConstants.toolType.pen.id,
  name: sketchConstants.toolType.pen.name,
  nextId: sketchConstants.toolType.eraser.id,
};
tools[sketchConstants.toolType.eraser.id] = {
  id: sketchConstants.toolType.eraser.id,
  name: sketchConstants.toolType.eraser.name,
  nextId: sketchConstants.toolType.pen.id,
};

class WorkPad extends Component {
  constructor(props) {
    super(props);
    this.maxHeight = 200;
    this.minHeight = 0;
    this.queContent = this.props.navigation.state.params.questionDescription;

    const workfileName = `${this.props.navigation.state.params.filename}.png`;
    this.workfilePath = `${sketchSaveDir}/${workfileName}`;
    this.state = {
      toolSelected: sketchConstants.toolType.pen.id,
      localSourceImagePath: '',
      queHeight: 30,
      isCollapsed: true,
      localSourceImagePath: this.workfilePath,
    };
  }

  static navigationOptions = {
    title: 'Work Pad',
    headerBackTitle: null,
    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: '#000',
  };

  componentWillMount() {
    Orientation.lockToPortrait();
    this.AnimatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    Analytics.setScreenName(AnalyticsConstants.screens.WORKPAD_SCREEN.name);
    this._onPressCollapsableView();
  }

  componentWillUnmount() {
    console.log('Component will unmount');
    Orientation.unlockAllOrientations();
  }

  isEraserToolSelected() {
    return this.state.toolSelected === sketchConstants.toolType.eraser.id;
  }

  toolChangeClick() {
    let nextTool = tools[this.state.toolSelected];

    Analytics.logEvent(AnalyticsConstants.events.TOOL_CHANGE_CLICK.name, {
      tool_name: nextTool.name,
    });

    this.setState({toolSelected: nextTool.nextId});
  }

  getToolName() {
    return tools[this.state.toolSelected].name;
  }

  onSketchSave(saveEvent) {
    console.log(`save event - ${saveEvent}`);
    console.log(`save path - ${this.workfilePath}`);

    RNFS.mkdir(sketchSaveDir)
      .then(() => RNFS.moveFile(saveEvent.localFilePath, this.workfilePath))
      .catch(err =>
        RNFS.unlink(this.workfilePath).then(() =>
          RNFS.moveFile(saveEvent.localFilePath, this.workfilePath),
        ),
      )
      .then(() => {
        console.log(`File saved`);
        Snackbar.show({
          title: 'Work saved successfully',
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
      });
  }

  saveSketch() {
    this.refs.sketchRef.saveSketch();
  }

  clearSketch() {
    this.refs.sketchRef.clearSketch();
  }

  _onPressCollapsableView = () => {
    //Alert.alert('You tapped the label!');

    Animated.timing(this.AnimatedValue, {
      toValue: this.state.isCollapsed ? this.maxHeight : this.minHeight,
      duration: 500,
      easing: Easing.cubic,
    }).start();
    this.setState({
      queHeight: 200,
      isCollapsed: this.state.isCollapsed ? false : true,
    });
  };
  hasMediaUris(content) {
    return content.mediaUris !== undefined;
  }

  replaceMediaUris(content, mediaUris) {
    return replaceAll(
      content,
      /(\$\{([^\}]*)\})/,
      (match, group, group2, group3, index, string) => {
        return `${cloudfrontConfig.mediaBase}/${mediaUris[group2].uriPath}`;
      },
    );
  }

  showContent_1() {
    if (this.state.queDescData != 'hi') {
      let {
        title,
        questionDescription,
        question,
        options,
      } = this.state.queDescData;
      let hasMediaUri = this.hasMediaUris(this.state.queDescData);

      let replaceMediaIfNeeded = text => {
        return hasMediaUri
          ? this.replaceMediaUris(text, this.state.queDescData.mediaUris)
          : text;
      };
      questionDescription = katex.render(
        replaceMediaIfNeeded(questionDescription),
      );
      question = katex.render(replaceMediaIfNeeded(question));

      return (
        <View>
          <CourseWorkViewWithTitle title={''} content={questionDescription} />
          <CourseWorkViewWithTitle content={question} />
        </View>
      );
    } else {
      return <View></View>;
    }
  }

  showContent() {
    console.log(this.queContent);
    if (this.queContent != '--') {
      let {title, questionDescription, question, options} = this.queContent;
      let hasMediaUri = this.hasMediaUris(this.queContent);
      const animatedStyle = {height: this.AnimatedValue};
      const titleTextFontStyle = {
        color: 'black',
        fontSize: 15,
        fontWeight: '400',
      };
      let replaceMediaIfNeeded = text => {
        return hasMediaUri
          ? this.replaceMediaUris(text, this.queContent.mediaUris)
          : text;
      };
      questionDescription = katex.render(
        replaceMediaIfNeeded(questionDescription),
      );
      question = katex.render(replaceMediaIfNeeded(question));

      return (
        <View
          style={{
            top: 0,
            flexDirection: 'column',
            zIndex: 2,
            display: this.queContent == '--' ? 'none' : 'flex',
            position: 'absolute',
            backgroundColor: 'white',
            margin: 10,
            borderRadius: 3,
            borderWidth: 0,
            borderColor: '#FDFDFD',
            shadowOffset: {width: 0, height: 1},
            shadowColor: 'black',
            shadowOpacity: 0.3,
            elevation: 1,
          }}>
          <TouchableHighlight
            style={{alignItems: 'stretch'}}
            onPress={this._onPressCollapsableView}
            underlayColor="#f1f1f1">
            <View
              style={{
                backgroundColor: '#eeeeee',
                height: 40,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
              }}>
              <Text style={[{paddingLeft: 10, flex: 1}, titleTextFontStyle]}>
                Question
              </Text>

              <IconIonicons
                style={{
                  fontSize: 25,
                  fontWeight: '400',
                  margin: 5,
                  height: 25,
                  width: 25,
                }}
                name={
                  this.state.isCollapsed
                    ? 'ios-arrow-dropdown'
                    : 'ios-arrow-dropup'
                }
                color="#0086ad"
              />
            </View>
          </TouchableHighlight>

          <Animated.View style={[{height: 0}, animatedStyle]}>
            <ScrollView>
              <CourseWorkViewWithTitle
                title={''}
                content={questionDescription}
              />
              <CourseWorkViewWithTitle content={question} />
            </ScrollView>
          </Animated.View>
        </View>
      );
    } else {
      return <View></View>;
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          zIndex: 1,
          alignItems: 'stretch',
          backgroundColor: 'white',
        }}>
        {this.showContent()}

        <Sketch
          style={{
            top: this.queContent == '--' ? 0 : 60,
            flex: 1,
            backgroundColor: 'white',
            zIndex: 1,
          }}
          ref="sketchRef"
          selectedTool={this.state.toolSelected}
          onSaveSketch={this.onSketchSave.bind(this)}
          localSourceImagePath={this.state.localSourceImagePath}
        />
        {/* </View> */}
        <View
          style={{flexDirection: 'row', backgroundColor: '#EEE', zIndex: 1}}>
          <TouchableView
            underlayColor={'#CCC'}
            style={{flex: 1, alignItems: 'center', paddingVertical: 20}}
            onPress={this.clearSketch.bind(this)}>
            <Text style={{color: '#888', fontWeight: '600'}}>CLEAR</Text>
          </TouchableView>
          <TouchableView
            underlayColor={'#CCC'}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: this.isEraserToolSelected()
                ? '#CCC'
                : 'rgba(0,0,0,0)',
            }}
            onPress={this.toolChangeClick.bind(this)}>
            {this.isEraserToolSelected() ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <IconEntypo
                  style={{paddingRight: 4, fontSize: 25}}
                  name="eraser"
                  color="#888"
                />
                <Text style={{color: '#888', fontWeight: '800'}}>ERASER</Text>
              </View>
            ) : (
              <Text style={{color: '#888', fontWeight: '600'}}>ERASER</Text>
            )}
          </TouchableView>
          <TouchableView
            underlayColor={'#CCC'}
            style={{flex: 1, alignItems: 'center', paddingVertical: 20}}
            onPress={this.saveSketch.bind(this)}>
            <Text style={{color: '#888', fontWeight: '600'}}>SAVE</Text>
          </TouchableView>
        </View>
      </View>
    );
  }
}

export default WorkPad;
