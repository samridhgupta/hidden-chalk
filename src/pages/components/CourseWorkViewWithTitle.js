import React, {Component} from 'react';
import url from 'url';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import cloudfrontConfig from '../../config/aws/cloudfront-config';
import voca from 'voca';
const katexCssUrl = `${cloudfrontConfig.publicBase}/assets/katex/dist/katex.min.css`;
import AutoHeightWebView from 'react-native-autoheight-webview';
import downloadService from '../../services/download-service';

const _html = `%s
    <html id="htmlContent">
        <p style="%s padding:0;">
            <span> %s </span>
        </p>
    </html>
`;

const _htmlNoHyperlink = `%s
    <html id="htmlContent">
        <style>
            a {
                color:rgb(136,136,136);
                text-decoration: none!important;
                pointer-events: none;
            }
        </style>
        <p style="%s padding:0;">
            <span> %s </span>
        </p>
    </html>
`;
const _doctype =
  Platform.OS === 'android'
    ? '<!DOCTYPE html>'
    : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
const commonHtmlStyle = `font-weight:300; font-family:sans-serif; font-size: 18px; color:rgb(136,136,136); backgroundColor:rgba(0,0,0,0);`;

class CourseWorkViewWithTitle extends Component {
  state = {height: 0};

  render() {
    let contentStyle = {
      ...styleObj.contentView,
      height: this.state.height,
    };
    contentStyle = !this.props.contentViewStyle
      ? contentStyle
      : {...contentStyle, ...this.props.contentViewStyle};
    return (
      <View>
        {this.props.title ? (
          <View style={styles.noteView}>
            <Text style={styles.noteText}>{this.props.title} </Text>
          </View>
        ) : (
          <View />
        )}
        {this.props.content ? (
          <View style={contentStyle}>
            <AutoHeightWebView
              ref={ref => (this.webview = ref)}
              scrollEnabled={false}
              style={{
                width: Dimensions.get('window').width - 50,
              }}
              source={{
                html: voca.sprintf(
                  this.checkForHyperlinkInContent(this.props.content)
                    ? _html
                    : _htmlNoHyperlink,
                  _doctype,
                  this.props.commonHtmlStyle
                    ? this.props.commonHtmlStyle
                    : commonHtmlStyle,
                  this.props.content,
                ),
              }}
              files={[
                {
                  href: `${katexCssUrl}`, //`file://${downloadService.getKatexLocalFilePath()}`,
                  type: 'text/css',
                  rel: 'stylesheet',
                },
              ]}
              onLoadStart={this.OnLoadWebview.bind(this)}
              animationDuration={100}
              onSizeUpdated={size => {
                if (this.state.height !== size.height + 25) {
                  this.setState({height: size.height + 25});
                }
              }}
            />
          </View>
        ) : (
          <View />
        )}
      </View>
    );
  }

  shouldLoadUrl(urlString) {
    const parsedURL = url.parse(urlString);
    switch (parsedURL.protocol) {
      case 'https:':
      case 'http:':
        return false;
      default:
        return true;
    }
  }
  checkForHyperlinkInContent(content) {
    let isExist = content.search('</a>');
    if (isExist == -1) {
      return false;
    } else {
      return true;
    }
  }

  OnLoadWebview(event) {
    let nativeEvent = {...event.nativeEvent};
    if (this.shouldLoadUrl(nativeEvent.url)) return;

    this.webview.stopLoading();
    let openLinkPromise = Linking.canOpenURL(nativeEvent.url)
      .then(supported => {
        if (!supported) return Promise.reject({msg: 'cannot open url'});
        return Linking.openURL(nativeEvent.url);
      })
      .catch(() => {});
  }
}

const styleObj = {
  noteView: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  noteText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    justifyContent: 'center',
  },
  contentView: {
    marginHorizontal: 25,
    marginTop: 15,
  },
};
const styles = StyleSheet.create(styleObj);

export default CourseWorkViewWithTitle;
