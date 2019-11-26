import contentService from './content-service';
import DownloadService from './download-service';
import async from 'async-es';
import RNFS from 'react-native-fs';
import * as BBPromise from 'bluebird';
import DownloadManager from './download-manager-service';
import {moduleService} from './course-module-service';
import {sectionService} from './course-section-service';
import {coursePageService} from './course-page-service';
import mediaList from '../models/json-models/mediaList';

class DownloadMediaService {
  constructor() {
    this.downloadQueue = null;
    this.queueConcurrencyCount = 3;
    this.mediaList = mediaList;
  }

  getCourseMediaDirPath(courseId) {
    return `${DownloadService.getCourseMediaRootDirPath()}/${courseId}/media`;
  }

  getCourseMediaFilePath(courseId) {
    return `${DownloadService.getCourseMediaRootDirPath()}/${courseId}/media.json`;
  }

  getCourseModulesToDownloadFilePath(courseId) {
    return `${DownloadService.getCourseMediaRootDirPath()}/${courseId}/modules-to-download.json`;
  }

  createRootMediaDir(courseId) {
    let path = this.getCourseMediaDirPath(courseId);
    return DownloadService.isDirOrFileExist(path).then(success => {
      console.log(' Course root dir exist Status:::', success);
      if (!success) {
        return DownloadService.createNewDir(path);
      } else {
        console.log(
          'Download-Service->checkCourseRootDirectory ::: Course root dir already exist',
        );
      }
    });
  }

  getMediaUrlById(mediaId, type) {
    return type == 'video'
      ? `https://d19x5vjux8ge1s.cloudfront.net/${mediaId}/mp4/1080p30/index.mp4`
      : `https://d19x5vjux8ge1s.cloudfront.net/${mediaId}/image.png`;
  }

  getExtensionForURL(url) {
    return /[.]/.exec(url) ? /[^.]+$/.exec(url) : undefined;
  }

  checkFileExists(mediaData) {
    var url = this.getMediaUrlById(mediaData.id, mediaData.type);
    var ext = this.getExtensionForURL(url);
    ext = '.' + ext[0];
    var filePath =
      ext == '.mp4'
        ? `${this.getCourseMediaDirPath(mediaData.courseId)}/${
            mediaData.id
          }/index${ext}`
        : `${this.getCourseMediaDirPath(mediaData.courseId)}/${
            mediaData.id
          }/image${ext}`;
    return RNFS.exists(filePath);
  }

  getMediaById(mediaGuid, courseId) {
    return new Promise((resolve, reject) => {
      if (this.mediaList.length < 1) {
        this.getMediaFileData(courseId)
          .then(mediaListData => {
            this.mediaList = mediaListData;
            var mediaData =
              mediaListData[
                mediaListData.findIndex(item => item.id == mediaGuid)
              ];
            console.log('medai:::::::;', mediaData);
            return this.checkFileExists(mediaData);
          })
          .then(value => {
            if (value) {
              var media = this.mediaList[
                this.mediaList.findIndex(item => item.id == mediaGuid)
              ];
              var ext = this.getExtensionForURL(
                this.getMediaUrlById(media.id, media.type),
              );
              ext = '.' + ext[0];
              resolve(`${this.getMediaLocalPath(media, ext)}`);
            } else {
              resolve('');
            }
          });
      } else {
        var mediaData = this.mediaList[
          this.mediaList.findIndex(item => item.id == mediaGuid)
        ];
        this.checkFileExists(mediaData).then(value => {
          if (value) {
            var media = this.mediaList[
              this.mediaList.findIndex(item => item.id == mediaGuid)
            ];
            var ext = this.getExtensionForURL(
              this.getMediaUrlById(media.id, media.type),
            );
            ext = '.' + ext[0];
            resolve(`${this.getMediaLocalPath(media, ext)}`);
          } else {
            resolve('');
          }
        });
      }
    });
  }

  downloadMediaToPath(url, path) {
    return DownloadService.downloadFileToPath(url, path);
  }

  downloadMediaById(media) {
    var url = this.getMediaUrlById(media.id, media.type);
    var ext = this.getExtensionForURL(url);
    ext = '.' + ext[0];
    // var path = (ext == ".mp4") ?  `${this.getCourseMediaDirPath(media.courseId)}/${media.id}/index${ext}partial` :`${this.getCourseMediaDirPath(media.courseId)}/${media.id}/image${ext}partial`
    var path = `${this.getMediaLocalPath(media, ext)}partial`;

    return this.downloadMediaToPath(url, path).then(res => {
      console.log('Downloaded:::', res.path());
      return RNFS.moveFile(res.path(), res.path().slice(0, -7)).catch(err => {
        console.log('Error on moving file:: ', err);
      });
    });
  }

  getMediaLocalPath(media, ext) {
    return ext == '.mp4'
      ? `${this.getCourseMediaDirPath(media.courseId)}/${media.id}/index${ext}`
      : `${this.getCourseMediaDirPath(media.courseId)}/${media.id}/image${ext}`;
  }

  pushItemsToDownloadQueue(mediaList) {
    console.log('Start Download Queue');

    DownloadManager.pushItemsToDownloadQueue(mediaList);
  }

  getMediaDownloadProgress(courseId) {
    return this.getMediaFileData(courseId)
      .then(allModuleMediaList => {
        var promises = allModuleMediaList.map(mediaObj => {
          return this.checkFileExists(mediaObj).then(fileExist => {
            var _mediaObj = mediaObj;
            _mediaObj.fileExist = fileExist;
            return _mediaObj;
          });
        });
        return Promise.all(promises);
      })
      .then(results => {
        return contentService.getModuleContent().then(modulesListData => {
          var workerList = DownloadManager.getRemainingDownloadingItems();
          return modulesListData.map(mod => {
            var _mod = mod;
            _mod.moduleId = _mod.id;
            var totalModuleMedia = results.filter(
              res => res.moduleId == _mod.id,
            );
            var totalDownloadedMedia = totalModuleMedia.filter(
              res => res.fileExist,
            );
            _mod.downloadingMedia = workerList.filter(
              res => res.media.moduleId == _mod.id,
            );
            _mod.downloadingMediaCount = _mod.downloadingMedia.length;
            _mod.totalMedia = totalModuleMedia.length;
            _mod.downloadedMedia = totalDownloadedMedia.length;
            _mod.key = _mod.order;
            delete _mod.id;
            delete _mod.startSectionId;
            return _mod;
          });
        });
      })
      .then(result => {
        return contentService._getCoursesOffline().then(courses => {
          return courses.map(course => {
            var _course = course;
            _course.modules = result.filter(res => (res.courseId = course.id));
            delete _course.description;
            delete _course.imageUri;
            delete _course.author;
            delete _course.isNew;
            delete _course.startModuleId;
            return _course;
          });
        });
        // console.log("Result ::", result)
      });
  }

  deleteFullCourseMedia(courseId) {
    return this.removeCourseToDownload(courseId).then(() =>
      DownloadService.deleteDirOrFile(
        `${this.getCourseMediaDirPath(courseId)}`,
      ),
    );
  }

  checkAndDeleteMediaById(mediaData) {
    var url = this.getMediaUrlById(mediaData.id, mediaData.type);
    var ext = this.getExtensionForURL(url);
    ext = '.' + ext[0];
    var filePath =
      ext == '.mp4'
        ? `${this.getCourseMediaDirPath(mediaData.courseId)}/${
            mediaData.id
          }/index${ext}`
        : `${this.getCourseMediaDirPath(mediaData.courseId)}/${
            mediaData.id
          }/image${ext}`;
    return RNFS.exists(filePath).then(fileExists => {
      if (fileExists) {
        console.log('Deleting media file ::', filePath);
        return DownloadService.deleteDirOrFile(
          `${this.getCourseMediaDirPath('uVJk4HanQ0KSHJ2AXfcL9w')}/${
            mediaData.id
          }`,
        ).catch(err => {
          console.log('Media Delete Failed :', mediaData, err);
        });
      } else {
        return Promise.resolve();
      }
    });
  }

  removeModuleToDownload(moduleToDownload) {
    return this.getModulesToDownloadData(moduleToDownload.courseId)
      .then(modulesToDownload => {
        const moduleIndex = modulesToDownload.findIndex(module => {
          return (
            module.moduleId === moduleToDownload.moduleId &&
            module.courseId === moduleToDownload.courseId
          );
        });
        if (moduleIndex !== -1) {
          modulesToDownload.splice(moduleIndex, 1);
        }
        return modulesToDownload;
      })
      .then(updatedModulesToDownload => {
        return this.saveModulesToDownloadData(
          moduleToDownload.courseId,
          updatedModulesToDownload,
        );
      });
  }

  removeCourseToDownload(courseId) {
    return DownloadService.deleteDirOrFile(
      `${this.getCourseModulesToDownloadFilePath(courseId)}`,
    );
  }

  deleteMediaForModule(moduleData) {
    return this.removeModuleToDownload({
      moduleId: moduleData.moduleId,
      courseId: moduleData.courseId,
    })
      .then(() => this.getMediaFileData(moduleData.courseId))
      .then(allModuleMediaList => {
        var promises = allModuleMediaList.map(mediaObj => {
          if (mediaObj.moduleId == moduleData.moduleId) {
            return this.checkAndDeleteMediaById(mediaObj);
          }
        });
        return Promise.all(promises);
      })
      .then(results => {
        console.log('Delete Process Complete');
      });
  }

  getMediaFileData(courseId) {
    return Promise.resolve(mediaList);
  }

  getMediaListForCourse(courseId) {
    return moduleService
      .getCourseModulesAsync(courseId)
      .map(module => ({moduleId: module.id, courseId: courseId}))
      .each(moduleToDownload => this.insertModuleToDownload(moduleToDownload))
      .then(() => this.getMediaFileData(courseId))
      .then(data => {
        this.mediaList = data;
        this.pushItemsToDownloadQueue(data);
      });
  }

  getDownloadingStatusForModule(moduleId) {
    var workingList = DownloadManager.getRemainingDownloadingItems();
    return workingList.filter(res => res.media.moduleId == moduleId).length > 0;
  }

  insertModuleToDownload(moduleToDownload) {
    return this.getModulesToDownloadData(moduleToDownload.courseId)
      .then(modulesToDownload => {
        const moduleFound = modulesToDownload.find(module => {
          return module.moduleId === moduleToDownload.moduleId;
        });
        if (!moduleFound) {
          modulesToDownload.push(moduleToDownload);
        }
        return modulesToDownload;
      })
      .then(updatedModulesToDownload => {
        return this.saveModulesToDownloadData(
          moduleToDownload.courseId,
          updatedModulesToDownload,
        );
      });
  }

  getModulesToDownloadData(courseId) {
    let pathForMediaFile = this.getCourseModulesToDownloadFilePath(courseId);
    return DownloadService.getFileData(pathForMediaFile).catch(err => []);
  }

  saveModulesToDownloadData(courseId, modulesToDownload) {
    return DownloadService.createFile(
      this.getCourseModulesToDownloadFilePath(courseId),
      JSON.stringify(modulesToDownload),
      'utf8',
    );
  }

  getMediaListForModule(moduleData) {
    var _moduleId = moduleData.id;
    var _courseId = moduleData.courseId;
    const moduleToDownload = {moduleId: _moduleId, courseId: _courseId};
    return this.insertModuleToDownload(moduleToDownload).then(() =>
      this.resumeDownloads(moduleToDownload),
    );
  }

  resumeDownloads(moduleToDownload) {
    return this.getMediaFileData(moduleToDownload.courseId)
      .then(mediaList => {
        this.mediaList = mediaList;
        return mediaList.filter(
          media => media.moduleId === moduleToDownload.moduleId,
        );
      })
      .then(data => {
        this.pushItemsToDownloadQueue(data);
      });
  }

  getPageMedia(pageItem, sectionId, _moduleId, courseId) {
    const regExp = /^([^\/]+)/;
    const mediaList = [];
    if (
      pageItem.type == 'video' &&
      pageItem.content.videoType == 'proprietary'
    ) {
      let regExMatches = pageItem.content.uri.match(regExp);
      if (regExMatches) {
        mediaList.push({
          id: regExMatches[1],
          type: 'video',
          moduleId: _moduleId,
          courseId: courseId,
        });
      }
    }
    if (pageItem.type == 'question') {
      let regExMatches = pageItem.content.solution.uri.match(regExp);
      if (regExMatches) {
        mediaList.push({
          id: regExMatches[1],
          type: 'video',
          moduleId: _moduleId,
          courseId: courseId,
        });
      }
    }

    if (pageItem.type == 'example') {
      let regExMatches = pageItem.content.solution.uri.match(regExp);
      if (regExMatches) {
        mediaList.push({
          id: regExMatches[1],
          type: 'video',
          moduleId: _moduleId,
          courseId: courseId,
        });
      }
    }

    if (pageItem.content.mediaUris != null) {
      var imageURIs = pageItem.content.mediaUris;
      var uriKeys = Object.keys(pageItem.content.mediaUris);
      uriKeys.map(key => {
        var imageURl = imageURIs[key].uriPath;
        let regExMatches = imageURIs[key].uriPath.match(regExp);
        if (regExMatches) {
          mediaList.push({
            id: regExMatches[1],
            type: 'image',
            moduleId: _moduleId,
            courseId: courseId,
          });
        }
      });
    }
    return mediaList;
  }

  initMediaFile(courseId) {
    return BBPromise.resolve(this.createRootMediaDir(courseId))
      .then(() => moduleService.getCourseModulesAsync(courseId))
      .reduce((prevM, module) => {
        return sectionService
          .getModuleSectionsAsync(module.id)
          .reduce((prevS, section) => {
            return coursePageService
              .getSectionPagesAsync(section.id)
              .reduce((prevP, page) => {
                return prevP.concat(
                  this.getPageMedia(page, section.id, module.id, courseId),
                );
              }, [])
              .then(pageMedia => {
                return prevS.concat(pageMedia);
              });
          }, [])
          .then(sectionMedia => {
            return prevM.concat(sectionMedia);
          });
      }, []);
  }

  saveMediaFileForCourse(courseId, mediaData) {
    return DownloadService.createFile(
      this.getCourseMediaFilePath(courseId),
      JSON.stringify(mediaData),
      'utf8',
    );
  }
}

export default new DownloadMediaService();
