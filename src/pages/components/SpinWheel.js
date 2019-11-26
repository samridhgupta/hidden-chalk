import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import Button from './Button';
import Modal from 'react-native-modalbox';
import IconEntypo from 'react-native-vector-icons/Entypo';

const window = Dimensions.get('window'); 

class SpinWheel extends Component {
    constructor(props) {
        super(props);
        this.spinValue = new Animated.Value(0)
        this.state = {
            finalRange:0,
            initailRange:0,
        }
    }
    
    rollTheWheel() {
        let iteration = this.randomize(1,5) + 1;
        let option = this.props.winningOption();
        let final = (iteration*360) + (option*45) + this.randomize(10,40);
        console.log("final:::::" + this.props.option);
        this.setState({finalRange: final});
        
        this.spinValue.setValue(0);
        let animation = Animated.timing(
            this.spinValue,
            {
                toValue: 1,
                duration: this.props.spinDuration * 1000,
                easing: Easing.bezier(.02,.0,.38,1)
            }
        );
        this.props.spinStart && this.props.spinStart();
        animation.start(()=>this.props.spinStop && this.props.spinStop());
    }

    randomize(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    onWheelTap() {
        if(this.props.canSpin)
            this.rollTheWheel();
    }

    render() {
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: [this.state.initailRange+'deg', this.state.finalRange+'deg'],
        });
        return (
            <View>
                <IconEntypo style={{ fontSize: 40, alignSelf: 'center', marginBottom: -15 }} name="triangle-down" color="#888" />
                <Animated.View
                    style={{ transform: [{ rotate: spin }] }}>
                    <TouchableWithoutFeedback onPress={()=> this.onWheelTap() }>
                        <Image style={{ width: window.width-20, height: window.width-20 }} source={this.props.image} />
                    </TouchableWithoutFeedback>
                </Animated.View>
            </View>
        );
    }
}    

const styles = StyleSheet.create({
});

export default SpinWheel;