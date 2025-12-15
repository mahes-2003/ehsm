sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, History, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.kaar.ehsmportal.controller.IncidentList", {
        onInit: function () {
            var oIncidentModel = new JSONModel();
            this.getView().setModel(oIncidentModel, "incidents");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteIncidentList").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            if (!sEmployeeId) {
                return;
            }
            this._loadIncidentData(sEmployeeId);
        },

        _loadIncidentData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            var aFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];

            sap.ui.core.BusyIndicator.show();

            oModel.read("/incidentSet", {
                filters: aFilters,
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    that.getView().getModel("incidents").setData({ results: oData.results });
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Failed to load incident data.");
                    console.error("Error fetching incidents", oError);
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
        },

        formatter: {
            statusState: function (sStatus) {
                switch (sStatus) {
                    case "Open": return "Error";
                    case "In Progress": return "Warning";
                    case "Closed": return "Success";
                    default: return "None";
                }
            },
            priorityState: function (sPriority) {
                switch (sPriority) {
                    case "High": return "Error";
                    case "Medium": return "Warning";
                    case "Low": return "Success";
                    default: return "None";
                }
            }
        }
    });
});
