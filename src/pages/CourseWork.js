import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Image,
    ListView,
    TouchableWithoutFeedback,
    WebView,
    Alert,
    DeviceEventEmitter,
    InteractionManager,
    FlatList,
    ActivityIndicator,
    UIManager,
    Dimensions,
    AppState
} from 'react-native';
import Container from './components/Container';
import Button from './components/Button';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation';
import Drawer from 'react-native-drawer'

import CourseWorkView from './components/CourseWorkView';
import CourseWorkViewWithTitle from './components/CourseWorkViewWithTitle';
import CourseWorkVideo from './components/CourseWorkVideo';
import TouchableView from './components/TouchableView';
import soundService from '../services/sound-service';
import {soundKeyConstants} from '../config/soundData';

import { RadioButtons } from 'react-native-radio-buttons';
import katex from '../libs/katex';
import replaceAll from '../libs/replaceAll';
import voca from 'voca';
import coursePage from '../models/json-models/course-page';

import courseWorkService from '../services/coursework-service';
import SpinWheelModal from './components/SpinWheelModal';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialNew from 'react-native-vector-icons/MaterialIcons';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Analytics from '../analytics';
import AnalyticsConstants from '../analytics/analytics-constants';
import cloudfrontConfig from '../config/aws/cloudfront-config';
import { ReachableComponent } from './components/ReachableComponent';
import downloadMediaService from '../services/download-media-service';
const stringReplaceAsync = require('string-replace-async');
import appLoginTasks from '../app-login';
import downloadManagerService from '../services/download-manager-service';

const window = Dimensions.get('window');
const styles = StyleSheet.create({
    activeSubmit: {
        borderWidth: 1,
        borderColor: '#65b4ce',
        borderRadius: 10,
        backgroundColor: '#65b4ce'
    },
    disabledSubmit: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 10,
        backgroundColor: '#ccc'
    },
    disableButton: {
        backgroundColor: 'rgba(52, 52, 52 , 0.4)'
    },
    fotterButton: {
        paddingHorizontal: 10,
    },
    submitAnswerButton: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#FFF'
    },
    ExampleContentView:{
        paddingHorizontal: 10,
        paddingTop: 5
    },
    QuestionAnswerContentView: {
        paddingTop: 5
    },
    SubmitAnswerContentView: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginVertical: 15,
    },
    ShowSolutionView: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingBottom: 15,
        paddingLeft:30
    },
    optionView: {
    },
    correctAnswer: {
        marginTop: 5,
        marginBottom: 15,
        marginRight: 20,
        fontWeight: 'bold',
        fontSize: 15,
        color: 'green'
    },
    incorrectAnswer: {
        marginTop: 5,
        marginBottom: 15,
        marginRight: 20,
        fontWeight: 'bold',
        fontSize: 15,
        color: 'red'
    },
    footerGap: {
        paddingBottom: 20
    }
});

const drawerStyles = {
  drawer: { shadowColor: '#000000', shadowOpacity: 0.4, shadowRadius: 3}
}

class CourseWork extends Component {

    static navigationOptions = ({ navigation }) => {
        let { className, moduleOrder } = navigation.state.params;
        let drawerIconDisabled =
            navigation.state.params.disableDrawerIcon === undefined
                ? false
                : navigation.state.params.disableDrawerIcon;
        const onDrawerToggle = () => {
            Analytics.logEvent(
                AnalyticsConstants.events.PAGE_DRAWER_CLICK.name
            );
            navigation.setParams({
                drawerOpen: !navigation.state.params.drawerOpen
            });
        };
        return {
            title:
                !className || !moduleOrder
                    ? ""
                    : `${className} - Module ${moduleOrder}`,
            headerStyle: {
                backgroundColor: "#F5F5F5"
            },
            headerTintColor: "#666",
            headerRight: (
                <TouchableView
                    disabled={drawerIconDisabled}
                    onPress={onDrawerToggle}
                >
                    <IconMaterial
                        name="menu"
                        style={{ padding: 10, paddingRight: 20, fontSize: 25 }}
                        color="#666"
                    />
                </TouchableView>
            )
        };
    };

    constructor(props) {
        super(props);
        this.navigate = props.navigation.navigate;
        this.setNavParams = props.navigation.setParams;
        this.state = {
            PortraitStatus: window.height < window.width ? false : true,
            selectedOption: {},
            answerSubmittedFlag: false,
            correctAnswer: {},
            exampleSolutionPressedFlag: false,
            questionSolutionPressedFlag: false,
            isPageLoading: true,
            measurements:{},
            videoPlayermeasurements:{},
            appState: AppState.currentState
        };
    }

    componentWillMount() {
    AppState.addEventListener('change', this._handleAppStateChange); 
        this.initRouteParams();
    }

    componentDidMount() {
        Analytics.setScreenName(AnalyticsConstants.screens.COURSEWORK_SCREEN.name);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        DeviceEventEmitter.emit('backPress');
    }
    
  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      downloadManagerService.killDownloadManager();
      appLoginTasks();  
    }

    this.setState({appState: nextAppState});
  }


    initRouteParams() {
        const { pageId } = this.props.navigation.state.params;
        this.transitionToPage(pageId);
    }

    fetchPageAndSection(pageId) {
        
        this.resetFlag();

        let returnPageActivity = page => {
            return page.studentPage.activity ? JSON.parse(page.studentPage.activity) : {}
        };

        return courseWorkService.updateStudentSection(pageId)
        .then(() => courseWorkService.updateNextPageOfSectionAndCascadeUp(pageId))
        .then(() => courseWorkService.getCombinedPage(pageId))
            .then(page=>({page: {...page, isCompleted: page.studentPage.isCompleted} })) 
        .then(state => ({...state, pageActivity: returnPageActivity(state.page)}))
        .then(state => courseWorkService.getCombinedSection(state.page.sectionId)
            .then(section => ({...state, section: {...section, isCompleted: section.studentSection.isCompleted} })))
        .then(state => courseWorkService.getCombinedModule(state.section.moduleId)
            .then(module => ({...state, module: {...module, isCompleted: module.studentModule.isCompleted} })))
        .then(state => courseWorkService.getCombinedCourse(state.module.courseId)
            .then(course => ({...state, course: {...course, isCompleted: course.studentCourse.isCompleted} })))
        .then(state => {return this.replaceMediaIdWithPath(state)})
        .then(state => {

            Analytics.logEvent(AnalyticsConstants.events.COURSE_WORK_PAGE_VIEW.name, {
                page_id: state.page.id,
                section_id: state.section.id,
                module_id: state.module.id,
                course_id: state.course.id
            });

            this.setState(state);
            this.props.navigation.setParams({
                className: state.course.name,
                moduleOrder: state.module.order,
                pageId: state.page.id
            });
        });
    }

    replaceMediaIdWithPath(state) {
        return new Promise((resolve, reject) => {
            let { page, course } = state;

            var _page = page;
            switch (page.type) {
                case 'theory':
                    if (this.hasMediaUris(page.content)) {
                        this.replaceMediaUrisAsync(page.content.body, page.content.mediaUris, course.id)
                            .then(contentBody => {
                                _page.content.body = contentBody
                                state.page = _page
                                resolve(state)
                            })
                    } else {
                        resolve(state)
                    }
                    break;
                case 'example':
                    var rawUri = page.content.solution.uri
                    if (this.hasMediaUris(page.content)) {
                        this.replaceMediaUrisAsync(page.content.example, page.content.mediaUris, course.id)
                            .then(contentExample => {
                                _page.content.example = contentExample
                                state.page = _page
                                return state
                            })
                            .then(state => {
                                this.getMediaUrlPath(rawUri, course.id)
                                    .then((path) => {
                                        _page.content.solution.mediaPath = path
                                        state.page = _page
                                        resolve(state)
                                    })

                            })
                    } else {
                        this.getMediaUrlPath(rawUri, course.id)
                            .then((path) => {
                                _page.content.solution.mediaPath = path
                                state.page = _page
                                resolve(state)
                            })
                    }
                    break;
                case 'question':
                    var { questionDescription, question } = page.content
                    var rawUri = page.content.solution.uri
                    if (this.hasMediaUris(page.content)) {
                        this.replaceMediaUrisAsync(page.content.questionDescription, page.content.mediaUris, course.id)
                            .then(contentQuestionDescription => {
                                _page.content.questionDescription = contentQuestionDescription
                                state.page = _page
                                return state
                            }).then(state => {
                                return this.replaceMediaUrisAsync(page.content.question, page.content.mediaUris, course.id)
                            }).then(contentQuestion => {
                                _page.content.question = contentQuestion
                                state.page = _page
                                return state
                            })
                            .then(state => {
                                //options
                                var replacePromise = page.content.options.map(_option => {
                                    return this.replaceMediaUrisAsync(_option.value, page.content.mediaUris, course.id)
                                })
                                return Promise.all(replacePromise)
                            }).then(contentOptions => {
                                _page.content.options = contentOptions.map((optionValue, index) => {return {id : index, value : optionValue}})
                                state.page = _page
                                return state
                            })
                            .then(state => {
                                this.getMediaUrlPath(rawUri, course.id)
                                    .then((path) => {
                                        _page.content.solution.mediaPath = path
                                        state.page = _page
                                        resolve(state)
                                    })
                            })
                    } else {
                        this.getMediaUrlPath(rawUri, course.id)
                            .then((path) => {
                                _page.content.solution.mediaPath = path
                                state.page = _page
                                resolve(state)
                            })
                    }

                    break;
                case 'video':
                    var rawUri = page.content.uri
                    if (page.content.videoType == 'proprietary') {
                        this.getMediaUrlPath(rawUri, course.id)
                            .then((path) => {
                                _page.content.mediaPath = path
                                state.page = _page
                                resolve(state)
                            })
                    } else {
                        resolve(state)
                    }
                    break;
                default:
                    resolve(state)
            }

        })

    }
    

    replaceMediaUrisAsync(content, mediaUris, courseId) {
        return stringReplaceAsync(content, /(\$\{([^\}]*)\})/, (match, group, group2,group3 ,index, string)=> {
            return this.getMediaUrlPath(mediaUris[group2].uriPath, courseId)})
    }

    getPageActivity() {
        return this.state.pageActivity ? this.state.pageActivity : {};
    }

    resetFlag() {
        this.setState({
            selectedOption: {},
            answerSubmittedFlag: false,
            correctAnswer: {},
            exampleSolutionPressedFlag: false,
            questionSolutionPressedFlag: false,
        });
    }

    canGoBack() {
        let {page, isPageLoading} = this.state;

        if(page && page.prev === "")
            return false;
        if(isPageLoading)
            return false;
        return true;
    }

    answerIsSubmitted() {
        let {submittedOption} = this.getPageActivity();
        return submittedOption !== undefined || this.state.answerSubmittedFlag;
    }

    canGoForward() {
        let {page, isPageLoading} = this.state;

        if(page && page.type === 'question' && !this.answerIsSubmitted())
            return false;
        if(isPageLoading)
            return false;
        return true;
    }

    getProgress() {
        const { section, page } = this.state;
        let totalPages = section ? section.studentSection.totalPages : 0;
        if(totalPages === 0)
            return 0;
        return page.number / section.studentSection.totalPages;
    }

    showSectionHeader() {
        let {section, page} = this.state;
        let sectionString = section ? `Section ${section.order} ` : '';
        let pageString = (!page || !section) ? '' : `Page ${page.number}/${section.studentSection.totalPages}`;
        return (
            <View style={{height: 25, alignItems:'center', backgroundColor:'#F5F5F5', borderBottomColor:'#EEE', borderBottomWidth:1, flexDirection:'row' }}>
                <ReachableComponent width={window.width}></ReachableComponent>
                <Text style={{color: '#888', fontSize: 14, fontWeight: '500', paddingBottom: 1, flex:0.5, paddingLeft:15}}>{sectionString}</Text>
                <Text style={{color: '#888', fontSize: 14, fontWeight: '500', paddingBottom: 1, flex:0.5, textAlign:'right', paddingRight:15}}>{pageString}</Text>
            </View>
        );
    }

    showLoadingView() {
        return (
            <View style={{flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator
                    animating={true}
                    color="gray"
                    style={[{
                        flex: 1, height: 80, alignItems: 'center',
                        alignSelf: 'center'
                    }]}
                    size="large"
                />
            </View>
        );
    }

    drawerChildren() {
        let { page, isPageLoading } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                {this.showSectionHeader()}
                {this.showProgress()}
                {this.state.isPageLoading 
                    ? this.showLoadingView() : 
                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                        ref={ref => this.ScrollView = ref}
                        onContentSizeChange={() => {
                            if(this.shouldUpdateScroll())
                                this.ScrollView.scrollTo({y: this.scrollMeasurements()});
                        }}
                    >
                        <View> 
                            {this.showContent()}
                        </View>
                        <View>
                        </View>
                    </ScrollView>
                }
                <View style={{ justifyContent: 'flex-end', backgroundColor: '#1d88ab', flexDirection: 'row', borderColor: 'rgba(29, 136, 171,0.7)', borderTopWidth: 1 }}>
                    <TouchableView style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        underlayColor='rgba(52,73,94,0.4)'
                        disabled={!this.canGoBack()}
                        onPress={() => this.previous()}>
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center' }} >
                            <IconMaterialNew style={{ paddingLeft: 8, fontSize: 30, flex: 1, alignItems: 'center', textShadowColor: '#888' }}
                                name="navigate-before"
                                color={this.canGoBack() ? "#FFF" : 'rgba(150,150,150,0.6)'} />
                            <Text style={{ flex: 3, paddingLeft: 10, textAlign: 'left', fontSize: 15, color: this.canGoBack() ? '#FFF' : 'rgba(150,150,150,0.6)', fontWeight: '700', flexDirection: 'row', justifyContent: 'center', }}>
                                PREV
                                </Text>
                        </View>
                    </TouchableView>
                    <TouchableView style={{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        underlayColor='rgba(52,73,94,0.4)'
                        disabled={this.state.isPageLoading}
                        onPress={() => this.openWorkPad()}>
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center', }} >
                            <Text style={{ flex: 3, textAlign: 'center', fontSize: 16, color: !this.state.isPageLoading ? '#FFF' : 'rgba(150,150,150,0.8)', fontWeight: '800', flexDirection: 'row', justifyContent: 'center', paddingVertical: 14, }}>
                                WORK PAD
                                </Text>
                        </View>
                    </TouchableView>
                    <TouchableView style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        underlayColor='rgba(52,73,94,0.4)'
                        disabled={!this.canGoForward()}
                        onPress={() => this.next()}>
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center', }} >
                            <Text style={{ flex: 3, textAlign: 'right', fontSize: 15, color: this.canGoForward() ? '#FFF' : 'rgba(150,150,150,0.6)', fontWeight: '700', flexDirection: 'row', justifyContent: 'center', }}>
                                NEXT
                                </Text>
                            <IconMaterialNew style={{ paddingRight: 15, fontSize: 30, flex: 1, alignItems: 'flex-start', textShadowColor: '#888' }}
                                name="navigate-next"
                                color={this.canGoForward() ? '#FFF' : 'rgba(150,150,150,0.6)'} />
                        </View>
                    </TouchableView>
                </View>
                <SpinWheelModal ref='spinWheelModal' />
            </View>
        );
    }

    shouldUpdateScroll(){
        return ((this.state.exampleSolutionPressedFlag) || (this.state.answerSubmittedFlag) || (this.state.questionSolutionPressedFlag));
    }

    scrollMeasurements() {
        return (this.state.measurements.y + this.getVideoPlayerMeasurements())
    }

    showPageProgress(page) {
        let {isUnlocked, isCompleted} = !page.studentPage ? {} : page.studentPage;

        // if (!isUnlocked) { 
        //     return (
        //         <View style={{ height: 20, width: 20, alignItems: 'center', justifyContent: 'center' }}>
        //             <IconIonicons style={{ fontSize: 20  }} name="md-lock" color="#bbb" />
        //         </View>
        //     ) 
        // }

        return (
            (isCompleted) ? (
                <View style={{ height: 20, width: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <IconIonicons style={{ fontSize: 20 }} name="ios-checkmark-circle" color='#1dab7d' />
                </View>
            ) : <View style={{ height: 20, width: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Progress.Circle thickness={7} progress={0} size={16} borderWidth={1} color={'#1d88ab'} />
                </View>
        );
    }

    onPageSelected(page){
        // if(!page.studentPage.isUnlocked)
        //     return;
            
        this.setNavParams({drawerOpen: false});
        if(this.state.page.id === page.id)
            return;

        this.transitionToPage(page.id);
    }

    getPageTitle(page) {
        if(!page.content) return;
        let maxLength = this.state.PortraitStatus ? window.width/17 : window.width/14;
        let pageLength = page.content.title.length;
        return `${page.content.title.slice(0, maxLength)}${pageLength >= maxLength ? '...' : ''}`;
    }

    renderDrawerRow(page) {
        let {isUnlocked, isCompleted} = !page.studentPage ? {} : page.studentPage;

        let rowColor = this.state.page.id === page.id ? '#EEE' : '#FBFBFB';
        return (
            <TouchableView onPress={() => this.onPageSelected(page)} underlayColor="rgba(155,155,155,1)" style={{ height: 38, paddingHorizontal: 4, backgroundColor: rowColor}}>
                <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', paddingLeft: 8, borderBottomColor: '#EEE', borderBottomWidth: 1 }}>
                    <Text style={{ fontSize: 11, color: '#777', fontWeight: '400', flex: 0.3, alignSelf: 'center' }}>
                        {`Page ${page.number}`}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#555', fontWeight: '500', alignSelf: 'center', flex: 1 }}>
                        {this.getPageTitle(page)}
                    </Text>
                    <View style={{ flex: 0.1, marginHorizontal: 5 }}>
                        {this.showPageProgress(page)}
                    </View>
                </View>
            </TouchableView>
        );
    }

    drawerContent() {
        let {section} = this.state;
        let pages = section ? section.pages : undefined;
        if(pages === undefined) return false;
        return (
            <View style={{flex: 1, backgroundColor: '#FBFBFB'}}>
                <Text style={{ fontSize: 16, color: '#444', fontWeight: '500', alignSelf:'center', paddingTop: 10,paddingBottom:5}}>
                Content
                </Text>
                <FlatList 
                    ref='drawerList' 
                    data={pages} 
                    style={{ marginBottom: 10,backgroundColor: '#FBFBFB' }} 
                    keyExtractor={(item, index)=>item.id} 
                    renderItem={({item, index})=>this.renderDrawerRow(item)}
                    initialNumToRender={50}
                    />
            </View>
        );
    }

    drawerOpen() {
        let {pages} = this.state.section || {};
        if(pages === undefined) return;
        let index = pages.findIndex((item)=>item.id === this.state.page.id);
        console.log('index: ', index);
        this.refs.drawerList.scrollToIndex({animated: false, index, viewPosition: 0.5});
    }

    render() {
        
        let {drawerOpen} = this.props.navigation.state.params;
        let isDrawerOpen = drawerOpen === undefined ? false : drawerOpen;

        return (
            <Drawer
                open={isDrawerOpen}
                side="right"
                type="overlay"
                styles={drawerStyles}
                openDrawerOffset={0.3}
                content={this.drawerContent()}
                tapToClose={true}
                onClose={()=>this.setNavParams({drawerOpen: false})}
                onOpenStart={()=>this.drawerOpen()}
                useInteractionManager={true}
                tweenDuration={400}
                tweenEasing='easeInOutCubic'
                tweenHandler={(ratio) => ({
                    main: { opacity: (2 - ratio) / 2 }
                })}
                closedDrawerOffset={-3}>
                {this.drawerChildren()}
            </Drawer>
        );
    }

    showContent() {
        let { page } = this.state;
       
        switch (page.type) {
            case 'theory':
                return this.courseWorkTheory(page.content);
            case 'example':
                return this.courseWorkExample(page.content);
            case 'question':
                return this.courseWorkQuestion(page.content);
            case 'video':
                return this.courseWorkVideo(page.content);
            default:
                return (<View></View>);
        }
    }

    showProgress() {
        return (
            <View style={{ flexDirection: 'row', overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#EEE', backgroundColor:'#F5F5F5' }}>
                <View style={{ flex: this.getProgress(), height: 4, backgroundColor: '#54c242' }} />
                <View style={{ flex: 1 - this.getProgress() }} />
            </View>);
    }

    previous() {
        if (!this.canGoBack())
            return;
        courseWorkService.unlockPageAndCascadeUp(this.state.page.prev)
            .then(() => courseWorkService.updateSectionWithLocalPages(this.state.page.prev))
            .then(() => this.transitionToPage(this.state.page.prev))
    }

    transitionToPage(pageId) {
        return new Promise((resolve, reject) => {
            this.setState({isPageLoading: true});
            setImmediate(()=>{
                this.fetchPageAndSection(pageId)
                .then(()=>this.setState({isPageLoading: false}))
                .then(()=>resolve());
            });
        });
    }

    openWorkPad() {
        let { page } = this.state;
        if (page.type == 'question'){
            this.navigate('WorkPad',{questionDescription:page.content, filename: `${this.state.page.id}`});
        }else{
            this.navigate('WorkPad',{questionDescription:"--", filename: `${this.state.page.id}`});
        }
    }

    next() {
        if(!this.canGoForward())
            return;
        this.setState({isPageLoading: true});
        const nextPageId = this.state.page.next;
        const pageId = this.state.page.id;
        setImmediate(()=>{
            courseWorkService.markPageCompleteAndCascadeUp(pageId)
            //.then(() => this.showSpinWheelFlow())
            .then(() => this.showCourseCompleteFlow())
            .then(() => courseWorkService.pageIdExists(nextPageId))
            .then(() => this.proceedToNextPage(nextPageId))
            .catch((err) => err.code === 401 ? this.showPageDoesntExist() : Promise.reject(err))
            .then(() => this.setState({isPageLoading: false}));
        });
    }

    showPageDoesntExist() {
        let title = `There's no more course content`;
        let message = `Keep revising this course!`;
        Alert.alert(
          title,
          message,
          [
            {
              text: `Great! Let's go back`,
              onPress: () => this.goBack()
            },
            { text: `Okay`, onPress: () => {} }
          ],
          {
            cancelable: false
          }
        );
    }

    shouldShowSpinWheelFlow() {
        let firstTimeSectionComplete = this.state.section.studentSection.isCompleted
        && this.state.section.isCompleted === false;
        return firstTimeSectionComplete ? Promise.resolve() : Promise.reject();
    }

    shouldShowCourseCompleteFlow() {
        let firstTimeCourseComplete = this.state.course.studentCourse.isCompleted
        && this.state.course.isCompleted === false;
        return firstTimeCourseComplete ? Promise.resolve() : Promise.reject();
    }

    showSpinWheelFlow() {
        return this.shouldShowSpinWheelFlow()
            //.then(() => this.showSpinWheelModal())
            .catch(()=>{});
    }

    showCourseCompleteFlow() {
        return this.shouldShowCourseCompleteFlow()
            .then(() => this.showCourseComplete())
            .catch(()=>{});
    }

    proceedToNextPage(nextPageId) {
        return courseWorkService.unlockPageAndCascadeUp(nextPageId)
            .then(() => courseWorkService.updateSectionWithLocalPages(nextPageId))
            .then(() => this.transitionToPage(nextPageId))
    }

    showCourseComplete() {
        let title = `Congratulations`;
        let message = `You have completed ${this.state.course.name} course`;
        soundService.playSound(soundKeyConstants.COURSE_COMPLETE_SOUND);
        Alert.alert(
          title,
          message,
          [
            {
              text: `Woho! Let's go back`,
              onPress: () => this.goBack()
            },
            { text: `Yay!`, onPress: () => {} }
          ],
          { cancelable: false }
        );
    }

    showSpinWheelModal() {
        return new Promise((resolve, reject) => {
            Analytics.logEvent(AnalyticsConstants.events.SPIN_WHEEL_PROMPT.name);
            let title = 'Good Work!';
            let message = 'You have completed a section. Spin a Wheel of Fortune to earn a reward'; 
            Alert.alert(title, message, [{text: 'Sure!', onPress: ()=>{

                Analytics.logEvent(AnalyticsConstants.events.SPIN_WHEEL_AFFIRM.name);

                this.props.navigation.setParams({disableDrawerIcon: true});
                this.refs.spinWheelModal.setModalCloseCallback(()=>{
                    this.props.navigation.setParams({disableDrawerIcon: false});
                    resolve();
                });
                soundService.playSound(soundKeyConstants.SPINWHEEL_OPEN_SOUND);
                
                this.refs.spinWheelModal.openModal();
            }}, {text: 'No Thanks!', onPress: ()=>resolve()}], {cancelable: false});
        });
    }

    goBack() {
        this.props.navigation.goBack();
    }

    replaceMediaUris(content, mediaUris) {
        return replaceAll(content, /(\$\{([^\}]*)\})/, (match, group, group2,group3 ,index, string)=> {
            return `${cloudfrontConfig.mediaBase}/${mediaUris[group2].uriPath}`
        });
    }

    hasMediaUris(content) {
        return content.mediaUris !== undefined;
    }

    courseWorkTheory(content) {
        let contentBody = content.body
        contentBody = katex.render(contentBody);
        return (
            <View>
                <CourseWorkViewWithTitle title={content.title} content={contentBody} />
            </View>
        );
    }

    courseWorkExample(content) {
        let contentExample = content.example;
        contentExample = katex.render(contentExample);
        return (
            <View>
                <CourseWorkViewWithTitle title={content.title} content={contentExample} />
                <View style={[styles.ExampleContentView, styles.ShowSolutionView]}
                    onLayout={({nativeEvent}) => {
                        this.setState({
                            measurements: nativeEvent.layout
                        })
                    }} >
                    <Button
                        label="Solution"
                        styles={{ button: this.state.exampleSolutionPressedFlag ? styles.disabledSubmit : styles.activeSubmit, label: styles.submitAnswerButton }}
                        onPress={() => this.showSolution()}
                        disabled={this.state.exampleSolutionPressedFlag ? true : false}
                    />
                </View>
                {this.state.exampleSolutionPressedFlag ? this.courseWorkSolution(content.solution) : <View></View>}
            </View>
        );
    }

    courseWorkSolution(solution) {
        return (
            <View style={{paddingVertical: 10}}>
                <CourseWorkVideo videoType={solution.videoType} uri={solution.mediaPath} />
            </View>
        );
    }

    showSolution() {
        this.setState({
            exampleSolutionPressedFlag: !this.state.exampleSolutionPressedFlag
        });
    }

    showQuestionSolution() {
        this.setState({
            questionSolutionPressedFlag: true
        })
    }

    courseWorkVideo(content) {
        let { title, videoType, uri, mediaPath } = content;
        if (videoType == 'proprietary') {
            return (
                <View>
                        <CourseWorkVideo title={title} videoType={videoType} uri={mediaPath}>
                        </CourseWorkVideo>
                </View>
            );
        } else {
            return (
                <View>
                        <CourseWorkVideo title={title} videoType={videoType} uri={`${cloudfrontConfig.mediaBase}/${uri}`}>
                        </CourseWorkVideo>
                </View>
            );
        }

        
    }

    getMediaUrlPath(mediaUri, courseId){
        var regExp = /^([^\/]+)/;
        let regExMatches = mediaUri.match(regExp);
        var mediaGuid =  (regExMatches) ?  regExMatches[1] : ''
       
        return downloadMediaService.getMediaById(mediaGuid, courseId)
        .then(localMediaPath => {
            return !(localMediaPath == "") ? localMediaPath : `${cloudfrontConfig.mediaBase}/${mediaUri}`
        })
    }


    getSelectedOption() {
        let {submittedOption} = this.getPageActivity();
        return (submittedOption)
            ? this.getOptionById(submittedOption.id) 
            : this.state.selectedOption;
    }

    getOptionById(optionId) {
        return this.state.page.content.options.find((option)=>option.id === optionId);
    }

    getCorrectAnswer() {
        if(this.state.page.id) {
            let { content } = this.state.page;
            return this.getOptionById(content.correctOption.id);
        }
        return this.state.correctAnswer;
    }

    getVideoSolution() {
        let { content } = this.state.page ? this.state.page : {};
        if (!content.solution)
            return;
        return content.solution;
    }

    shouldShowVideoSolution() {
        return this.getVideoSolution();
    }

    getVideoPlayerMeasurements(){
        return (this.state.videoPlayermeasurements && this.state.questionSolutionPressedFlag ? this.state.videoPlayermeasurements.y : 0);
    }

    courseWorkQuestion(content) {
        let {title, questionDescription, question, options} = content;
        questionDescription = katex.render(questionDescription);
        question = katex.render(question);
        let renderContainer = (optionNodes) => {
            return <View>{optionNodes}</View>;
        }

        let renderSolutionButton = () => {
            return (<View style={[styles.SubmitAnswerContentView, { paddingLeft: 25 }]}>
                <Button
                    label="Solution"
                    styles={{ button: this.state.questionSolutionPressedFlag ? styles.disabledSubmit : styles.activeSubmit, label: styles.submitAnswerButton }}
                    onPress={() => this.showQuestionSolution()}
                    disabled={this.state.questionSolutionPressedFlag ? true : false}
                />
            </View>)
        }

        let renderOption = (option, selected, onSelect, index) => {
            const selectedStyle = `font-weight: 400; font-family: sans-serif; font-size: 15px; color:green;`;
            const nonSelectedStyle = `font-weight: 400; font-family: sans-serif; font-size: 15px; color:rgb(136,136,136);`;
            let optionValue = katex.render(option.value);
            let contentStyle = { borderRadius: 2, borderWidth: 2, borderColor: 'rgb(243,243,243)', backgroundColor: 'rgb(243,243,243)', paddingBottom: 8 };
            return (
                <TouchableWithoutFeedback onPress={onSelect} key={index} >
                    <View >
                        <CourseWorkViewWithTitle contentViewStyle={selected? {...contentStyle, borderColor: 'green'}: contentStyle} content={optionValue} commonHtmlStyle={selected ? selectedStyle : nonSelectedStyle} />
                    </View>
                </TouchableWithoutFeedback>
            );
        };

        let courseWorkAnswer = () => {
            const selectedOption = this.getSelectedOption();
            const correctAnswer = this.getCorrectAnswer();
            const isOptionCorrect = selectedOption.id === correctAnswer.id;
            const correctAnswerValue = katex.render(correctAnswer.value);
            const selectedOptionValue = katex.render(selectedOption.value);
            const correctAnswerUI = `font-weight: 400; font-family: sans-serif; font-size: 15px; color:green; `;
            const inCorrectAnswerUI = `font-weight: 400; font-family: sans-serif; font-size: 15px; color:red; `;
            let contentStyle = { borderRadius: 2, borderWidth: 2, borderColor: 'rgb(243,243,243)', backgroundColor: 'rgb(243,243,243)', paddingBottom: 8};
            
            return (
                <View style={styles.footerGap}>
                    <CourseWorkViewWithTitle
                        title={isOptionCorrect ?
                            <Text>Answer : <Text style={styles.correctAnswer}>YOUR ANSWER IS CORRECT</Text></Text>
                            : <Text>Answer : <Text style={styles.incorrectAnswer}>YOUR ANSWER IS INCORRECT</Text></Text>} />
                    <View style={{}}>
                        <Text style={{ color: '#888', fontWeight:'500', fontSize: 16, padding:10, paddingTop:20, paddingLeft:25 }}>Correct Answer:</Text>
                        <View style={styles.optionView}>
                            <CourseWorkViewWithTitle content={correctAnswerValue} commonHtmlStyle={correctAnswerUI} contentViewStyle={{...contentStyle,marginHorizontal: 25}} />
                        </View>
                        <Text style={{ color: '#888', fontWeight:'500', fontSize: 16, padding:10, paddingTop:20, paddingLeft:25 }}>Your Answer:</Text>
                        <View style={[styles.optionView, { marginBottom: 20 }]}>
                            <CourseWorkViewWithTitle content={selectedOptionValue} commonHtmlStyle={isOptionCorrect ? correctAnswerUI : inCorrectAnswerUI} contentViewStyle={{ ...contentStyle,marginHorizontal: 25}} />
                        </View>
                        <View onLayout={({ nativeEvent }) => {
                            this.setState({ videoPlayermeasurements: nativeEvent.layout })
                        }} >
                            {this.shouldShowVideoSolution() ? renderSolutionButton() : <View />}
                            {this.state.questionSolutionPressedFlag ? this.courseWorkSolution(this.getVideoSolution()) : <View />}
                        </View>
                    </View>
                </View>
            );
        };

        return (
            <View>
                <CourseWorkViewWithTitle title={title} content={questionDescription} />
                <CourseWorkViewWithTitle content={question} />
                <RadioButtons
                    options={options}
                    onSelection={this.setSelectedOption.bind(this)}
                    selectedOption={this.getSelectedOption()}
                    renderOption={renderOption}
                    renderContainer={renderContainer}
                    testOptionalEqual={(selectedOption, currentOption)=>currentOption.id === selectedOption.id}
                />
                <View onLayout={({nativeEvent}) => {
                        this.setState({
                            measurements: nativeEvent.layout
                        })
                    }} >

                    <View style={[styles.SubmitAnswerContentView, {paddingLeft:25}]}>
                        <Button 
                            label="SUBMIT YOUR ANSWER"
                            styles={{ button: this.isSubmitButtonDisabled() ? styles.disabledSubmit : styles.activeSubmit, label: styles.submitAnswerButton }}
                            onPress={() => this.submitAnswer()}
                            disabled={this.isSubmitButtonDisabled()}
                        />
                    </View>
                    {this.showAnswer() ? courseWorkAnswer() : <View></View>}
                </View>
            </View>
        );
    }

    setSelectedOption(selectedOption) {
        if (this.answerIsSubmitted()) {
            return;
        }
        this.setState({
            selectedOption
        });
    }

    isSubmitButtonDisabled() {
        return !this.canSubmitAnswer();
    }

    showAnswer(){
        return this.answerIsSubmitted();
    }

    canSubmitAnswer() {
        return !this.answerIsSubmitted() && this.state.selectedOption.id !== undefined;
    }

    trackSelectedOption() {
        let pageActivity = this.getPageActivity();
        pageActivity.submittedOption = {
            id: this.state.selectedOption.id,
        };
        courseWorkService.setPageActivity(this.state.page.id, JSON.stringify(pageActivity));
    }

    submitAnswer() {

        if(!this.canSubmitAnswer())
            return;
        
        this.trackSelectedOption();
        const selectedOption = this.getSelectedOption();
        const correctAnswer = this.getCorrectAnswer();
        // soundService.playSound( selectedOption.id ==correctAnswer.id ? soundKeyConstants.SUBMIT_ANSWER_CORRECT_SOUND : soundKeyConstants.SUBMIT_ANSWER_INCORRECT_SOUND)
        this.setState({ 
            answerSubmittedFlag: true,
            correctAnswer: this.getCorrectAnswer()
        });
    
    }
}
export default CourseWork = CourseWork