import downloadMediaService from "../services/download-media-service";
import * as bluebird from 'bluebird';
import appStateService from "../services/app-state-service";
import { courseService } from "../services/course-service";
import reachabilityService from "../services/reachability-service";

const started = false;

const startTask = () => {
    if(started)
        return;
    appStateService.addHandler({state: 'active', handle: () => {
        resumeDownloads();
    }});
    reachabilityService.addListener((isConnected) => {
        if (isConnected) {
            resumeDownloads();
        }    
    })
    resumeDownloads();
}

const resumeDownloads = () => {
    return bluebird.resolve(reachabilityService.checkNetworkConnection())
    .then(isConnected => {
        if(isConnected)
            return courseService.getAvailableCoursesAsync();
        return [];
    })
    .mapSeries(course => {
        return bluebird.resolve(downloadMediaService.getModulesToDownloadData(course.id))
        .mapSeries(moduleToDownload => {
            return downloadMediaService.resumeDownloads(moduleToDownload);
        });
    });
}

export default startTask;