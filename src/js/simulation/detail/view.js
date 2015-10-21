(function (APP, MOD, _, Backbone, $) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Main module level view.
    MOD.views.MainView = Backbone.View.extend({
        // Backbone: view HTML tag.
        tagName: 'article',

        // Backbone: view events.
        events: {
            // Open inter-monitoring page.
            'click .inter-monitoring' : function () {
                MOD.events.trigger("im:openMonitor", MOD.state.simulation);
            },

            // Open messages page.
            'click .glyphicon-envelope' : function () {
                var url;

                url = APP.utils.getPageURL(MOD.urls.SIMULATION_MESSAGES_PAGE);
                url = url.replace("{uid}", MOD.state.simulation.uid);
                APP.utils.openURL(url, true);
            },

            // Open previous try page.
            'change #previous-try-select' : function (e) {
                var tryID, url;

                tryID = $(e.target).val();
                if (tryID > 0) {
                    url = APP.utils.getPageURL(MOD.urls.SIMULATION_DETAIL_PAGE);
                    url = url.replace("{hashid}", MOD.state.simulation.hashid);
                    url = url.replace("{tryID}", tryID);
                    url = url.replace("{uid}", MOD.state.simulation.uid);
                    APP.utils.openURL(url, true);
                }
            },

            // Reopen page when web socket closed.
            'click #ws-close-dialog-refresh-page-button' : function () {
                APP.utils.openURL();
            }
        },

        // Backbone: view initializer.
        initialize : function () {
            // Simulation update events.
            MOD.events.on("state:simulationUpdate", this._updateCaption, this);
            MOD.events.on("state:simulationUpdate", this._updateOverview, this);
            MOD.events.on("state:simulationUpdate", this._updateJobCollections, this);
            MOD.events.on("state:simulationUpdate", this._updateJobCounts, this);
            MOD.events.on("state:simulationUpdate", this._updateNotification, this);

            // Job update events.
            MOD.events.on("state:jobListUpdate", this._updateOverview, this);
            MOD.events.on("state:jobListUpdate", function (ei) {
                this._updateJobCollection(ei.job.typeof);
                this._updateJobCount(ei.job.typeof);
            }, this);
            MOD.events.on("state:jobListUpdate", this._updateNotification, this);

            // Web socket closed event.
            MOD.events.on("ws:socketClosed", this._displayWebSocketClosedDialog, this);
        },

        // Backbone: view renderer.
        render : function () {
            _.each([
                "template-caption",
                "template-notification",
                "template-tabs",
                "ws-close-dialog-template"
                ], function (template) {
                APP.utils.renderTemplate(template, MOD.state, this);
            }, this);

            return this;
        },

        _updateNotification: function (ei) {
            if (ei.simulation) {
                ei.eventTypeDescription = MOD.getEventDescription(ei);
            }
            if (ei.job) {
                ei.eventTypeDescription = MOD.jobTypeDescriptions[ei.job.typeof].toUpperCase() + " " + ei.eventTypeDescription;
            }
            this._replaceNode('#notification', 'template-notification', ei);
        },

        _updateCaption: function () {
            this._replaceNode("#caption", "template-caption", MOD.state);
        },

        _updateOverview: function () {
            this._replaceNode("#simulation-overview", "template-tab-overview", MOD.state);
        },

        _updateJobCollections: function () {
            _.each(MOD.jobTypes, this._updateJobCollection, this);
        },

        _updateJobCollection : function (jobType) {
            this._replaceNode("#job-collection-" + jobType, "template-job-collection", {
                APP: APP,
                hidePPInfo: jobType === 'computing' ,
                jobList: MOD.state.getJobs(jobType),
                jobType: jobType,
                jobTypeCaption: MOD.jobTypeDescriptions[jobType],
                MOD: MOD
            });
        },

        _updateJobCounts: function () {
            _.each(MOD.jobTypes, this._updateJobCount, this);
        },

        _updateJobCount : function (jobType) {
            var jobs, selector;

            jobs = MOD.state.getJobs(jobType);
            selector = '#' + "tab-job-count-" + jobType + "-";
            this.$(selector + "running").text(jobs.running.length);
            this.$(selector + "complete").text(jobs.complete.length);
            this.$(selector + "error").text(jobs.error.length);
        },

        _displayWebSocketClosedDialog: function () {
            this.$('#ws-close-dialog').modal('show');
        },

        _replaceNode: function (nodeSelector, template, templateData) {
            this.$(nodeSelector).replaceWith(APP.utils.renderTemplate(template, templateData));
        }
    });

}(
    this.APP,
    this.APP.modules.monitoring,
    this._,
    this.Backbone,
    this.$
));