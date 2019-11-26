import bugsnag from './bugsnag';
import './ReactotronConfig';
import './aws';
import Sound from 'react-native-sound';
import realm from '../models/realm';
import DownloadService from '../services/download-service';

Sound.setCategory('Playback', false);
Sound.setActive(true); 
realm.initialize();
DownloadService.createRootCourseDir();
