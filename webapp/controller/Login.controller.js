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

            sap.ui.core.BusyIndicator.show(0);

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    console.log("Login response:", oData);

                    if (oData.Status === "Success") {
                        MessageToast.show("Login Successful");

                        // Get router from component
                        var oRouter = that.getOwnerComponent().getRouter();

                        if (!oRouter) {
                            console.error("Router not found!");
                            MessageToast.show("Navigation error: Router not initialized");
                            return;
                        }

                        console.log("Navigating to dashboard with employeeId:", sEmployeeId);

                        // Navigate to dashboard
                        oRouter.navTo("RouteDashboard", {
                            employeeId: sEmployeeId
                        });
                    } else {
                        MessageToast.show("Validation Failed: " + (oData.Status || "Unknown Error"));
                    }
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Login error:", oError);
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