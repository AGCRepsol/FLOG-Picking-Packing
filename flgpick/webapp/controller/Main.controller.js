sap.ui.define([
    "./Commoncontroller",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Common, JSONModel, library, MessageToast, MessageBox) => {
    "use strict";

    return Common.extend("ns.flgpick.controller.Main", {
        onInit: function () {
            this._onInitCommon();

            // Create an empty JSON model for selected row data
            var oSelectedRowModel = new JSONModel;
            // Set it to the view with a name
            this.getView().setModel(oSelectedRowModel, "SelectedRowModel");
        },
        onPressOutbDelEntity: function (oEvent) {
            debugger;
            // Get selected row data
            var oItem = oEvent.getParameter("listItem");
            var oContext = oItem.getBindingContext();
            var oData = oContext.getObject();
            //set to model
            var oModel = this.getView().getModel("SelectedRowModel");
            oModel.setData(oData);
            // Open dialog
            this._openPickupListDialog();
        },

        _openPickupListDialog: function () {
            //Load the Fragment 
            if (!this._oPckListDialog) {
                this.loadFragment({
                    name: "ns.flgpick.Fragments.PickupList",
                    addToDependents: true
                }).then(function (oDialog) {
                    this._oPckListDialog = oDialog;
                    this._oPckListDialog.open();
                }.bind(this));
            } else {
                this._oPckListDialog.open();
            }

        },
        onConfmPickUpCancel: function () {
            if (this._oPckListDialog) {
                this._oPckListDialog.close();
                this.byId("idIpSource").setValue("");
                this.byId("idBtnConfPickConfirm").setVisible(false);
            }
        },


        onConfirmSourcePickUp: function () {
            debugger;

            // 1. Get the entered value in the editable input field
            var sSourceInput = this.byId("idIpSource").getValue().trim().toUpperCase();
            console.log(sSourceInput);
            if (!sSourceInput) {
                MessageToast.show("Please enter a Source Bin value.");
                return;
            }

            // 2. Get required key values from the SelectedRowModel
            var oSelectedData = this.getView().getModel("SelectedRowModel").getData();
            // var sEWMOutboundDeliveryOrder = oSelectedData.EWMOutboundDeliveryOrder;
            // var sEWMOutboundDeliveryOrderItem = oSelectedData.EWMOutboundDeliveryOrderItem;
            var sWarehouse = oSelectedData.EWMWarehouse;
            var sWarehouseTask = oSelectedData.WarehouseTask;
            var sWarehouseTaskItem = oSelectedData.WarehouseTaskItem;

            if (!sWarehouse || !sWarehouseTask || !sWarehouseTaskItem) {
                MessageBox.error("Required data missing to validate Source Bin.");
                return;
            }

            // 3. Get OData model (default or named, adjust if needed)
            var oModel = this.getView().getModel();

            // 4. Build OData path using composite key
            var sPath = `/YY1_FLGPCK_E_SrcBinEntity(EWMWarehouse='${sWarehouse}',WarehouseTask='${sWarehouseTask}',WarehouseTaskItem='${sWarehouseTaskItem}')`;
            console.log(sPath);

            // 5. Perform OData read
            oModel.read(sPath, {
                success: function (oData) {
                    if (oData.SourceStorageBin === sSourceInput) {
                        MessageToast.show("Source Bin is valid.");
                        this.byId("idBtnConfPickConfirm").setVisible(true);
                    } else {
                        MessageBox.error("Invalid Source Bin.");
                        this.byId("idIpSource").setValue("");
                        this.byId("idBtnConfPickConfirm").setVisible(false);
                    }
                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Source Bin validation failed. Entry not found.");
                }.bind(this),
            });

        },

        onScannerSourceBin: function (oEvent) {
            // scan result
            var sScannedValue = oEvent.getParameter("text");
            if (sScannedValue) {
                //Setting the value to the input field
                this.byId("idIpSource").setValue(sScannedValue);
            }
            else {
                MessageToast.show("No Value found from scan")
            }
        },

        onScannerShipLabel: function (oEvent) {
            debugger;
            //Get scanned value
            var sScanValue = oEvent.getParameter("text").trim();
            // this.scannedData = JSON.parse(sScanValue);
            // if (this.scannedData) {
            //     var sWHNum = this.scannedData["EWMWarehouse"].toUpperCase();
            //     //var sDeliveryNum  = this.scannedData["EWMOutboundDeliveryOrder"].toUpperCase();
            // }
            var sWHNum = sScanValue;
            // Create a filter data object
            var oFilterData = {
                EWMWarehouse: sWHNum,
                //EWMOutboundDeliveryOrder: sDeliveryNum
            };

            // Get the SmartFilterBar
            var oSFB = this.byId("idSFBOutbDelEntity");

            // Set the value using setFilterData
            if (oSFB) {
                oSFB.setFilterData(oFilterData);
            }
            //Auto triggering of search
            oSFB.fireSearch();
        },

        onConfirmPickUp: function () {
            //Open the WT Confirm Dialog:
            if (!this._oPckConfirmDialog) {
                this.loadFragment({
                    name: "ns.flgpick.dialogs.PickConfirm",
                    addToDependents: true,
                    // controller: this
                }).then(function (oDialog) {
                    this._oPckConfirmDialog = oDialog;
                    this._oPckConfirmDialog.open();
                    this.onConfirmWhsePickUp();

                    // this.onConfirmPickUp1();
                    // this.getView().addDependent(oDialog);
                    // return oDialog;
                }.bind(this));
            }
            else {
                this._oPckConfirmDialog.open();
                this.onConfirmWhsePickUp();
                
                // this.onConfirmPickUp1();
            }

            // this._oPckConfirmDialog.then(function(oDialog) {
            //     oDialog.open();
            //     this.onConfirmPickUp1();
            // }.bind(this));
        },

        onConfirmWhsePickUp: async function () {
            return new Promise(async (resolve, reject) => {
                try {
                    debugger;

                    //1. Create WHSE Resource:
                    var oWHSEResCreate = await this._pCreateWHSEResource();

                    //2. Logon To WHSE Resource:
                    var oWHSEResLogon = await this._pWHResourceLogOnOff(oWHSEResCreate, true);

                    //2.1 Read WHSE Task Via API For ETag:
                    var oWHSETaskData = await this._pWHSETaskRead();

                    //3. Confirm Warehouse Task:
                    var oWHSETaskConfirm = await this._pWHTaskConfirm(oWHSETaskData);

                    //4. Logon To WHSE Resource:
                    var oWHSEResLogoff = await this._pWHResourceLogOnOff(oWHSEResCreate, false);

                    //5. Delete Warehouse Resource:
                    var oWHSEResDelete = await this._pWHResourceDelete(oWHSEResCreate);

                    if (oWHSETaskConfirm) {
                        //Close Confirm Dialog:
                        if (this._oPckConfirmDialog) {
                            this._oPckConfirmDialog.close();
                        } 

                        //Close Pickup List Dialog: 
                        if (this._oPckListDialog) {
                            this._oPckListDialog.close();
                        }

                        var oSelectedData = this.getView().getModel("SelectedRowModel").getData();
                        if (oSelectedData) {
                            var sMessage = `Warehouse Task ${oSelectedData.WarehouseTask} is Confirmed Successfully, 
                                            keep the product in the Destination Bin ${oSelectedData.DestinationStorageBin}`;

                            MessageBox.success(sMessage, {
                                title: "Success",
                                onClose: function () {
                                    var oSFB = this.byId("idSFBOutbDelEntity");
                                    if (oSFB) {
                                        oSFB.fireSearch();
                                    }
                                }.bind(this)
                            });
                        }
                    }

                    resolve(true);

                } catch (error) {

                    //4. Logon To WHSE Resource:
                    var oWHSEResLogoff = await this._pWHResourceLogOnOff(oWHSEResCreate, false);

                    //5. Delete Warehouse Resource:
                    var oWHSEResDelete = await this._pWHResourceDelete(oWHSEResCreate);

                    //Close Confirm Dialog:
                    if (this._oPckConfirmDialog) {
                        this._oPckConfirmDialog.close();
                    }

                    //Close Pickup List Dialog: 
                    if (this._oPckListDialog) {
                        this._oPckListDialog.close();
                    }

                    MessageBox.error(error.responseJSON.error.message);

                    reject(error);

                }
            });
        }


    });
});