import React, { Component } from 'react';
 
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
 
const CourseWorkView = (props) => {
    return (
        <View style={props.ViewStyle}>
            {props.content}
        </View>     
    );
}
 
const styles = StyleSheet.create({
});
 
export default CourseWorkView;