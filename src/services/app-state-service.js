import { AppState } from 'react-native';

class AppStateService {
    
    constructor() {
        this._handlers = [];
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
    }

    currentState() {
        return AppState.currentState;
    }

    _handleAppStateChange(nextAppState) {
        this._handlers.forEach(handler => {
            if(handler.state === nextAppState) {
                handler.handle();
            }
        })
    }

    addHandler(handler) {
        this._handlers.push(handler);
    }

}

export default new AppStateService();