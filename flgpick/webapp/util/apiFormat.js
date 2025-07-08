// API Formats:
sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {

        // AF_WH_RES_CREATE: "WH_RES_CREATE",
        WH_RES_CREATE: {
            "EWMWarehouse": "",
            "EWMResource": ""//18 Charac
        },

        // AF_WH_TASK_CONFIRM: "WH_TASK_CONFIRM",
        WH_TASK_CONFIRM: {

            "AlternativeUnit": "",//req
            "ActualQuantityInAltvUnit": 0, //req
            "DifferenceQuantityInAltvUnit": 0,
            "WhseTaskExceptionCodeQtyDiff": "",
            "DestinationStorageBin": "",//Req
            "SourceHandlingUnit": "",
            "WhseTaskExCodeDestStorageBin": "",
            "DestinationResource": "",
            "DestinationHandlingUnit": "",
            "DirectWhseTaskConfIsAllowed": true
        }
    };
});