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

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteDashboard").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            if (!sEmployeeId) {
                // Fallback or redirect if no ID
                return;
            }
            this._loadData(sEmployeeId);
        },

        _loadData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // 1. Fetch Profile
            // /profileSet(EmployeeId='...')
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
            // /incidentSet?$filter=EmployeeId eq '...'
            var aIncidentFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];
            oModel.read("/incidentSet", {
                filters: aIncidentFilters,
                success: function (oData) {
                    var oLocalModel = that.getView().getModel("incidents");
                    oLocalModel.setData({ results: oData.results });

                    // Update count in main view model if needed or specific tile model
                    // For now, let's just use the length for the tile
                    var oViewModel = new JSONModel({
                        IncidentCount: oData.results.length,
                        RiskCount: 0 // placeholder
                    });
                    // Merge with existing risk count if possible, but let's just set it partly first
                    // Actually, let's wait for both to set the tile counts properly or use separate models
                    that.getView().setModel(oViewModel); // This might overwrite, better to use named model or update property
                },
                error: function (oError) {
                    console.error("Error fetching incidents", oError);
                }
            });

            // 3. Fetch Risks
            // /riskSet?$filter=EmployeeId eq '...'
            var aRiskFilters = [new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)];
            oModel.read("/riskSet", {
                filters: aRiskFilters,
                success: function (oData) {
                    var oLocalModel = that.getView().getModel("risks");
                    oLocalModel.setData({ results: oData.results });

                    // Update Risk Count
                    var oViewModel = that.getView().getModel();
                    if (oViewModel) {
                        oViewModel.setProperty("/RiskCount", oData.results.length);
                    } else {
                        oViewModel = new JSONModel({
                            RiskCount: oData.results.length
                        });
                        that.getView().setModel(oViewModel);
                    }
                },
                error: function (oError) {
                    console.error("Error fetching risks", oError);
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
                oRouter.navTo("RouteLogin", {}, true);
            }
        },

        onPressProfile: function () {
            var sEmployeeId = this.getView().getModel("entry").getData().EmployeeId;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteProfile", {
                employeeId: sEmployeeId
            });
        },

        onPressIncident: function () {
            var sEmployeeId = this.getView().getModel("entry").getData().EmployeeId;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteIncidentList", {
                employeeId: sEmployeeId
            });
        },

        onPressRisk: function () {
            var sEmployeeId = this.getView().getModel("entry").getData().EmployeeId;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteRiskList", {
                employeeId: sEmployeeId
            });
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
