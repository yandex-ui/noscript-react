var ns = require('./ns');

require('./ns.action');
require('./ns.consts');
require('./ns.events');
require('./ns.history');
require('./ns.http.client');
require('./ns.log');
require('./ns.model');
require('./ns.modelCollection');
require('./ns.page');
require('./ns.page.block');
require('./ns.page.history');
require('./ns.profile');
require('./ns.request');
require('./ns.request.manager');
require('./ns.router');

ns.utils = require('./ns.utils');
ns.DataProvider = require('./ns.DataProvider');

module.exports = ns;
