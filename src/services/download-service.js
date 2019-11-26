import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
const rootDirPath = RNFS.DocumentDirectoryPath;
import RNFetchBlob from 'rn-fetch-blob';
class DownloadService {
  /*
   * Function to create root directory in document directory path for all downloaded courses
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 04/05/2018
   * Last Modification by: Mohit Choudhary
   */
  createRootCourseDir() {
    let path = this.getCourseRootDirPath();
    this.isDirOrFileExist(path).then(success => {
      console.log(' Course root dir exist Status:::', success);
      if (!success) {
        this.createNewDir(path);
      } else {
        console.log(
          'Download-Service->checkCourseRootDirectory ::: Course root dir already exist',
        );
      }
    });
  }
  /*
   * Function to get root directory path in document directory path for all downloaded courses
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 04/05/2018
   * Last Modification by: Mohit Choudhary
   */
  getCourseRootDirPath() {
    return `${rootDirPath}/allCourses`;
  }

  getCourseMediaRootDirPath() {
    return Platform.OS == 'ios'
      ? `${RNFS.LibraryDirectoryPath}/Caches/allCourses`
      : this.getCourseRootDirPath();
  }

  /*
   * Function to create new directory at provided path
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 04/05/2018
   * Last Modification by: Mohit Choudhary
   * Params:
   *   1. path -  String; path for new dir
   */
  createNewDir(path) {
    console.log(`%%%%%%% Creating Directory at - ${path}`);
    RNFS.mkdir(path)
      .then(() => {
        console.log(`Directory created at - ${path}`);
      })
      .catch(err => {
        console.log(`Error in  DownloadService->createNewDir  - ${err}`);
      });
  }

  /*
   * Function to create new directory at provided path
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 04/05/2018
   * Last Modification by: Mohit Choudhary
   * Params:
   *   1. path -  String; path for new dir
   */
  createNewDirWithPromise(path) {
    console.log(`%%%%%%% Creating Directory at - ${path}`);

    return new Promise((resolve, reject) => {
      RNFS.mkdir(path)
        .then(() => {
          console.log(`Directory created at - ${path}`);
          resolve();
        })
        .catch(err => {
          console.log(`Error in  DownloadService->createNewDir  - ${err}`);
          reject(err);
        });
    });
  }

  /*
   * Function to check directory/file exists at provided path
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 03/05/2018
   * Last Modification by: Mohit Choudhary
   * Params:
   *   1. path -  String; path of directory
   */
  isDirOrFileExist(path) {
    console.log(`checking for path -${path}`);
    return new Promise((resolve, reject) => {
      RNFS.exists(path)
        .then(success => {
          if (success) {
            console.log('****Path exist*****');
            // return true
            resolve(true);
          } else {
            console.log('****Path does not exist*****');
            // return false
            resolve(false);
          }
        })
        .catch(err => {
          // console.log(`Error in  DownloadService->isDirOrFileExist  - ${err}`);
          reject(err);
        });
    });
  }

  /*
   * Function to create new file at provided path
   * Created On: 03/05/2018
   * Created By: Mohit Choudhary
   * Last Modification: 04/05/2018
   * Last Modification by: Mohit Choudhary
   * Params:
   *   1. path -  String; path for new dir
   *   2. filename - String; name of the file with extension
   *   3. data - String; data to be written
   *   4. encoding - String; encoding type like utf8, ascii... (optional)
   */
  createFile(filePath, data, encoding) {
    let fileDir = filePath
      .split('/')
      .slice(0, -1)
      .join('/');
    return RNFS.mkdir(fileDir).then(() =>
      RNFS.writeFile(filePath, data, encoding),
    );
  }

  deleteDirOrFile(path) {
    return new Promise((resolve, reject) => {
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED at - ', path);
          resolve();
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log('Unable to delete file:: ', err.message);
          reject(err);
        });
    });
  }

  downloadFileToPath(url, filePath) {
    const {config, fs} = RNFetchBlob;
    let options = {
      path: filePath,
    };
    return config(options).fetch('GET', url);
  }

  getFileData(path, encoding = 'utf8') {
    return RNFS.readFile(path, encoding).then(data => JSON.parse(data));
  }

  getCourseFilePath(courseId) {
    return `${this.getCourseRootDirPath()}/${courseId}/course.json`;
  }

  getAllCoursesPath() {
    return `${this.getCourseRootDirPath()}/allCourses.json`;
  }

  getModulesFilePath() {
    return `${this.getCourseRootDirPath()}/modules.json`;
  }

  getSectionsFilePath() {
    return `${this.getCourseRootDirPath()}/sections.json`;
  }

  getPagesFilePath() {
    return `${this.getCourseRootDirPath()}/pages.json`;
  }

  getKatexLocalFilePath() {
    return `${rootDirPath}/katex.min.css`;
  }

  appendFileData(path, data) {}
}

export default new DownloadService();
