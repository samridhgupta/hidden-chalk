import React, { Component } from 'react';
import {
    TouchableHighlight,
    TouchableOpacity,
    InteractionManager
} from 'react-native';
import tapThrottle from '../../libs/tapThrottle';

class TouchableView extends Component {
    constructor(props) {
        super(props);
        this.onButtonClick = tapThrottle(this.onButtonClick, 500, this);
        this._TouchElement = this.props.underlayColor ? TouchableHighlight : TouchableOpacity;
    }

    onButtonClick() {
        requestAnimationFrame(()=>{
            this.props.onPress && this.props.onPress();
        });
    }

    render() {
        const TouchElement = this._TouchElement;
        let props = { ... this.props };
        delete props.onPress;
        return (
            <TouchElement {...props} onPress={this.onButtonClick.bind(this)}>
                {this.props.children}
            </TouchElement>
        );
    }
}

export default TouchableView;