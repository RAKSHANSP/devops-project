// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    files: [
  'node_modules/zone.js/dist/zone.js',
  'node_modules/zone.js/dist/zone-testing.js',
  { pattern: 'src/test.ts', watched: false }
   ],
    preprocessors: {},
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
