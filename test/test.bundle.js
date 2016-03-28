require('es5-shim');

global.React = require('react');
global.ReactDOM = require('react-dom');
global.ReactDOMServer = require('react-dom/server');
global.ReactTestUtils = require('react-addons-test-utils');

require('./stub/global');
require('../index.js');
