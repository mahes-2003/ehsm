sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.kaar.ehsmportal.controller.Login", {
        onInit: function () {
        },

        onLogin: function () {
            var sEmployeeId = this.getView().byId("inpEmployeeId").getValue();
            var sPassword = this.getView().byId("inpPassword").getValue();

            if (!sEmployeeId || !sPassword) {
                MessageToast.show("Please enter both Employee ID and Password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // /loginSet(EmployeeId='...',Password='...')
            var sPath = "/loginSet(EmployeeId='" + sEmployeeId + "',Password='" + sPassword + "')";

            sap.ui.core.BusyIndicator.show();

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    if (oData.Status === "Success") {
                        MessageToast.show("Login Successful");
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("RouteDashboard", {
                            employeeId: sEmployeeId
                        });
                    } else {
                        MessageToast.show("Validation Failed: " + (oData.Status || "Unknown Error"));
                    }
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var sMsg = "Login Failed";
                    try {
                        var oErr = JSON.parse(oError.responseText);
                        sMsg = oErr.error.message.value;
                    } catch (e) {
                        // ignore
                    }
                    MessageToast.show(sMsg);
                }
            });
        }
    });
});