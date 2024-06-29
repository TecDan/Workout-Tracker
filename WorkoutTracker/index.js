import { AppRegistry } from 'react-native';
import App from './App'; // Make sure this path points to your App.js file
import { name as appName } from './app.json'; // This pulls the app name from your app.json


AppRegistry.registerComponent(appName, () => App);
