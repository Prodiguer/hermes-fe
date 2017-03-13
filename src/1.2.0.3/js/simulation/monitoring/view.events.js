(function (APP, MOD) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Apply select filter event handler.
    MOD.events.on("selectFilter:updated", function (filter) {
        // Update filtered simulations.
        MOD.updateFilteredSimulationList();

        // Update active filter terms.
        MOD.updateActiveFilterTerms();

        // Update pagination.
        MOD.updatePagination();

        // Update cookie.
        MOD.setCookie('filter-' + filter.cookieKey, filter.cvTerms.current.name);

        // Fire event.
        MOD.events.trigger("simulationTimesliceUpdated");
    });

    // Apply text filter event handler.
    MOD.events.on("textFilter:updated", function (text) {
        if (MOD.state.textFilter === text.trim().toLowerCase()) return;

        // Update state.
        MOD.state.textFilter = text.trim().toLowerCase();

        // Update filtered simulations.
        MOD.updateFilteredSimulationList();

        // Update active filter terms.
        MOD.updateActiveFilterTerms();

        // Update pagination.
        MOD.updatePagination();

        // Fire event.
        MOD.events.trigger("simulationTimesliceUpdated");
    });

    // Apply filter event handler.
    MOD.events.on("state:pageSizeChange", function (pageSize) {
        // Update cookie.
        MOD.setCookie('page-size', pageSize);

        // Update state.
        MOD.state.pageSize = pageSize;

        // Update pagination.
        MOD.updatePagination();

        // Fire event.
        MOD.events.trigger("simulationTimesliceUpdated");
    });

}(
    this.APP,
    this.APP.modules.monitoring
));