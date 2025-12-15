/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/kaar/ehsmportal/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
