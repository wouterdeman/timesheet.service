'use strict';

var SaveCrumble = require('./timetracker_savecrumble');
var CrumbleStats = require('./timetracker_crumblestats');
var Showcases = require('./timetracker_showcases');
var SaveZone = require('./timetracker_savezone');
var SaveActivities = require('./timetracker_saveactivities');
var TrackedTime = require('./timetracker_trackedtime');

// Crumbles
exports.saveCrumble = SaveCrumble.saveCrumble;

// Stats
exports.getTodaysCrumbles = CrumbleStats.getTodaysCrumbles;
exports.getLast10Crumbles = CrumbleStats.getLast10Crumbles;
exports.getTotalCountOfCrumbles = CrumbleStats.getTotalCountOfCrumbles;
exports.getTotalTrackedTime = CrumbleStats.getTotalTrackedTime;
exports.getLastLocations = CrumbleStats.getLastLocations;

// Showcases
exports.getMapsShowCase = Showcases.getMapsShowCase;

// Zone's
exports.saveZone = SaveZone.saveZone;
exports.updateZone = SaveZone.updateZone;
exports.getZoneAndActivities = SaveZone.getZoneAndActivities;

// Activities
exports.getActiveActivity = SaveActivities.getActiveActivity;
exports.setActivityActiveInZone = SaveActivities.setActivityActiveInZone;
exports.addActivityToZone = SaveActivities.addActivityToZone;
exports.removeActivityFromZone = SaveActivities.removeActivityFromZone;

// Tracked time
exports.updateActivityForTrackedTime = TrackedTime.updateActivityForTrackedTime;
exports.copyTrackedTimeByCrumbleReference = TrackedTime.copyTrackedTimeByCrumbleReference;
exports.getTrackedTimeForActivity = TrackedTime.getTrackedTimeForActivity;
exports.getTrackedTimeAndActivity = TrackedTime.getTrackedTimeAndActivity;
exports.deleteTrackedTimeByCrumbleReference = TrackedTime.deleteTrackedTimeByCrumbleReference;