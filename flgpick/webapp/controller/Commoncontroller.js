/*Parent Controller is Main Controller*/
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../util/lib",
    "../util/constants",
    "../util/apiFormat"
], (Controller, lib, constants, apiFormat) => {
    "use strict";

    return Controller.extend("ns.flgpick.controller.Common", {

        _onInitCommon: function () {
            lib.init(this);
        },

        //Create Resource
        _pCreateWHSEResource: function () {
            var sUrl = "";
            var sModelUrl = lib._getModel(constants.ODATA_WH_RES).getServiceUrl();
            var sPath = "WarehouseResource";

            sUrl = sModelUrl + sPath;

            //get Payload data:
            var sPayLoad = this._prepareDataforWHSEResource();

            //Getting Token
            var oToken = lib._getModel().getSecurityToken();

            return new Promise((resolve, reject) => {

                $.ajax({
                    url: sUrl,
                    method: "POST",
                    dataType: "JSON",
                    data: JSON.stringify(sPayLoad),
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", oToken);
                    },
                    success: function (oData) {
                        resolve(oData);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });

        },

        _prepareDataforWHSEResource: function () {
            var oSelectedData = this.getView().getModel("SelectedRowModel").getData();
            if (oSelectedData) {

                //get API Format:
                var oData = this._getAPIFormat(constants.AF_WH_RES_CREATE);
                oData.EWMWarehouse = oSelectedData.EWMWarehouse;
                oData.EWMResource = oSelectedData.WarehouseTask; // + oSelectedData.WarehouseTaskItem;
                return oData;
            }
        },

        _getAPIFormat: function (pName) {
            var paObject = apiFormat[pName];

            var oObject = JSON.parse(JSON.stringify(paObject));
            return oObject;
        },

        _pWHResourceLogOnOff: function (oResourceData, pLogOnOff) {
            //Warehouse Resource Log On Off:

            var sUrl = "";
            var sModelUrl = lib._getModel(constants.ODATA_WH_RES).getServiceUrl();

            //Getting Token
            var oToken = lib._getModel().getSecurityToken();

            if (oResourceData) {
                var sEWMWarehouse = oResourceData.EWMWarehouse;
                var sEWMResource = oResourceData.EWMResource;
            } else {
                //get Payload data:
                var sPayLoad = this._prepareDataforWHSEResource();
                if (sPayLoad) {
                    var sEWMWarehouse = sPayLoad.EWMWarehouse;
                    var sEWMResource = sPayLoad.EWMResource;
                }
            }

            var sPath = "";
            var sPathLogOn = `WarehouseResource(EWMWarehouse='${sEWMWarehouse}',EWMResource='${sEWMResource}')/SAP__self.LogonToWarehouseResource`;
            var sPathLogOff = `WarehouseResource(EWMWarehouse='${sEWMWarehouse}',EWMResource='${sEWMResource}')/SAP__self.LogoffFromWarehouseResource`;

            if (pLogOnOff) {
                sPath = sPathLogOn;
            } else {
                sPath = sPathLogOff;
            }

            sUrl = sModelUrl + sPath;

            var sPayload = {};

            return new Promise((resolve, reject) => {
                if (!sEWMResource) {
                    resolve(true);
                    return;
                }

                //Post Call:
                $.ajax({
                    url: sUrl,
                    method: "POST",
                    dataType: "JSON",
                    data: JSON.stringify(sPayload),
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", oToken);
                    },
                    success: function () {
                        resolve(true);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError)
                    }.bind(this),
                });
            });

        },

        _pWHSETaskRead: function () {
            var sUrl = "";
            var sModelUrl = lib._getModel(constants.ODATA_WH_ORD).getServiceUrl();
            var oToken = lib._getModel().getSecurityToken();

            //Data Build:
            var oSelectedData = this.getView().getModel("SelectedRowModel").getData();
            if (oSelectedData) {
                var sEWMWarehouse = oSelectedData.EWMWarehouse;
                var sWarehouseTask = oSelectedData.WarehouseTask;
                var sWarehouseTaskItem = oSelectedData.WarehouseTaskItem;
            }

            var sPath = `WarehouseTask/${sEWMWarehouse}/${sWarehouseTask}/${sWarehouseTaskItem}`;
            sUrl = sModelUrl + sPath;

            var sPayload = {};
            return new Promise((resolve, reject) => {
                $.ajax({
                    url: sUrl,
                    method: "GET",
                    dataType: "JSON",
                    data: JSON.stringify(sPayload),
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", oToken);
                    },
                    success: function (oData) {
                        resolve(oData);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });
        },

        _pWHTaskConfirm: function (oWHTaskData) {
            //Confirm Warehouse Task:

            var sUrl = "";
            var sModelUrl = lib._getModel(constants.ODATA_WH_ORD).getServiceUrl();
            var oToken = lib._getModel().getSecurityToken();

            //Data Build:
            if (oWHTaskData) {
                var sEWMWarehouse = oWHTaskData.EWMWarehouse;
                var sWarehouseTask = oWHTaskData.WarehouseTask;
                var sWarehouseTaskItem = oWHTaskData.WarehouseTaskItem;

                var sPath = `WarehouseTask(EWMWarehouse='${sEWMWarehouse}',WarehouseTask='${sWarehouseTask}',WarehouseTaskItem='${sWarehouseTaskItem}')/SAP__self.ConfirmWarehouseTaskProduct`;

                sUrl = sModelUrl + sPath;

                var sIfMatch = oWHTaskData["@odata.etag"];
                var sPayLoad = this._prepareDataforWHTaskConfirm(oWHTaskData);

                return new Promise((resolve, reject) => {

                    //Confirm WH Task:
                    $.ajax({
                        url: sUrl,
                        method: "POST",
                        dataType: "JSON",
                        data: JSON.stringify(sPayLoad),
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/json"
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("X-CSRF-Token", oToken);
                            xhr.setRequestHeader("If-Match", sIfMatch);
                        },
                        success: function (oData) {
                            console.log("Task Confirmed Successfully", oData);
                            resolve(true);
                        }.bind(this),
                        error: function (oError) {
                            console.log("Task Confirmation Failed", oError);
                            reject(oError);
                        }.bind(this),
                    });
                });

            }

        },

        _prepareDataforWHTaskConfirm: function (pWHTaskData) {
            if (pWHTaskData) {
                //get API Format:
                var oData = this._getAPIFormat(constants.AF_WH_TASK_CONFIRM);
                oData.AlternativeUnit = pWHTaskData.AlternativeUnit;
                // oData.ActualQuantityInAltvUnit = pWHTaskData.ActualQuantityInAltvUnit;
                oData.ActualQuantityInAltvUnit = pWHTaskData.TargetQuantityInAltvUnit;
                oData.ActualQuantityInAltvUnit = parseFloat(oData.ActualQuantityInAltvUnit);

                oData.DestinationStorageBin = pWHTaskData.DestinationStorageBin;

                return oData;
            }
        },

        _pWHResourceDelete: function (oResourceData) {

            var sUrl = "";
            var sModelUrl = lib._getModel(constants.ODATA_WH_RES).getServiceUrl();
            var oToken = lib._getModel().getSecurityToken();

            if (oResourceData) {
                var sEWMWarehouse = oResourceData.EWMWarehouse;
                var sEWMResource = oResourceData.EWMResource;
            } else {
                //get Payload data:
                var sPayLoad = this._prepareDataforWHSEResource();
                if (sPayLoad) {
                    var sEWMWarehouse = sPayLoad.EWMWarehouse;
                    var sEWMResource = sPayLoad.EWMResource;
                }
            }

            var sPath = `/WarehouseResource/${sEWMWarehouse}/${sEWMResource}`;
            sUrl = sModelUrl + sPath;

            var sPayload = {};

            return new Promise((resolve, reject) => {
                if (!sEWMResource) {
                    resolve(true);
                    return;
                }

                $.ajax({
                    url: sUrl,
                    method: "DELETE",
                    dataType: "JSON",
                    data: JSON.stringify(sPayload),
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": "application/json"
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", oToken);
                    },
                    success: function () {
                        resolve(true);
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this),
                });
            });

        }
    });

});