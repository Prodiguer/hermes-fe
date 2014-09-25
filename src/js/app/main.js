// --------------------------------------------------------
// $ :: JQuery nonconflict reference.
// See :: http://www.tvidesign.co.uk/blog/improve-your-jquery-25-excellent-tips.aspx#tip19
// --------------------------------------------------------
window.$ = window.$jq = jQuery.noConflict();

// --------------------------------------------------------
// app/main.js
// Application entry point.
// --------------------------------------------------------
(function(root) {

	// ECMAScript 5 Strict Mode
	"use strict";

	// Root Application module.
	var APP = root.APP = {
		// Institute information.
		institute: {
			// Code.
			code: "IPSL",

			// Long name.
			longName: "Institut Pierre Simon Laplace",

			// Home page.
			homePage: "http://ipsl.fr",
		},

		// App title.
		title: "Prodiguer",

		// App version.
		version: "0.1.0",

		// App copyright statement.
		copyrightYear: new Date().getFullYear(),

        // App Event dispatcher.
        events: _.extend({}, Backbone.Events),

		// Sub-modules placeholder.
		modules: {},

		// App templates placeholder.
		templates: {},

		// App sub-views placeholder.
		views: {},

		// Retrieves a module by name.
		getModule: function(name) {
			name = name.toUpperCase();
			return _.find(APP.modules, function(mod) {
				var keys;

				keys = _.map(mod.keyAliases, function(alias) {
					return alias.toUpperCase()
				});
				keys.push(mod.key.toUpperCase());

				return _.find(keys, function(key) {
					return key == name
				});
			});
		},

		// Register an application module.
		registerModule: function(key, module) {
			// Set module.
			APP.modules[key] = module;

			// Set module defaults.
			_.defaults(module, {
				// Module key aliases.
				keyAliases: [],

				// Flag indicating whether module is active.
				isActive: true,

		        // Module event dispatcher.
				events: _.extend({}, Backbone.Events),

				// Module key.
				key: key,

				// Module templates placeholder.
				templates: {},

				// Module main view instance.
				view: undefined,

				// Module sub-views placeholder.
				views: {},

				// Module web-socket channel placeholder.
				ws: {},

				// Predicate indicating whether module can be safely closed.
				canClose: function() {
					return true;
				},

				// Module logger.
				log: function(msg) {
					APP.utils.log(key.toUpperCase() + ' :: ' + msg);
				}
			});

			// Update state.
			APP.state.moduleList.push(module);

			return module;
		},

		// Application exception.
		Exception : function(message) {
			this.message = message;
			this.name = "AppException";
		}
	};

	// Module loading event handler.
	// @m 	New module being loaded.
	APP.events.on("module:loading", function (mod) {
		var current = APP.state.module;

		// Process current module.
		if (!_.isUndefined(current)) {
			// ... escape if cannot be closed at this time
			if (!current.canClose()) {
				return;
			}

			// ... hide view
			if (!_.isUndefined(current.view)) {
				current.view.$el.hide();
			}

			// ... set to previous
			APP.state.modulePrevious = current;
		}

		// Cache new module.
		APP.state.module = mod;

		// Either build module view or redisplay.
		if (!mod.view) {
			mod.events.trigger("module:ready");
		} else {
			mod.view.$el.show();
		}

        // Fire event.
		APP.events.trigger("module:loaded", mod);
	});

}(this));