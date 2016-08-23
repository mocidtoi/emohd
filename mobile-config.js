App.info({
  name: 'DHome',
  description: 'DHome Application',
  author: 'Dicom Technology',
  email: 'tunghx@dicom.com.vn',
  website: 'http://dicom.com.vn',
  version: '0.0.1'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('webviewbounce', 'false');
App.setPreference('DisallowOverscroll', "true");
App.setPreference('AutoHideSplashScreen', "false");
App.setPreference('SplashScreen', "screen");
App.setPreference('SplashScreenDelay', "5000");
App.setPreference('FadeSplashScreenDuration', "250");
App.setPreference('ShowSplashScreenSpinner', "false");
App.setPreference('StatusBarOverlaysWebView', "false");
App.setPreference('StatusBarStyle', "default");
App.accessRule('*');
