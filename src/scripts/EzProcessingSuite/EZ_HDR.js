// Copyright (C) 2020-2023 S Dimant (aka darkarchon#4313)
// File name: EZ_HDR.js

#feature-id EZ Processing Suite > EZ HDR

var NAME = 'EZ HDR';
var VERSION = '0.1';
var AUTHOR = "S. Dimant";

#include "EZ_Common.js"

function saveSettings() {
	Settings.write("EZHDR.HDRAmount", 10, CurrentProcessingInfo.hdrAmount);
	Settings.write("EZHDR.HDRLayers", 1, CurrentProcessingInfo.hdrLayers);
}

function generateProcessingInfo() {
    let info = new ProcessingInfo();
    info.hdrLayers = readFromSettingsOrDefault("EZHDR.HDRLayers", 1, 5);
    info.hdrAmount = readFromSettingsOrDefault("EZHDR.HDRAmount", 10, 0.3);
    info.currentHDRRun = 0;
    info.rangeMaskId = null;
    return info;
}

function execute(window, bringToFront = true, runOnMain = false) {
    JobStack.startProcessing();
    ConsoleWriter.writeMessageStart("Running EZ HDR on " + window.mainView.id);

    CurrentProcessingInfo.rangeMaskId = createBackgroundMask(View.viewById(window.mainView.id),
        "_ez_HDR_" + window.mainView.id + "_bg", false);

    let hdrClone = cloneView(window.mainView, "_ez_HDR_" + window.mainView.id + "_HDR", true, false);
    ConsoleWriter.writeMessageBlock("Applying HDR to " + hdrClone.window.mainView.id);
    let hdr = new HDRMultiscaleTransform();
    hdr.numberOfLayers = CurrentProcessingInfo.hdrLayers;
    hdr.executeOn(hdrClone);
    window.removeMask();
    window.setMask(View.viewById(CurrentProcessingInfo.rangeMaskId).window, true);
    ConsoleWriter.writeMessageBlock("Blending HDR image with " + window.mainView.id);
    doPixelMath(window.mainView, 
        "(1-{0})*{1}+{0}*{2}".format(CurrentProcessingInfo.hdrAmount, window.mainView.id, hdrClone.window.mainView.id), true);
    window.removeMask();
    if(!runOnMain) {
        hdrClone.window.forceClose();
    } else {
        hdrClone.window.iconize();
    }
    JobStack.stopProcessing();
    ConsoleWriter.writeMessageEnd("EZ HDR run complete");
    return window.mainView;
}

function onExit() { 
    // is called on exiting module
}

function onInit() { 
    // is called on initializing module
}

function customizeDialog() {
    // customize GlobalDialog appearance and everything
    GlobalDialog.infoBox.text = "<b>EZ HDR</b>: This script attempts to bring back details from bright galaxy and nebula cores.";
    GlobalDialog.tutorialPrerequisites = ["Non-Linear image"];
    GlobalDialog.tutorialSteps = [
        "Set blend strength, this sets how much of the HDR image is blended into the image",
        "Set the amount of layers that you want to be affected by the HDR process, the smaller the finer the HDR will be"
    ]

    // custom binding for the GlobalDialog only, use .bindings for everything else!
    GlobalDialog.customBindings = function() { }

    // uncomment if evaluate button should be shown
    // GlobalDialog.onEvaluateButton.show()

    GlobalDialog.onExit = function() {
        // called on exiting the GlobalDialog
    }

    // uncomment if previews should be allowed to be chosen
    // GlobalDialog.allowPreviews();

    GlobalDialog.onSelectedMainView = function(view, prevMainViewId) {
        if(view.computeOrFetchProperty("Median").at(0) < 0.1) {
            let result = GlobalDialog.showWarningDialog("Median lower 0.1. Unlikely this is a linear image. This script only works on non-linear images.", "Failed to load", "Continue anyway", true);
            if(result != 1) {
                GlobalDialog.mainViewSelector.remove(view);
                CurrentProcessingInfo.mainViewId = null;
                return;
            }
        }
        
        if(prevMainViewId == CurrentProcessingInfo.mainViewId) return;

        if(CurrentProcessingInfo.rangeMaskId != null) {
            View.viewById(CurrentProcessingInfo.rangeMaskId).window.forceClose();
        }

        for (let i = GlobalDialog.tabBox.numberOfPages - 1; i >= 0; i--) {
            GlobalDialog.tabBox.pageControlByIndex(i).dispose();
            GlobalDialog.tabBox.removePage(i);
        }

        /* // not used for first iteration
        GlobalDialog.addMainControl(CurrentProcessingInfo.workingViewId);
        GlobalDialog.tabBox.show();
        if (prevMainViewId == null) 
        {
            GlobalDialog.width *= 3;
            GlobalDialog.setScaledMinWidth(GlobalDialog.width);
        }
        */
    }

    /* // not used for first iteration
    GlobalDialog.addMainControl = function(viewId) {
        let viewControl = new PreviewControl(GlobalDialog, true, true);
        viewControl.STF = DEFAULT_STF;
        viewControl.SetView(View.viewById(viewId), false);

        viewControl.swap = function () {
            GlobalDialog.tabBox.currentPageIndex = GlobalDialog.tabBox.numberOfPages - 1;
        }
        let swapToLatestButton = new PushButton(viewControl);
        swapToLatestButton.text = "Change Tab to Latest Run";
        swapToLatestButton.onClick = function () {
            viewControl.swap.call(viewControl);
        }
        swapToLatestButton.bindings = function () {
            swapToLatestButton.text = "Change Tab to " + GlobalDialog.tabBox.pageLabel(GlobalDialog.tabBox.numberOfPages - 1);
        }

        viewControl.infoFrame.sizer.insertItem(0, swapToLatestButton);

        GlobalDialog.tabBox.insertPage(0, viewControl, viewId);
    } */

    GlobalDialog.onEmptyMainView = function() {
        /* // not used for first iteration
        for (let i = GlobalDialog.tabBox.numberOfPages - 1; i >= 0; i--) {
            GlobalDialog.tabBox.pageControlByIndex(i).dispose();
            GlobalDialog.tabBox.removePage(i);
        }

        GlobalDialog.tabBox.hide();
        GlobalDialog.adjustToContents();
        GlobalDialog.setScaledMinWidth(GlobalDialog.width);
        */
    }

    GlobalDialog.canRun = function() {
        return CurrentProcessingInfo.mainViewId != null;
    }

    GlobalDialog.canEvaluate = function() {
        return CurrentProcessingInfo.mainViewId != null;
    }

	GlobalDialog.onEvaluate = function () {
    }
    
    GlobalDialog.amountSlider = new NumericControl(GlobalDialog);
    with (GlobalDialog.amountSlider) {
        label.text = "HDR Blend";
		label.minWidth = 100;
		setRange(0.01, 0.4);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 60;
		setPrecision(2);
		edit.scaledMinWidth = 60;
		bindings = function() {
			this.setValue(CurrentProcessingInfo.hdrAmount);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.hdrAmount = value;
		}
    }

    GlobalDialog.layerSlider = new NumericControl(GlobalDialog);
    with (GlobalDialog.layerSlider) {
        label.text = "HDR Layers";
		label.minWidth = 100;
		setRange(3, 7);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 60;
		setPrecision(0);
		edit.scaledMinWidth = 60;
		bindings = function() {
			this.setValue(CurrentProcessingInfo.hdrLayers);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.hdrLayers = value;
		}
    }

    GlobalDialog.resetButton = new PushButton(GlobalDialog);
	with(GlobalDialog.resetButton) {
		text = "Reset EZ HDR Settings";
		toolTip = "Reset EZ HDR to default settings";
		icon = GlobalDialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.hdrLayers = 5;
			CurrentProcessingInfo.hdrAmount = 0.3;
		}
	}

    GlobalDialog.mainControl.sizer.addItem(GlobalDialog.amountSlider);
    GlobalDialog.mainControl.sizer.addItem(GlobalDialog.layerSlider);
    GlobalDialog.mainControl.sizer.addItem(GlobalDialog.resetButton);
    GlobalDialog.mainControl.bindings = function() {
        this.enabled = GlobalDialog.canRun();
    }

    GlobalDialog.setScaledMaxWidth(300);
    GlobalDialog.control.setScaledMaxWidth(300);
    GlobalDialog.setScaledMinWidth(300);
    GlobalDialog.control.setScaledMinWidth(300);
    GlobalDialog.adjustToContents();
}

main();