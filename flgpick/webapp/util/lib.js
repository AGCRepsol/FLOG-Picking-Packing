//Common Library for Common Functions
sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    var _this = null;

    return {
        init: function (oInstance) {
            _this = oInstance;
        },

        _getModel: function (poModelName, pbFromView) {
			/*return the Model */
			var oModel = null;
			if (pbFromView) {
				/*From View*/
				oModel = _this.getView().getModel(poModelName);
			} else {
				oModel = _this.getOwnerComponent().getModel(poModelName);
			}
			return oModel;
		},
    }
}); 