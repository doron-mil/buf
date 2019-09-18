// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: '',
    authDomain: 'dorons-demo.firebaseapp.com',
    databaseURL: 'https://dorons-demo.firebaseio.com',
    projectId: 'dorons-demo',
    storageBucket: 'dorons-demo.appspot.com',
    messagingSenderId: '359844535983',
    appId: '1:359844535983:web:674513d470e54caebffe5a'
  },
  serverAddress: 'http://localhost:3001',
  playerPositionStepsBack: 25,
  playerVelocityStepsBack: 25,
  playerPositionLimitOffset: 70,
  minFieldScale: 1,
  maxFieldScale: 3,
  sendEngineDataInterval: 20,
  animationPlayFrameRate: 5,
  minimumVelocityForState: 0.05,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
