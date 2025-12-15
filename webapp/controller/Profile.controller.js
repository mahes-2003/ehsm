sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
    "use strict";

    return Controller.extend("com.kaar.ehsmportal.controller.Profile", {
        onInit: function () {
            var oProfileModel = new JSONModel();
            this.getView().setModel(oProfileModel, "profile");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProfile").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            if (!sEmployeeId) {
                return;
            }
            this._loadProfileData(sEmployeeId);
        },

        _loadProfileData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            var sProfilePath = "/profileSet(EmployeeId='" + sEmployeeId + "')";

            sap.ui.core.BusyIndicator.show();

            oModel.read(sProfilePath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.getView().getModel("profile").setData(oData);
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Failed to load profile data.");
                    console.error("Error fetching profile", oError);
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDashboard", {}, true);
            }
        }
    });
});
