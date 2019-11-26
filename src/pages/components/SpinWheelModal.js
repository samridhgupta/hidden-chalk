import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import Buttonp from './Button';
import SpinWheel from './SpinWheel';
import Modal from 'react-native-modalbox';
import IconEntypo from 'react-native-vector-icons/Entypo';
import {Button} from 'native-base';
import soundService  from '../../services/sound-service';
import {soundKeyConstants} from '../../config/soundData';

const options = [
  { "id": 0, "value": "40", "name":"UBER" },
  { "id": 1, "value": "15", "name":"iTunes" },
  { "id": 2, "value": "30", "name":"SUBWAY" },
  { "id": 3, "value": "20", "name":"STARBUCKS" },
  { "id": 4, "value": "15", "name":"UBER" },
  { "id": 5, "value": "50", "name":"iTunes" },
  { "id": 6, "value": "20", "name":"SUBWAY" },
  { "id": 7, "value": "30", "name":"STARBUCKS" },
  ]

const defaultSpinImage = require('../../media/spinImage.png');

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#65b4ce',
    padding: 30
  },
  imagecontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center'
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignSelf: 'center'
  },
  submit: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 300
  },
  buttonBlackText: {
    fontSize: 15,
    color: '#595856',
    fontWeight: 'bold'
  },
  bottomContainer: {
    flex: 0
  }
});
class SpinWheelModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canSpin: true,
            showSpin: true,
            showResult: false,
            finalResult: 0,
            spinDuration: 0
        };
        this.refs.modalView
        this.getSoundDuration(soundKeyConstants.SPINWHEEL_SPIN_SOUND);
    }

    getSpinImage() {
        return defaultSpinImage;
    }

    getSoundDuration(soundKey){
        var sound = soundService.getSound(soundKey, (err)=> {
            if(err) return ;
            var soundDuration = sound.getDuration();
            this.setState({spinDuration: soundDuration});
        })
    }

    render() {

        return (
            <Modal
                style={{ backgroundColor: "rgba(255,255,255,1)"  }}
                ref='modalView'
                swipeToClose={true}
                onClosed={this.onModalClose.bind(this)} >
                <TouchableWithoutFeedback onPress={()=> this.closeModal() } style={{ alignSelf:'center' }}>
                <IconEntypo style={{ fontSize: 30, alignSelf: 'flex-end', marginRight: 15, paddingTop:20 }} name="cross" color="#888"/>
                </TouchableWithoutFeedback>
                
                {this.state.showSpin &&
                    (<View style={{ alignSelf:'center', alignItems: 'center' }}>
                        <SpinWheel
                            canSpin = {this.state.canSpin}
                            image={this.getSpinImage()}
                            winningOption={this.getWinningOptionIndex.bind(this)}
                            spinStart={this.spinStarted.bind(this)}
                            spinStop={this.spinStopped.bind(this)}
                            spinDuration={this.state.spinDuration}
                       ref="spin" />
                        <View style={{ paddingTop: 15 }}>
                            <Buttonp
                                label={"Spin And Win"}
                                styles={{ button: [styles.submit,{backgroundColor:"#FFF", borderRadius:5, borderColor:"#CCC", borderWidth:1}], 
                                            label: [styles.buttonBlackText,{color:"#888", fontWeight:"700"}] }}
                                onPress={() => this.spinTheWheel()} />
                        </View>
                    </View>)
                }
                
                {this.state.showResult && 
                    (<View style={{justifyContent:'center', alignItems: 'center'}}>
                        <Text style={{padding:20, fontSize:24, fontWeight:"bold", color:"green"}}>CONGRATULATIONS !!!</Text>
                        <Text style={{paddingBottom:20, fontSize:18, fontWeight:"600", color:"gray"}}>
                            You have won 
                            <Text style={{fontWeight:"800", color:"#0965b4ce"}}> ${options[this.state.finalResult]["value"]}</Text> from
                            <Text style={{fontWeight:"800", color:"#0965b4ce"}}> {options[this.state.finalResult]["name"]}</Text>
                        </Text>
                        <Button style={{alignSelf: 'center', marginTop: 15}} info onPress={()=>this.closeModal()}>
                            <Text style={{color: 'white'}}>Continue</Text>
                        </Button>
                    </View>)
                }
            </Modal>
        );
    }

    onModalClose() {
        this.resetFlags();
        this.modalCloseCallback && this.modalCloseCallback();
    }

    resetFlags() {
        this.setState({showSpin: true, canSpin: true, showResult: false, finalResult: 0});
    }

    setModalCloseCallback(callback) {
        this.modalCloseCallback = callback;
    }

    spinStarted() {
        this.setState({canSpin: false});
    }

    spinStopped() {
        let timeoutId = setTimeout(()=>{
            soundService.playSound(soundKeyConstants.SPINWHEEL_REWARD_SOUND);
            this.setState({showSpin: false, showResult: true});
        }, 1000);

        this.setState({timeoutId});
    }

    componentWillUnmount() {
        this.state.timeoutId && clearTimeout(this.state.timeoutId);
    }

    spinTheWheel() {
        if(!this.state.canSpin)
        return;
        soundService.playSound(soundKeyConstants.SPINWHEEL_SPIN_SOUND);

        this.refs.spin.rollTheWheel();
    }

    closeModal(){
        soundService.playSound(soundKeyConstants.SPINWHEEL_CLOSE_SOUND);
        this.refs.modalView.close();
    }

    openModal() {
        
        this.refs.modalView.open();
    }

    getWinningOptionIndex(){
        let option = this.randomize(0,options.length-1);
        this.setState({ finalResult: option });
        return option;
    }

    randomize(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
export default SpinWheelModal;