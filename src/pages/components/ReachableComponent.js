import React, { Component } from 'react';
import reachabilityService from '../../services/reachability-service';
import {
    View,
    Text,
    Animated,
    Easing,
    Dimensions
} from 'react-native';

const window = Dimensions.get('window');

class ReachableComponent extends Component {

    constructor(props){
        super(props);
        this.state = {
            animatedValue: new Animated.Value(0)
        }
        this.reachabilityChange = this.reachabilityChange.bind(this);
        this.checkReachabilityAndSetState = this.checkReachabilityAndSetState.bind(this);
    }

    componentWillMount() {
        this.setState({checkTimer: setInterval(this.checkReachabilityAndSetState, 200)});
    }

    componentWillUnmount() {
        this.state.checkTimer && clearInterval(this.state.checkTimer)
    }

    shouldShowView() {
        const isConnected = this.state.isConnected !== undefined && !this.state.isConnected;
        return isConnected;
    }

    reachabilityChange(isConnected) {
        this.checkReachabilityAndSetState();
    }

    checkReachabilityAndSetState() {
        reachabilityService.checkNetworkConnection()
        .then(isConnected => {
            this.setState({isConnected}, ()=>{
                this.triggerAnimation();
            })
        });
    }

    getReachableText() {
        if(this.shouldShowView())
            return "No Internet Connectivity";
        return "Online";
    }

    getBackgroundColor() {
        if(this.shouldShowView())
            return "#ec8181A0";
        return "#8fd8a7A0";
    }

    triggerAnimation() {
        Animated.timing(this.state.animatedValue, {
            toValue: this.shouldShowView() ? 1 : 0,
            duration: this.shouldShowView()? 300 : 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        }).start();
    }

    getChildView() {
        let height = this.props.height ? this.props.height : 25;
        return (
            <Animated.View style={{ backgroundColor: this.getBackgroundColor(), flexDirection: 'column', justifyContent: 'center', alignContent: 'center', height: height, opacity: this.state.animatedValue }}>
                <Text style={{ color: "white", textAlign: 'center' }}>{this.getReachableText()}</Text>
            </Animated.View>
        );
    }

    render() {
        let width = this.props.width ? this.props.width : window.width;
        return (
            <View style={{position:'absolute', zIndex:100, width: width}}>
                {this.getChildView()}
            </View>
        )
    }

}

export {ReachableComponent};