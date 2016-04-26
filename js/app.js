/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code. Routes are configured at the end of this file!
 *
 */

// Load the ServiceWorker, the Cache polyfill, the manifest.json file and the .htaccess file
import 'file?name=[name].[ext]!../manifest.json';
import 'file?name=[name].[ext]!../.htaccess';

// Check for ServiceWorker support before trying to install it
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js').then(() => {
    // Registration was successful
  }).catch(() => {
    // Registration failed
  });
} else {
  // No ServiceWorker Support
}

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import FontFaceObserver from 'fontfaceobserver';
import createHistory from 'history/lib/createBrowserHistory';

// Observer loading of Open Sans (to remove open sans, remove the <link> tag in the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add the js-open-sans-loaded class to the body
openSansObserver.check().then(() => {
  document.body.classList.add('js-open-sans-loaded');
}, () => {
  document.body.classList.remove('js-open-sans-loaded');
});

// Import the pages
import HomePage from './components/pages/HomePage.react';
import ReadmePage from './components/pages/ReadmePage.react';
import NotFoundPage from './components/pages/NotFound.react';
import UploadPage from './components/pages/UploadPage.react';
import QuestionBank from './components/pages/QuestionBank.react';
import VideoPlayer from './components/pages/VideoPlayer.react';
import Participation from './components/pages/Participation.react';
import Performance from './components/pages/Performance.react';
import Attentiveness from './components/pages/Attentiveness.react';
import App from './components/App.react';

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

// Create the store with the redux-thunk middleware, which allows us
// to do asynchronous things in the actions
import rootReducer from './reducers/rootReducer';
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default;
    store.replaceReducer(nextRootReducer);
  });
}

// Mostly boilerplate, except for the Routes. These are the pages you can go to,
// which are all wrapped in the App component, which contains the navigation etc
ReactDOM.render(
  <Provider store={store}>
    <Router history={createHistory()}>
      <Route component={App}>
        <Route path="/" component={HomePage} />
        <Route path="/about" component={ReadmePage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/questionbank" component={QuestionBank} />
        <Route path="/play" component={VideoPlayer} />
        <Route path="/participation" component={Participation} />
        <Route path="/performance" component={Performance} />
        <Route path="/attentiveness" component={Attentiveness} />
        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
