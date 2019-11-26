import React, {Component} from 'react';

import {StyleSheet, View, Text, Image, Dimensions} from 'react-native';

import * as Progress from 'react-native-progress';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconOcticons from 'react-native-vector-icons/Octicons';
import {List} from 'native-base';
import TouchableView from './TouchableView';

class StudentDashboardListPortrait extends Component {
  constructor(props) {
    super(props);
  }

  renderImageView(course) {
    return (
      <Image
        style={{resizeMode: 'cover', minHeight: 150}}
        source={{uri: course.imageUri}}
      />
    );
  }

  getProgress(course) {
    let totalModules = course.studentCourse.totalModules;
    if (totalModules === 0) return 0;
    return course.studentCourse.completedModules / totalModules;
  }

  renderDownloadOption(rowData) {
    return (
      this.props.renderDownloadButton &&
      this.props.renderDownloadButton(rowData)
    );
  }

  renderCourseTitleAndDescription(rowData) {
    return (
      <View
        style={{
          flexDirection: 'column',
          padding: 15,
          alignItems: 'flex-start',
        }}>
        {rowData.isNew ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <IconMaterial name="new-box" size={25} color="#1d88ab" />
            <Text
              style={{
                fontSize: 18,
                color: '#888',
                fontWeight: '600',
                paddingLeft: 5,
              }}>
              {rowData.name}
            </Text>
          </View>
        ) : (
          <Text style={{fontSize: 18, color: '#888', fontWeight: '600'}}>
            {rowData.name}
          </Text>
        )}
        <Text
          style={{
            fontSize: 16,
            color: '#888',
            fontWeight: '200',
            paddingTop: 5,
          }}>
          {rowData.description}
        </Text>
      </View>
    );
  }

  renderProgress(rowData) {
    return (
      <View style={{padding: 15, borderTopColor: '#EEE', borderTopWidth: 1}}>
        {!rowData.studentCourse.isUnlocked ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 5,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: '#888',
                fontWeight: '500',
                paddingRight: 10,
              }}>
              START COURSE
            </Text>
            <IconIonicons
              name="ios-arrow-dropright-circle"
              size={35}
              color="#1dab7d"
            />
          </View>
        ) : (
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <Text style={{fontSize: 18, color: '#888', fontWeight: '200'}}>
              Completed:
              <Text style={{color: '#1d88ab'}}>
                {' '}
                {rowData.studentCourse.completedModules}{' '}
                <Text style={{color: '#888'}}>/</Text>{' '}
                {rowData.studentCourse.totalModules}{' '}
              </Text>{' '}
            </Text>
            <View style={{alignItems: 'flex-end', flex: 1, overflow: 'hidden'}}>
              <Progress.Bar
                progress={this.getProgress(rowData)}
                borderWidth={1}
                width={Dimensions.get('window').width * 0.39}
                showsText={true}
                color={this.getProgressColor(rowData)}
              />
            </View>
          </View>
        )}
      </View>
    );
  }

  getProgressColor(rowData) {
    return this.getProgress(rowData) * 100 < 51
      ? '#ab1d1d'
      : this.getProgress(rowData) * 100 < 76
      ? '#ab9a1d'
      : '#1dab7d';
  }

  openListItem(rowData) {
    this.props.onListItemPress && this.props.onListItemPress(rowData);
  }

  render() {
    return (
      <List
        key={this.props.updateKey}
        dataArray={this.props.source}
        renderRow={data => (
          <TouchableView
            onPress={() => this.openListItem(data)}
            underlayColor="#EEEEEE"
            style={{
              backgroundColor: '#FDFDFD',
              marginHorizontal: 15,
              marginBottom: 15,
              borderColor: '#DDD',
              borderRadius: 5,
              borderWidth: 1,
              shadowColor: '#DDD',
              shadowOpacity: 0.8,
              shadowRadius: 2,
              shadowOffset: {height: 1, width: 0},
              elevation: 1,
            }}>
            <View style={{flexDirection: 'column'}}>
              <View>
                {this.renderImageView(data)}
                {this.renderDownloadOption(data)}
              </View>
              <View>
                {this.renderCourseTitleAndDescription(data)}
                {this.renderProgress(data)}
              </View>
            </View>
          </TouchableView>
        )}
      />
    );
  }
}
const styles = StyleSheet.create({});

export default StudentDashboardListPortrait = StudentDashboardListPortrait;
