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
    startProcessing();
    writeMessageStart("Running EZ HDR on " + window.mainView.id);

    CurrentProcessingInfo.rangeMaskId = createBackgroundMask(View.viewById(window.mainView.id),
        "_ez_HDR_" + window.mainView.id + "_bg", false);

    let hdrClone = cloneView(window.mainView, "_ez_HDR_" + window.mainView.id + "_HDR", true, false);
    writeMessageBlock("Applying HDR to " + hdrClone.window.mainView.id);
    let hdr = new HDRMultiscaleTransform();
    hdr.numberOfLayers = CurrentProcessingInfo.hdrLayers;
    hdr.executeOn(hdrClone);
    window.removeMask();
    window.setMask(View.viewById(CurrentProcessingInfo.rangeMaskId).window, true);
    writeMessageBlock("Blending HDR image with " + window.mainView.id);
    doPixelMath(window.mainView, 
        "(1-{0})*{1}+{0}*{2}".format(CurrentProcessingInfo.hdrAmount, window.mainView.id, hdrClone.window.mainView.id), true);
    window.removeMask();
    if(!runOnMain) {
        hdrClone.window.forceClose();
    } else {
        hdrClone.window.iconize();
    }
    stopProcessing();
    writeMessageEnd("EZ HDR run complete");
    return window.mainView;
}

function onExit() { 
    // is called on exiting module
}

function onInit() { 
    // is called on initializing module
}

function customizeDialog() {
    // customize dialog appearance and everything
    dialog.infoBox.text = "<b>EZ HDR</b>: This script attempts to bring back details from bright galaxy and nebula cores.";
    dialog.tutorialPrerequisites = ["Non-Linear image"];
    dialog.tutorialSteps = [
        "Set blend strength, this sets how much of the HDR image is blended into the image",
        "Set the amount of layers that you want to be affected by the HDR process, the smaller the finer the HDR will be"
    ]

    // custom binding for the dialog only, use .bindings for everything else!
    dialog.customBindings = function() { }

    // uncomment if evaluate button should be shown
    // dialog.onEvaluateButton.show()

    dialog.onExit = function() { 
        // called on exiting the dialog
    }

    // uncomment if previews should be allowed to be chosen
    // dialog.allowPreviews();

    dialog.onSelectedMainView = function(view, prevMainViewId) {
        if(view.computeOrFetchProperty("Median").at(0) < 0.1) {
            let result = dialog.showWarningDialog("Median lower 0.1. Unlikely this is a linear image. This script only works on non-linear images.", "Failed to load", "Continue anyway", true);
            if(result != 1) {
                dialog.mainViewSelector.remove(view);
                CurrentProcessingInfo.mainViewId = null;
                return;
            }
        }
        
        if(prevMainViewId == CurrentProcessingInfo.mainViewId) return;

        if(CurrentProcessingInfo.rangeMaskId != null) {
            View.viewById(CurrentProcessingInfo.rangeMaskId).window.forceClose();
        }

        for (let i = dialog.tabBox.numberOfPages - 1; i >= 0; i--) {
            dialog.tabBox.pageControlByIndex(i).dispose();
            dialog.tabBox.removePage(i);
        }

        /* // not used for first iteration
        dialog.addMainControl(CurrentProcessingInfo.workingViewId);
        dialog.tabBox.show();
        if (prevMainViewId == null) 
        {
            dialog.width *= 3;
            dialog.setScaledMinWidth(dialog.width);
        }
        */
    }

    /* // not used for first iteration
    dialog.addMainControl = function(viewId) {
        let viewControl = new PreviewControl(dialog, true, true);
        viewControl.STF = DEFAULT_STF;
        viewControl.SetView(View.viewById(viewId), false);

        viewControl.swap = function () {
            dialog.tabBox.currentPageIndex = dialog.tabBox.numberOfPages - 1;
        }
        let swapToLatestButton = new PushButton(viewControl);
        swapToLatestButton.text = "Change Tab to Latest Run";
        swapToLatestButton.onClick = function () {
            viewControl.swap.call(viewControl);
        }
        swapToLatestButton.bindings = function () {
            swapToLatestButton.text = "Change Tab to " + dialog.tabBox.pageLabel(dialog.tabBox.numberOfPages - 1);
        }

        viewControl.infoFrame.sizer.insertItem(0, swapToLatestButton);

        dialog.tabBox.insertPage(0, viewControl, viewId);
    } */

    dialog.onEmptyMainView = function() {
        /* // not used for first iteration
        for (let i = dialog.tabBox.numberOfPages - 1; i >= 0; i--) {
            dialog.tabBox.pageControlByIndex(i).dispose();
            dialog.tabBox.removePage(i);
        }

        dialog.tabBox.hide();
        dialog.adjustToContents();
        dialog.setScaledMinWidth(dialog.width);
        */
    }

    dialog.canRun = function() {
        return CurrentProcessingInfo.mainViewId != null;
    }

    dialog.canEvaluate = function() {
        return CurrentProcessingInfo.mainViewId != null;
    }

	dialog.onEvaluate = function () {
    }
    
    dialog.amountSlider = new NumericControl(dialog);
    with (dialog.amountSlider) {
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

    dialog.layerSlider = new NumericControl(dialog);
    with (dialog.layerSlider) {
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

    dialog.resetButton = new PushButton(dialog);
	with(dialog.resetButton) {
		text = "Reset EZ HDR Settings";
		toolTip = "Reset EZ HDR to default settings";
		icon = dialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.hdrLayers = 5;
			CurrentProcessingInfo.hdrAmount = 0.3;
		}
	}

    dialog.mainControl.sizer.addItem(dialog.amountSlider);
    dialog.mainControl.sizer.addItem(dialog.layerSlider);
    dialog.mainControl.sizer.addItem(dialog.resetButton);
    dialog.mainControl.bindings = function() {
        this.enabled = dialog.canRun();
    }

    dialog.setScaledMaxWidth(300);
    dialog.control.setScaledMaxWidth(300);
    dialog.setScaledMinWidth(300);
    dialog.control.setScaledMinWidth(300);
    dialog.adjustToContents();
}

main();