import ReachabilityService from '../services/reachability-service';
import NetworkServices from '../services/network-services';
import DownloadService from '../services/download-service';
import Constants from '../Utilities/constants';
import utility from '../Utilities/utility';
import * as BBPromise from 'bluebird';
import cloudfrontConfig from '../config/aws/cloudfront-config';

class ContentService {
  constructor() {
    this.sectionData = null;
  }

  getCourseContent() {
    return BBPromise.resolve(this._getCoursesOnline())
      .tap(({courses}) => this._saveCoursesOffline(courses))
      .tap(({modules}) => this._saveModulesOffline(modules))
      .tap(({sections}) => this._saveSectionsOffline(sections))
      .tap(() => this.fetchAndSaveKatexCSS())
      .then(({courses}) => courses)
      .catch(err => this._getCoursesOffline());
  }

  getModuleContent() {
    return this._getModulesOffline();
  }

  getSectionContent() {
    return this._getSectionsOffline();
  }

  getPageContent() {
    return this._getAllCoursesPagesOnline()
      .tap(pages => this._saveAllCoursesPagesOffline(pages))
      .catch(err => this._getAllCoursesPagesOffline());
  }

  _getCoursesOnline() {
    return ReachabilityService.checkNetworkConnection()
      .then(isConnected => {
        if (isConnected) return NetworkServices.getMyCourses();
        throw new Error(ReachabilityService.NO_CONNECTION_MESSAGE());
      })
      .then(courseData => {
        let parsedCourseData = this._parseOnlineCourseData(courseData);
        let parsedModuleData = this._parseOnlineModuleData(courseData);
        let parsedSectionData = this._parseOnlineSectionData(courseData);
        return {
          courses: parsedCourseData,
          modules: parsedModuleData,
          sections: parsedSectionData,
        };
      });
  }

  _getAllCoursesPagesOnline() {
    return BBPromise.resolve(this._getCoursesOffline()).reduce((prev, next) => {
      return this._getCoursePagesOnline(next.id).then(pages => ({
        ...prev,
        ...pages,
      }));
    }, {});
  }

  _getCoursePagesOnline(courseId) {
    return ReachabilityService.checkNetworkConnection().then(isConnected => {
      if (isConnected) return NetworkServices.getPageData(courseId);
      throw new Error(ReachabilityService.NO_CONNECTION_MESSAGE());
    });
  }

  _getAllCoursesPagesOffline() {
    return DownloadService.getFileData(DownloadService.getPagesFilePath());
  }

  _saveAllCoursesPagesOffline(pages) {
    return DownloadService.createFile(
      DownloadService.getPagesFilePath(),
      JSON.stringify(pages),
      'utf8',
    );
  }

  _saveCoursesOffline(courses) {
    return DownloadService.createFile(
      DownloadService.getAllCoursesPath(),
      JSON.stringify(courses),
      'utf8',
    );
  }

  _saveModulesOffline(modules) {
    return DownloadService.createFile(
      DownloadService.getModulesFilePath(),
      JSON.stringify(modules),
      'utf8',
    );
  }

  _saveSectionsOffline(sections) {
    return DownloadService.createFile(
      DownloadService.getSectionsFilePath(),
      JSON.stringify(sections),
      'utf8',
    );
  }

  _getCoursesOffline() {
    let pathForCourseFile = DownloadService.getAllCoursesPath();
    return DownloadService.getFileData(pathForCourseFile).then(
      courseDataFromLocal => {
        return courseDataFromLocal;
      },
    );
  }

  _getModulesOffline() {
    let pathForModuleFile = DownloadService.getModulesFilePath();
    return DownloadService.getFileData(pathForModuleFile).then(
      moduleDataFromLocal => {
        return moduleDataFromLocal;
      },
    );
  }

  _getSectionsOffline() {
    let pathForSectionFile = DownloadService.getSectionsFilePath();
    return DownloadService.getFileData(pathForSectionFile).then(
      sectionDataFromLocal => {
        return sectionDataFromLocal;
      },
    );
  }

  _parseOnlineCourseData(courseData) {
    return courseData.map(course => {
      return {
        id: course.id.S,
        name: course.name.S,
        description: course.description.S,
        author: course.author.S,
        isNew: true,
        startModuleId: course.modules.L[0].M.id.S,
        imageUri: course.imageUri.S,
      };
    });
  }

  _parseOnlineModuleData(courseData) {
    let moduleData = [];
    courseData.map(course => {
      moduleData = moduleData.concat(
        this.getModuleObject(course.modules.L, course.id.S),
      );
    });
    return moduleData;
  }

  _parseOnlineSectionData(courseData) {
    let sectionData = [];
    courseData.map(course => {
      sectionData = sectionData.concat(this.getSectionObject(course.modules.L));
    });
    return sectionData;
  }

  fetchAndSaveKatexCSS() {
    const katexCssUrl = `${cloudfrontConfig.publicBase}/assets/katex/dist/katex.min.css`;
    return DownloadService.downloadFileToPath(
      katexCssUrl,
      DownloadService.getKatexLocalFilePath(),
    );
  }

  checkDownloadedCoursesById(courseId) {
    return utility
      .getState(Constants.downloadContentsKeys.DOWNLOADED_COURSES)
      .then(data => {
        console.log('downloaded data from async store', data);
        if (data != null && data == courseId) {
          console.log('downloaded data from async store::true::', data);
          return true;
        } else {
          console.log('downloaded data from async store::false::', data);
          return false;
        }
      });
  }

  getModuleObject(modules, courseId) {
    var _order = 0;
    var moduleArray = modules.map(module => {
      _order = _order + 1;
      return {
        id: module.M.id.S,
        name: module.M.name.S,
        courseId: courseId,
        order: _order,
        startSectionId: module.M.section.L[0].M.id.S,
      };
    });
    return moduleArray;
  }

  getSectionObject(modules) {
    var sectionArray = [];
    modules.map(module => {
      var order = 1;
      let sections = module.M.section.L;
      var _sections = sections.map(sec => {
        var _sec = {};
        _sec.id = sec.M.id.S;
        _sec.order = order;
        _sec.moduleId = module.M.id.S;
        _sec.name = sec.M.name.S;
        _sec.startPageId = sec.M.startPageId.S;
        order = order + 1;
        return _sec;
      });
      sectionArray = sectionArray.concat(_sections);
    });
    return sectionArray;
  }
}
export default new ContentService();
