(function (MOD, _) {

    // ECMAScript 5 Strict Mode
    "use strict";

    // Closure vars.
    var
        // Sets simulation's execution end date.
        setExecutionEndDate = function (s) {
            var last;

            // Escape if non-derivable.
            if (s.executionEndDate ||
                s.jobs.compute.all.length === 0 ||
                s.jobs.postProcessing.all.length === 0) return;

            // Derive from last compute job.
            last = s.jobs.compute.allUnsorted[s.jobs.compute.allUnsorted.length - 1];
            s.executionEndDate = last.executionEndDate || last.executionStartDate;
        },

        // Sets simulation's current execution status.
        setExecutionState = function (simulation) {
            simulation.executionState = MOD.getSimulationComputeState(simulation);
            MOD.cv.setFieldDisplayName(simulation, 'simulation_state', 'executionState');
        },

        // Sorts a job set.
        sortComputeJobset = function (simulation) {
            if (simulation.jobs.compute.all.length > 1) {
                simulation.jobs.compute.all = _.sortBy(simulation.jobs.compute.all, function (job) {
                    return job.executionStartDate;
                });
            }
        },

        // Parses a simulation job to the relevant simulation job set.
        parseJob = function (job) {
            var simulation;

            // Set associated simulation.
            if (_.has(MOD.state.simulationSet, job.simulationUID) === false) {
                return;
            }
            simulation = MOD.state.simulationSet[job.simulationUID];

            // Push jobs into relevant collections.
            simulation.jobs.all.push(job);
            switch (job.typeof) {
            case 'computing':
                simulation.jobs.compute.all.push(job);
                simulation.jobs.compute.allUnsorted.push(job);
                simulation.jobs.compute[job.executionState].push(job);
                break;
            case 'post-processing':
                simulation.jobs.postProcessing.all.push(job);
                simulation.jobs.postProcessing[job.executionState].push(job);
                break;
            default:
                break;
            }

            // Set flag indicating whether the simulation has a monitoring job.
            if (simulation.hasMonitoring === false &&
                job.typeof === 'post-processing' &&
                job.postProcessingName === 'monitoring' &&
                job.executionEndDate &&
                job.isError === false) {
                simulation.hasMonitoring = true;
            }
        };

    // Module data parser.
    MOD.parser = {
        // Parses loaded timeslice.
        parseTimeslice: function (simulationList, jobList) {
            // Extend simulations.
            _.each(simulationList, MOD.extendSimulation);
            MOD.log("timeslice simulations extended");

            // Parse jobs.
            _.each(jobList, parseJob);
            MOD.log("timeslice jobs mapped");

            // Sort compute jobs (required in order to determine simulation execution status).
            _.each(simulationList, sortComputeJobset);
            MOD.log("timeslice compute jobs sorted");

            // Set execution end dates.
            _.each(simulationList, setExecutionEndDate);
            MOD.log("timeslice simulation end dates assigned");

            // Set execution states.
            _.each(simulationList, setExecutionState);
            MOD.log("timeslice simulation compute state assigned");
        },

        // Parses web-socket event data.
        parseEvent: function (simulation, jobList) {
            // Parse simulation date information.
            if (simulation.executionEndDate) {
                simulation.executionEndDate = moment(simulation.executionEndDate);
            }
            if (simulation.executionStartDate) {
                simulation.executionStartDate = moment(simulation.executionStartDate);
            }

            // Extend simulation.
            MOD.extendSimulation(simulation);

            // Parse jobs.
            _.each(jobList, parseJob);

            // Sort compute jobs (required in order to determine simulation execution status).
            sortComputeJobset(simulation);

            // Set derived execution end date (necessary if 0100 not sent).
            setExecutionEndDate(simulation);

            // Set execution state.
            setExecutionState(simulation);
        }
    };
}(
    this.APP.modules.monitoring,
    this._
));
