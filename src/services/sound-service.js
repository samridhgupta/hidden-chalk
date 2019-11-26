
import { soundFileKeyMap } from '../config/soundData';
import Sound from 'react-native-sound';

export default {
    playSound(soundKey) {
        Sound.setActive(false);
        Sound.setCategory('Ambient', false);
        Sound.setActive(true);
        var _sound = new Sound(soundFileKeyMap[soundKey], Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            _sound.setVolume(0.2)
            _sound.play((success) => {
                Sound.setActive(false);
                Sound.setCategory('Playback', false);
                Sound.setActive(true);
                if (success)
                    console.log('successfully finished playing');
                else
                    console.log('playback failed due to audio decoding errors');
                _sound.release();
            });
        });

    },

    getSound(soundKey, callback) {
        return new Sound(soundFileKeyMap[soundKey], Sound.MAIN_BUNDLE, callback);
    }
}