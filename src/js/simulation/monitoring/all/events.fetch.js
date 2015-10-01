(function (APP, MOD, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Controlled vocabularies loaded event handler.
    // @data    Data loaded from remote server.
    MOD.events.on("setup:cvTermsLoaded", function (data) {
        // Cache CV terms.
        _.extend(MOD.state, {
            cvTerms: APP.utils.parseCVTerms(data.cvTerms)
        });

        // Initialise filter cv terms sets.
        MOD.initFilterCvTermsets();

        // Fetch timeslice.
        MOD.fetchTimeSlice(MOD.defaults.timeslice);
    });

    // Timeslice loaded event handler.
    // @data    Data loaded from remote server.
    MOD.events.on("state:timesliceLoaded", function (data) {
        // Update module state.
        MOD.state.simulationList = data.simulationList;
        MOD.state.simulationSet = _.indexBy(data.simulationList, "uid");

        // Parse simulations.
        MOD.parseSimulations(MOD.state.simulationList, data.jobHistory, MOD.state.simulationSet);

        // Update filtered simulations.
        MOD.updateFilteredSimulationList();

        // Update active filter terms.
        MOD.updateActiveFilterTerms();

        // Update pagination.
        MOD.updatePagination();

        // Fire event.
        if (MOD.view) {
            MOD.events.trigger("state:simulationListUpdate", this);
        } else {
            MOD.events.trigger("setup:complete", this);
        }
    });

}(
    this.APP,
    this.APP.modules.monitoring,
    this._
));