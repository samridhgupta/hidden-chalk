import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ActivityIndicator, 
    View
} from 'react-native';
import tapThrottle from '../../libs/tapThrottle';
import TouchableView from './TouchableView'

class Button extends Component {
    constructor(props) {
        super(props);
    }

    onButtonClick() {
        if (this.props.onPress) {
            this.props.onPress();
        }
    }

    getContent() {
        if (this.props.children) {
            return this.props.children;
        }

        return (
            <View style={{ padding: 10 }}>
                {this.props.isLoading ? (
                    <ActivityIndicator
                        animating={true}
                        color="black"
                        size="small"
                        style={[{ height: 8 }]} />
                )
                    : (
                        <Text style={this.props.styles.label}>{this.props.label}</Text>
                    )
                }
            </View>
        );
    }

    isTouchDisabled(){
        return this.props.disabled || this.props.isLoading;
    }

    render() {
        return (
            <TouchableView
                underlayColor={this.props.underlayColor || "#EEEEEE"}
                onPress={this.onButtonClick.bind(this)}
                disabled={this.isTouchDisabled()}
                removeClippedSubviews={false}
                style={[
                    styles.button,
                    this.props.styles ? this.props.styles.button : '']}>
                {this.getContent()}
            </TouchableView>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50
    },
});

export default Button;