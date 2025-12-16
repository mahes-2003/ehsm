sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, History, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.kaar.ehsmportal.controller.Dashboard", {
        onInit: function () {
            // Local models for tables
            var oIncidentModel = new JSONModel();
            this.getView().setModel(oIncidentModel, "incidents");

            var oRiskModel = new JSONModel();
            this.getView().setModel(oRiskModel, "risks");

            // Local model for Profile
            var oProfileModel = new JSONModel();
            this.getView().setModel(oProfileModel, "entry");

            // View model for counts
            var oViewModel = new JSONModel({
                IncidentCount: 0,
                RiskCount: 0
            });
            this.getView().setModel(oViewModel, "view");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteDashboard").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            if (!sEmployeeId) {
                return;
            }
            this._loadData(sEmployeeId);
        },

        _loadData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            console.log("Loading dashboard data for:", sEmployeeId);
            console.log("Service URL:", oModel.sServiceUrl);

            // Note: The new Quality Service (ZQUALITY_2003_CDS) might not have profileSet/incidentSet/riskSet.
            // Commenting out these calls to prevent 404 errors until new endpoints are known.
            // The dashboard counts will remain 0.

            /*
            // 1. Fetch Profile
            var sProfilePath = "/profileSet(EmployeeId='" + sEmployeeId + "')";
            oModel.read(sProfilePath, {
                success: function (oData) {
                    that.getView().getModel("entry").setData(oData);
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Failed to load profile.");
                }
            });

            // 2. Fetch Incidents
            var aIncidentFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];
            oModel.read("/incidentSet", {
                filters: aIncidentFilters,
                success: function (oData) {
                    var oLocalModel = that.getView().getModel("incidents");
                    oLocalModel.setData({ results: oData.results });
                    
                    that.getView().getModel("view").setProperty("/IncidentCount", oData.results.length);
                },
                error: function (oError) {
                    console.log("Error fetching incidents (expected if service changed)", oError);
                }
            });

            // 3. Fetch Risks
            var aRiskFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];
            oModel.read("/riskSet", {
                filters: aRiskFilters,
                success: function (oData) {
                    var oLocalModel = that.getView().getModel("risks");
                    oLocalModel.setData({ results: oData.results });

                    that.getView().getModel("view").setProperty("/RiskCount", oData.results.length);
                },
                error: function (oError) {
                     console.log("Error fetching risks (expected if service changed)", oError);
                }
            });
            */
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteLogin", {}, true);
            }
        },

        _getEmployeeId: function () {
            var oData = this.getView().getModel("entry").getData();
            return oData ? oData.EmployeeId : null;
        },

        onPressProfile: function () {
            var sEmployeeId = this._getEmployeeId();
            if (sEmployeeId) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteProfile", { employeeId: sEmployeeId });
            }
        },

        onPressIncident: function () {
            var sEmployeeId = this._getEmployeeId();
            if (sEmployeeId) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteIncidentList", { employeeId: sEmployeeId });
            }
        },

        onPressRisk: function () {
            var sEmployeeId = this._getEmployeeId();
            if (sEmployeeId) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteRiskList", { employeeId: sEmployeeId });
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
            riskState: function (sSeverity) {
                switch (sSeverity) {
                    case "High": return "Error";
                    case "Medium": return "Warning";
                    case "Low": return "Success";
                    default: return "None";
                }
            }
        }
    });
});
