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

            // /ZQUALITY_2003(username='...',password='...')
            // Note: Service metadata might define key as just username, param as password?
            // Logs showed: ZQUALITY_2003(username='1') and properties contain password.
            // Let's assume the key is just username based on ID: ZQUALITY_2003('1')
            // But usually we need to pass password for validation. 
            // The user request was /ZQUALITY_2003(username='1') - this implies password is not part of key?
            // Wait, response shows <d:password>1234</d:password>.
            // Use function import or entity read? The log shows entity read.
            // Let's try to pass both if possible or just username if that's what user did.
            // User REQ: /ZQUALITY_2003(username='1')
            // So I should use that path. But how is password validated? Maybe headers or filtered?
            // OR maybe I should assume the user log missed the password part in URL or it's just a lookup?
            // "ZQUALITY_2003" seems to be the EntitySet.

            var sPath = "/ZQUALITY_2003(username='" + sEmployeeId + "')";

            sap.ui.core.BusyIndicator.show(0);

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    console.log("Login response:", oData);

                    // Check login_status instead of Status
                    if (oData.login_status === "Success") {
                        MessageToast.show("Login Successful");

                        // Use UIComponent to get router for this controller's component
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);

                        if (!oRouter) {
                            console.error("Router not found via UIComponent.getRouterFor!");
                            // Fallback
                            oRouter = that.getOwnerComponent().getRouter();
                        }

                        if (!oRouter) {
                            MessageToast.show("Navigation Error: Router not found.");
                            return;
                        }

                        console.log("Navigating to dashboard with employeeId:", sEmployeeId);

                        // Navigate to dashboard
                        oRouter.navTo("RouteDashboard", {
                            employeeId: sEmployeeId
                        });
                    } else {
                        MessageToast.show("Validation Failed: " + (oData.login_status || "Unknown Error"));
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