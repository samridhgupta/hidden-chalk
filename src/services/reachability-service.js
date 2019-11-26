import NetInfo from '@react-native-community/netinfo';

class ReachabilityService {
  constructor() {
    this._bindedHandleConnectivityChange = this.handleConnectivityChange.bind(
      this,
    );
    this.addListener(this._bindedHandleConnectivityChange);
  }

  _setIsConnected(isConnected) {
    this._isConnected = isConnected;
    console.log(`Is connected: ${isConnected}`);
  }

  addListener(listener) {
    NetInfo.isConnected.addEventListener('change', listener);
  }

  removeListener(listener) {
    NetInfo.isConnected.removeEventListener('change', listener);
  }

  handleConnectivityChange(isConnected) {
    console.log(`Connectivity change`);
    this._setIsConnected(isConnected);
  }

  checkNetworkConnection() {
    const initialListener = isConnected => {
      NetInfo.isConnected.removeEventListener('change', initialListener);
    };
    NetInfo.isConnected.addEventListener('change', initialListener);
    return NetInfo.isConnected.fetch();
  }

  NO_CONNECTION_MESSAGE() {
    return `Please check if you are connected to the internet.`;
  }
}
export default new ReachabilityService();
