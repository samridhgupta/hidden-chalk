import async from 'async-es';
import DownloadMediaService from './download-media-service';
import Snackbar from 'react-native-snackbar';
import {EventRegister} from 'react-native-event-listeners';

class DownloadManager {
  constructor() {
    this.downloadQueue = null;
    this.queueConcurrencyCount = 3;
  }

  initDownloadQueue() {
    let _this = this;
    let _downloadMediaService = DownloadMediaService;
    this.downloadQueue = async.queue(function(downloadTask, callback) {
      console.log('Download Task::', downloadTask.name);

      EventRegister.emit(
        'DownloadingInprogress',
        _this.getRemainingDownloadingItems(),
      );
      _downloadMediaService.downloadMediaById(downloadTask.media).then(res => {
        callback();
      });
    }, this.queueConcurrencyCount);

    this.downloadQueue.drain = function() {
      // Snackbar.show({
      //     title: 'Download Completed',
      //     duration: Snackbar.LENGTH_LONG,
      //     backgroundColor: '#2195f3',
      //     action: {
      //         title: 'DISMISS',
      //         onPress: () => { console.log("Dismiss Pressed") },
      //         color: 'white'
      //     },
      // });

      EventRegister.emit('DownloadComplete', '');
    };
  }

  getDownloadManager() {
    if (this.downloadQueue == null) {
      this.initDownloadQueue();
    }
    return this.downloadQueue;
  }

  pushItemsToDownloadQueue(items) {
    console.log('Start Download Queue');
    if (this.downloadQueue == null) {
      this.initDownloadQueue();
    }
    this.allItemsRemoved = false;
    items.map(item => {
      DownloadMediaService.checkFileExists(item).then(value => {
        if (value) {
          console.log('File Exist :::skipped');
          return;
        }
        console.log('Pushed :::', item.id);
        this.downloadQueue.push({name: item.id, media: item}, err => {
          if (err) {
            console.log(err);
          }
          console.log('Done');
        });
      });
    });
    if (this.getRemainingDownloadingItems() > 0) {
      Snackbar.show({
        title: 'Download Started',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: '#2195f3',
        action: {
          title: 'DISMISS',
          onPress: () => {
            console.log('Dismiss Pressed');
          },
          color: 'white',
        },
      });
    }
  }

  stopDownloadQueue() {
    if (this.downloadQueue == null) {
      return;
    }
    this.downloadQueue.remove((downloadTask, priority) => {
      return false;
    });
    this.downloadQueue.kill();
    Snackbar.show({
      title: 'Download Stopped',
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: '#2195f3',
      action: {
        title: 'DISMISS',
        onPress: () => {
          console.log('Dismiss Pressed');
        },
        color: 'white',
      },
    });
  }

  pauseDownloadQueue() {
    if (this.downloadQueue == null) {
      return;
    }
    this.downloadQueue.pause();
    Snackbar.show({
      title: 'Download Paused',
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: '#2195f3',
      action: {
        title: 'DISMISS',
        onPress: () => {
          console.log('Dismiss Pressed');
        },
        color: 'white',
      },
    });
  }

  resumeDownloadQueue() {
    if (this.downloadQueue == null) {
      return;
    }
    this.downloadQueue.resume();
    Snackbar.show({
      title: 'Download Resuming',
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: '#2195f3',
      action: {
        title: 'DISMISS',
        onPress: () => {
          console.log('Dismiss Pressed');
        },
        color: 'white',
      },
    });
  }

  getDownloadingStatus() {
    if (this.downloadQueue == null) {
      return false;
    }
    return this.downloadQueue.length() > 0 ? true : false;
  }

  onDownloadComplete() {
    console.log('Download Complete:::: YAY');
    Snackbar.show({
      title: 'Download Completed',
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: '#2195f3',
      action: {
        title: 'DISMISS',
        onPress: () => {
          console.log('Dismiss Pressed');
        },
        color: 'white',
      },
    });
  }

  getRemainingDownloadingItems() {
    if (this.downloadQueue == null) {
      this.initDownloadQueue();
    }
    return this.downloadQueue._tasks.toArray();
  }

  isDownloadQueuePaused() {
    if (this.downloadQueue == null) {
      return false;
    }
    return this.downloadQueue.paused;
  }

  removeItemsFromQueue(moduleId) {
    if (this.downloadQueue == null) {
      return;
    }
    this.downloadQueue.remove((downloadTask, priority) => {
      return downloadTask.data.media.moduleId == moduleId;
    });
    if (!this.getDownloadingStatus()) {
      EventRegister.emit('DownloadQueueEmpty', '');
    }
  }

  killDownloadManager() {
    if (this.downloadQueue == null) {
      return;
    }
    this.downloadQueue.kill();
    this.downloadQueue = null;
  }
}
export default new DownloadManager();
