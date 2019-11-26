import { courseService } from "./course-service";
import DownloadMediaService from "./download-media-service";
import DownloadManager from "./download-manager-service";
import * as BBPromise from 'bluebird';
import Snackbar from 'react-native-snackbar';
class DownloadScreenService {
    
    getAllDownloads() {
        return courseService.getAvailableCoursesAsync()
        .reduce((prev, course) => {
            return DownloadMediaService.getMediaDownloadProgress(course.id)
            .then(downloads => {
                return prev.concat(downloads);
            });
        }, []);
    }

    clearCourseDownloads(courseId) {

    }

    clearCourseModuleDownloads(courseId, moduleId) {

    }

    stopDownloading(modulesToRemove) {
        BBPromise.resolve(modulesToRemove)
        .each(moduleData => DownloadMediaService.removeModuleToDownload({moduleId: moduleData.moduleId, courseId: moduleData.courseId}))
        DownloadManager.stopDownloadQueue();
    }

    resumeDownloading() {
        DownloadManager.resumeDownloadQueue();
    }

    pauseDownloading() {
        DownloadManager.pauseDownloadQueue();
    }

    isDownloading() {
        return DownloadManager.getDownloadingStatus();
    }

    deleteModuleMedia(moduleData){
        DownloadMediaService.deleteMediaForModule(moduleData)
        .then(res=>{
            Snackbar.show({
                title: 'Deleted Module Data',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#2195f3',
                action: {
                    title: 'DISMISS',
                    onPress: () => { console.log("Dismiss Pressed") },
                    color: 'white'
                },
            });
        })
    }

    deleteCourseMedia(courseId) {
        DownloadMediaService.deleteFullCourseMedia(courseId)
        then(res=>{
            Snackbar.show({
                title: 'Deleted Course Data',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: '#2195f3',
                action: {
                    title: 'DISMISS',
                    onPress: () => { console.log("Dismiss Pressed") },
                    color: 'white'
                },
            });
        });
    }

    isDownloadQueuePaused() {
        return DownloadManager.isDownloadQueuePaused();
    }

    cancelModuleDownloading(moduleData) {
        DownloadMediaService.removeModuleToDownload({moduleId: moduleData.moduleId, courseId: moduleData.courseId});
        DownloadManager.removeItemsFromQueue(moduleData.moduleId)
    }

    restartDownloadForModule(data){
        var moduleData = data
        moduleData.id = moduleData.moduleId
        delete moduleData.moduleId
        DownloadMediaService.getMediaListForModule(moduleData)
    }

    killDownloadManager(){
        DownloadManager.killDownloadManager();
    }

}

const downloadScreenService = new DownloadScreenService();

export default downloadScreenService;