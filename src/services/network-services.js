import Utility from '../Utilities/utility';
import Constants from '../Utilities/constants';
import AwsCognito from 'react-native-aws-cognito';
import ReachablityService from '../services/reachability-service';

const apiUrl = 'https://ivwdxixrr9.execute-api.us-east-1.amazonaws.com/dev3';
const apiUrl2 = 'https://ivwdxixrr9.execute-api.us-east-1.amazonaws.com/dev4';

class NetworkService {
  getPageData(courseId) {
    return new Promise((resolve, reject) => {
      return fetch(
        `https://s3.amazonaws.com/hidden-chalk-prod/course-data/${courseId}/course-page.json`,
      )
        .then(res => {
          return res.json();
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => reject(err));
    });
  }

  getMyCourses() {
    // /courses?accesstoken=
    //check if accesstoken still exists if yes then call this api else get session
    return this.getToken().then(accessToken => {
      const endpoint = '/courses' + '?accesstoken=' + accessToken;
      return this.callApi(apiUrl, endpoint);
    });
  }

  getAllCourse() {
    const endpoint = '/course' + '/listCourses' + '/all';
    return this.callApi(apiUrl, endpoint);
  }

  getSelectedCourse(courseId) {
    const endpoint = '/course/getCourse/' + courseId;
    return this.callApi(apiUrl, endpoint);
  }

  getAvailableCourses(userId) {
    const endpoint = '/courses' + '?user=' + userId;
    return this.callApi(apiUrl, endpoint);
  }

  postAddUserToCourse(userEmail, courseId, receiptData) {
    const endpoint = '/users';
    const body = JSON.stringify({
      courses: [courseId],
      emails: [userEmail],
      requestOwner: 'android-app',
      receiptData,
    });
    return this.callApi(apiUrl2, endpoint, body);
  }

  callApi(baseUrl, endpoint, body) {
    const url = `${baseUrl || apiUrl}${endpoint}`;
    return new Promise((resolve, reject) => {
      return fetch(url, {
        method: body ? 'POST' : 'GET',
        headers: {
          Accept: [
            'application/json',
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Amz-Date',
            'X-Api-Key',
            'X-Amz-Security-Token',
          ],
          'Content-Type': 'application/json',
        },
        body: body,
      })
        .then(res => {
          return res.json();
        })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  getToken() {
    return new Promise((resolve, reject) => {
      ReachablityService.checkNetworkConnection().then(status => {
        if (status) {
          console.log(' Connectivity avaialble - fetching token');
          AwsCognito.getCurrentUserSessionAsync().then(session => {
            var {accessToken} = session;
            Utility.saveState(
              Constants.stateKeys.ACCESSTOKEN,
              accessToken,
            ).then(() => {
              resolve(accessToken);
            });
          });
        } else {
          Utility.getState(Constants.stateKeys.ACCESSTOKEN).then(token => {
            // var { accessToken } = userSession
            console.log('No Connectivity - state fetching token', token);
            if (token != null) {
              resolve(token);
            } else {
              AwsCognito.getCurrentUserSessionAsync()
                .then(session => {
                  var {accessToken} = session;
                  console.log('No Connectivity - fetching token', accessToken);
                  Utility.saveState(
                    Constants.stateKeys.ACCESSTOKEN,
                    accessToken,
                  ).then(() => {
                    resolve(accessToken);
                  });
                })
                .catch(err => {
                  console.log('GetSession For TOken Error: ', err);
                  reject(err);
                });
            }
          });
        }
      });
    });
  }
}
export default NetworkService = new NetworkService();
