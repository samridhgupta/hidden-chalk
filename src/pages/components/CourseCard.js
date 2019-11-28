import React, {Component} from 'react';
import {Text, View, Modal, ScrollView, Image, Dimensions} from 'react-native';
import TouchableView from './TouchableView';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import * as Progress from 'react-native-progress';

export class CourseCard extends Component {
  handleItemPress = course => {
    const {onListItemPress} = this.props;
    onListItemPress && onListItemPress(course);
  };

  renderImageView(course) {
    return (
      <Image
        style={{resizeMode: 'cover', minHeight: 150}}
        source={{uri: course.imageUri}}
      />
    );
  }

  getProgressColor(rowData) {
    return this.getProgress(rowData) * 100 < 51
      ? '#ab1d1d'
      : this.getProgress(rowData) * 100 < 76
      ? '#ab9a1d'
      : '#1dab7d';
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
        <Text
          style={{
            fontSize: 18,
            color: '#888',
            fontWeight: '600',
          }}>
          {rowData.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#888',
            fontWeight: '200',
            paddingTop: 5,
            textAlign: 'justify',
          }}>
          {rowData.description +
            ` \n \n This course is a combination of arithmetic and elementary algebra. It includes the arithmetic of integers, fractions, decimals, and percent. In addition, such topics as signed numbers, algebraic representation, operations with polynomials, factoring, the solution of simultaneous linear equations of two variables, and graphing are covered.`}
        </Text>
      </View>
    );
  }

  renderProgress(rowData) {
    return (
      <TouchableView
        onPress={() => {
          this.handleItemPress(rowData);
        }}
        style={{
          padding: 15,
          borderTopColor: '#EEE',
          borderTopWidth: 1,
        }}>
        {!rowData.isFree ? (
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
              BUY COURSE
            </Text>
            <IconIonicons
              name="ios-arrow-dropright-circle"
              size={35}
              color="#1dab7d"
            />
          </View>
        ) : !rowData.studentCourse.isUnlocked ? (
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: '#888',
                fontWeight: '200',
              }}>
              Completed:
              <Text style={{color: '#1d88ab'}}>
                {rowData.studentCourse.completedModules}
                <Text style={{color: '#888'}}>/</Text>
                {rowData.studentCourse.totalModules}
              </Text>
            </Text>
            <View
              style={{
                alignItems: 'flex-end',
                flex: 1,
                overflow: 'hidden',
              }}>
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
      </TouchableView>
    );
  }

  renderHeader = () => {
    const {data, onClosePressed} = this.props;
    return (
      <View
        style={{
          paddingTop: 35,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          borderBottomColor: '#1d88ab',
          borderBottomWidth: 2,
        }}>
        <TouchableView onPress={onClosePressed}>
          <IconIonicons name="ios-arrow-back" size={35} color="#555" />
        </TouchableView>
        <Text
          style={{
            fontSize: 20,
            color: '#666',
            fontWeight: '600',
            textAlign: 'center',
            flex: 1,
            paddingRight: 10,
          }}>
          {data.name}
        </Text>
      </View>
    );
  };

  render() {
    const {isVisible, data, onClosePressed} = this.props;
    if (!isVisible) {
      return null;
    }
    return (
      <Modal
        style={{margin: 10}}
        animationType={'slide'}
        transparent={false}
        visible={isVisible}>
        {this.renderHeader()}
        <ScrollView style={{flex: 1}}>
          <View
            style={{
              backgroundColor: 'green',
              padding: 5,
              margin: 10,
              backgroundColor: '#FDFDFD',
              borderColor: '#DDD',
              borderRadius: 5,
              borderWidth: 1,
              shadowColor: '#DDD',
              shadowOpacity: 0.8,
              shadowRadius: 2,
              shadowOffset: {
                height: 1,
                width: 0,
              },
              elevation: 1,
            }}>
            <View>
              {this.renderImageView(data)}
              {this.renderDownloadOption(data)}
            </View>
            <View>
              {this.renderCourseTitleAndDescription(data)}
              {this.renderProgress(data)}
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  }
}

export default CourseCard;
