import { registerRootComponent } from "expo";

import { App } from "./src/_app";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment setting is correct.
registerRootComponent(App);
