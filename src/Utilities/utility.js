import AsyncStorage from '@react-native-community/async-storage';
import Constants from './constants';

class Utility {
  saveState(key, data) {
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem('@hiddenchalkapp:' + key, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  getState(key) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('@hiddenchalkapp:' + key)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  removeState(key) {
    return new Promise((resolve, reject) => {
      AsyncStorage.removeItem('@hiddenchalkapp:' + key)
        .then(() => resolve())
        .catch(() => reject());
    });
  }

  resetState() {
    return new Promise((resolve, reject) => {
      AsyncStorage.clear()
        .then(() => resolve())
        .catch(() => reject());
    });
  }

  saveDownloadedCoursesToAsyncStorage(data) {
    return this.saveState(
      Constants.downloadContentsKeys.DOWNLOADED_COURSES,
      data,
    );
  }

  getDownloadedCoursesFromAsyncStorage() {
    return this.getState(Constants.downloadContentsKeys.DOWNLOADED_COURSES);
  }

  isCompleteCourseDownloaded(courseId) {
    return new Promise((resolve, reject) => {
      this.getDownloadedCoursesFromAsyncStorage().then(downloadedCourse => {
        console.log('Asyncstore: Downloaded courses', downloadedCourse);
        if (downloadedCourse != null) {
          let downloadedCourseArrayObject = JSON.parse(downloadedCourse);
          console.log(
            'Asyncstore: Downloaded courses json parse',
            downloadedCourse,
          );
          let isExist = downloadedCourseArrayObject.indexOf(courseId);
          if (isExist == -1) {
            resolve(false);
          } else {
            resolve(true);
          }
        } else {
          console.log('Asyncstore: Downloaded courses returning false');
          resolve(false);
        }
      });
    });
  }

  addDownloadedCourseToAsyncStorage(courseId) {
    return new Promise((resolve, reject) => {
      this.getDownloadedCoursesFromAsyncStorage().then(downloadedCourse => {
        if (downloadedCourse != null) {
          downloadedCourseArrayObject = JSON.parse(downloadedCourse);
          let isExist = downloadedCourseArrayObject.indexOf(courseId);
          if (isExist == -1) {
            downloadedCourseArrayObject.push(courseId);
            let courseArrayJSON = JSON.stringify(downloadedCourseArrayObject);
            this.saveDownloadedCoursesToAsyncStorage(courseArrayJSON).then(
              data => {
                console.log(
                  'Asyncstore: pusing new data to existing Async store',
                );
                resolve(true);
              },
            );
          } else {
            console.log('Asyncstore: already exist in  Async store');
            resolve(true);
          }
        } else {
          console.log(
            'Asyncstore: Downloaded courses id null',
            downloadedCourse,
          );
          let newCourseArray = [];
          newCourseArray.push(courseId);
          let courseArrayJSON = JSON.stringify(newCourseArray);
          this.saveDownloadedCoursesToAsyncStorage(courseArrayJSON).then(
            data => {
              console.log('Asyncstore: savinf new data to Async store');
              resolve(true);
            },
          );
        }
      });
    });

    let downloadedCourse = this.getDownloadedCoursesFromAsyncStorage();
    if (downloadedCourse) {
      downloadedCourseArrayObject = JSON.parse(downloadedCourse);
      let isExist = downloadedCourseArrayObject.indexOf(courseId);
      if (isExist == -1) {
        downloadedCourseArrayObject.push(courseId);
        let courseArrayJSON = JSON.stringify(downloadedCourseArrayObject);
        this.saveDownloadedCoursesToAsyncStorage(courseArrayJSON);
      } else {
        return true;
      }
    } else {
      let newCourseArray = [];
      newCourseArray.push(courseId);
      let courseArrayJSON = JSON.stringify(newCourseArray);
      this.saveDownloadedCoursesToAsyncStorage(courseArrayJSON);
    }
  }
}

export default new Utility();
