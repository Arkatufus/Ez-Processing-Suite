/*
 * ------------------- Version 2020-06-03 --------------------
 * tested on PixInsight 1.8.8-5 Ripley
 *
 * Maskgenerator for Rista NR method ( https://jonrista.com/the-astrophotographers-guide/pixinsights/effective-noise-reduction-part-1/ )
 *
 * This script allows fast and efficient mask generation as well as an option to perform the steps TGVNR and MMT automatically.
 *
 *
 *
 * Made by M Schuh (aka NGC7162#7162) & S Dimant (aka darkarchon#4313)
 * Original TGV Denoise idea by Jon Rista
 * 
 * NoiseEvaluation method modified from the NoiseEvaluation Script:
 *
// Copyright (c) 2003-2010, Pleiades Astrophoto S.L. All Rights Reserved.
//
// Redistribution and use in both source and binary forms, with or without
// modification, is permitted provided that the following conditions are met:
//
// 1. All redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//
// 2. All redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// 3. Neither the names "PixInsight" and "Pleiades Astrophoto", nor the names
//    of their contributors, may be used to endorse or promote products derived
//    from this software without specific prior written permission. For written
//    permission, please contact info@pixinsight.com.
//
// 4. All products derived from this software, in any form whatsoever, must
//    reproduce the following acknowledgment in the end-user documentation
//    and/or other materials provided with the product:
//
//    "This product is based on software from the PixInsight project, developed
//    by Pleiades Astrophoto and its contributors (http://pixinsight.com/)."
//
//    Alternatively, if that is where third-party acknowledgments normally
//    appear, this acknowledgment must be reproduced in the product itself.
//
// THIS SOFTWARE IS PROVIDED BY PLEIADES ASTROPHOTO AND ITS CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PLEIADES ASTROPHOTO OR ITS
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, BUSINESS
// INTERRUPTION; PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; AND LOSS OF USE,
// DATA OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
// ****************************************************************************
*/

#feature-id EZ Processing Suite > EZ Denoise

var NAME = 'EZ Denoise';
var VERSION = '1.11HF1';
var AUTHOR = "M. Schuh & S. Dimant";

#include "EZ_Common.js"

//Mask settings
#define DEFAULT_TGV_MEDIAN 0.5
#define DEFAULT_TGV_LOW	0.25
#define DEFAULT_TGV_HIGH 0.55
#define DEFAULT_MMT_MEDIAN 0.75

// VARIABLE NAMING SCHEME
// - Generally, if applicable, variables end with the type of the variable (i.e. View, Window, etc.)
// - Global declared variables use UpperCamelCase
// - local used variables are lowerCamelCase
// - avoid using var inside functions, prefer let

// generated masks and support structures
var TgvMaskView = null;
var TgvSupportView = null;
var TgvMmtMaskView = null;
var TgvLCloneView = null;
// used for running on previews
var TgvPreviewWindow = null;

function onInit() { }
function onExit() {
	if(CurrentProcessingInfo.closeMaskImages) {
		if(TgvMaskView != null) {
			TgvMaskView.window.forceClose();
			TgvSupportView.window.forceClose();
			TgvMmtMaskView.window.forceClose();
		}
	}
}

function saveSettings() {
	Settings.write("EZDenoise.Mask.TGVMaskMean", 10, CurrentProcessingInfo.tgvMaskMean);
	Settings.write("EZDenoise.Mask.TGVContrastLow", 10, CurrentProcessingInfo.tgvContrastLow);
	Settings.write("EZDenoise.Mask.TGVContrastHigh", 10, CurrentProcessingInfo.tgvContrastHigh);
	Settings.write("EZDenoise.Mask.MMTMean", 10, CurrentProcessingInfo.tgvMmtMaskMean);

	Settings.write("EZDenoise.TGV.Run", 0, CurrentProcessingInfo.runTgv);
	Settings.write("EZDenoise.TGV.EdgeProtectionMultiplier", 10, CurrentProcessingInfo.tgvEdgeProtectionMultiplier);
	Settings.write("EZDenoise.TGV.DenoiseSupport", 1, CurrentProcessingInfo.tgvDenoiseSupport);
	Settings.write("EZDenoise.TGV.Smoothness", 10, CurrentProcessingInfo.tgvSmoothness);
	Settings.write("EZDenoise.TGV.Strength", 10, CurrentProcessingInfo.tgvStrength);
	Settings.write("EZDenoise.TGV.Iterations", 3, CurrentProcessingInfo.tgvIterations);

	Settings.write("EZDenoise.MMT.Run", 0, CurrentProcessingInfo.runMmt);
	Settings.write("EZDenoise.MMT.WaveletStr1", 10, CurrentProcessingInfo.TgvMmtStr[0]);
	Settings.write("EZDenoise.MMT.WaveletStr2", 10, CurrentProcessingInfo.TgvMmtStr[1]);
	Settings.write("EZDenoise.MMT.WaveletStr3", 10, CurrentProcessingInfo.TgvMmtStr[2]);
	Settings.write("EZDenoise.MMT.WaveletStr4", 10, CurrentProcessingInfo.TgvMmtStr[3]);
	Settings.write("EZDenoise.MMT.WaveletStr5", 10, CurrentProcessingInfo.TgvMmtStr[4]);
	Settings.write("EZDenoise.MMT.WaveletStr6", 10, CurrentProcessingInfo.TgvMmtStr[5]);
	Settings.write("EZDenoise.MMT.WaveletStr7", 10, CurrentProcessingInfo.TgvMmtStr[6]);
	Settings.write("EZDenoise.MMT.WaveletStr8", 10, CurrentProcessingInfo.TgvMmtStr[7]);
	Settings.write("EZDenoise.MMT.WaveletThr1", 10, CurrentProcessingInfo.TgvMmtThr[0]);
	Settings.write("EZDenoise.MMT.WaveletThr2", 10, CurrentProcessingInfo.TgvMmtThr[1]);
	Settings.write("EZDenoise.MMT.WaveletThr3", 10, CurrentProcessingInfo.TgvMmtThr[2]);
	Settings.write("EZDenoise.MMT.WaveletThr4", 10, CurrentProcessingInfo.TgvMmtThr[3]);
	Settings.write("EZDenoise.MMT.WaveletThr5", 10, CurrentProcessingInfo.TgvMmtThr[4]);
	Settings.write("EZDenoise.MMT.WaveletThr6", 10, CurrentProcessingInfo.TgvMmtThr[5]);
	Settings.write("EZDenoise.MMT.WaveletThr7", 10, CurrentProcessingInfo.TgvMmtThr[6]);
	Settings.write("EZDenoise.MMT.WaveletThr8", 10, CurrentProcessingInfo.TgvMmtThr[7]);
	Settings.write("EZDenoise.TGV.CloseMasks", 0, CurrentProcessingInfo.closeMaskImages);
}

function generateProcessingInfo() {
	let denoiseInfo = new DenoiseInfo();
	denoiseInfo.tgvMaskMean = readFromSettingsOrDefault("EZDenoise.Mask.TGVMaskMean", 10, DEFAULT_TGV_MEDIAN);
	denoiseInfo.tgvContrastLow = readFromSettingsOrDefault("EZDenoise.Mask.TGVContrastLow", 10, DEFAULT_TGV_LOW);
	denoiseInfo.tgvContrastHigh = readFromSettingsOrDefault("EZDenoise.Mask.TGVContrastHigh", 10, DEFAULT_TGV_HIGH);
	denoiseInfo.tgvMmtMaskMean = readFromSettingsOrDefault("EZDenoise.Mask.MMTMean", 10, DEFAULT_MMT_MEDIAN);
	denoiseInfo.tgvNoiseEvaluation = true;
	denoiseInfo.tgvBackgroundReference = null;
	denoiseInfo.tgvDenoiseSupport = readFromSettingsOrDefault("EZDenoise.TGV.DenoiseSupport", 1, 0);
	denoiseInfo.tgvStrength = readFromSettingsOrDefault("EZDenoise.TGV.Strength", 10, 2);
	denoiseInfo.tgvSmoothness = readFromSettingsOrDefault("EZDenoise.TGV.Smoothness", 10, 0.8);
	denoiseInfo.tgvIterations = readFromSettingsOrDefault("EZDenoise.TGV.Iterations", 3, 1500);
	denoiseInfo.tgvEdgeProtectionMultiplier = readFromSettingsOrDefault("EZDenoise.TGV.EdgeProtectionMultiplier", 10, 1);
	denoiseInfo.runTgv = readFromSettingsOrDefault("EZDenoise.TGV.Run", 0, false);
	denoiseInfo.TgvMmtStr = [
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr1", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr2", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr3", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr4", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr5", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr6", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr7", 10, 1),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletStr8", 10, 1),
	];
	denoiseInfo.TgvMmtThr = [
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr1", 10, 10),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr2", 10, 10),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr3", 10, 7),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr4", 10, 5),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr5", 10, 5),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr6", 10, 2.5),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr7", 10, 2),
		readFromSettingsOrDefault("EZDenoise.MMT.WaveletThr8", 10, 2),
	];
	denoiseInfo.runMmt = readFromSettingsOrDefault("EZDenoise.MMT.Run", 0, true);
	denoiseInfo.denoiseRun = 0;
	denoiseInfo.closeMaskImages = readFromSettingsOrDefault("EZDenoise.TGV.CloseMasks", 0, false);
	return denoiseInfo;
}

function execute(window, bringToFront = true, runOnMain = false) {
	writeMessageStart("Running " + NAME)
	createMasks();

	if(bringToFront) {
		window.bringToFront();
	}

	if(CurrentProcessingInfo.masksOnly != null && CurrentProcessingInfo.masksOnly) {
		return window;
	}

	let workingView = window.mainView;

	let runningOnPreview = workingView.id != CurrentProcessingInfo.workingViewId;

	if (runningOnPreview && !runOnMain) {
		workingView = cloneView(View.viewById(CurrentProcessingInfo.workingViewId), "_ez_temp_working_" + CurrentProcessingInfo.mainViewId);
	}

	if (CurrentProcessingInfo.runTgv == true) {
		if(CurrentProcessingInfo.runOnFullImage != null && CurrentProcessingInfo.runOnFullImage) {
			window.currentView = window.mainView;
		}
		writeMessageStart("Running Denoise");
		workingView = doTgv(workingView, View.viewById(CurrentProcessingInfo.workingViewId).isPreview && !runOnMain);
		writeMessageEnd("Denoise done");
	}

	// clean up L clone for RGB
	if (TgvLCloneView != null) {
		TgvLCloneView.window.forceClose();
	}

	writeMessageEnd("Finished");
	return workingView;
}

// runs the denoising function on the current window
function doTgv(view, isPreview) {

	let calculatedStdDev;
	let workingWindow = view.window;

	if (!CurrentProcessingInfo.tgvNoiseEvaluation) {
		writeMessageBlock("Calcuating stdDev of Background Preview " + CurrentProcessingInfo.tgvBackgroundReference);
		let backgroundReference = View.viewById(CurrentProcessingInfo.tgvBackgroundReference);

		if(!backgroundReference.image.isColor) {
			calculatedStdDev = backgroundReference.image.stdDev();
		} else {
			let cloned = cloneView(backgroundReference, "_ez_temp_bg_rgb", true, false);
			let extracted = extractLightness(cloned);
			cloned.window.forceClose();
			calculatedStdDev = extracted.image.stdDev();
			extracted.window.forceClose();
		}
	} else {
		calculatedStdDev = TgvLCloneView != null ? noiseEvaluation(TgvLCloneView.window) : noiseEvaluation(view.window);
	}

	let workingTgvMaskView = TgvMaskView;
	let workingMmtMaskView = TgvMmtMaskView;
	let workingTgvSupportView = TgvSupportView;
	// if we work on a preview we need to create a clone of that
	// it's not possible to apply multiple processes on a preview otherwise
	// also clone all masks to have the correct sizes
	if(isPreview && (CurrentProcessingInfo.tgvCreateProcessOnly == null || !CurrentProcessingInfo.tgvCreateProcessOnly)) {
		writeMessageBlock("Creating Preview clones");
		let window = View.viewById(CurrentProcessingInfo.mainViewId).window;
		let mainWorkingView = View.viewById(CurrentProcessingInfo.workingViewId);
		workingWindow = cloneView(view, "TGVPreview").window;
		view.window.forceClose();
		TgvPreviewWindow = workingWindow;
		let tgvMaskPreview = TgvMaskView.window.createPreview(window.previewRect(mainWorkingView),
			"TGVMaskPreview");
		workingTgvMaskView = cloneView(tgvMaskPreview, "TGVMaskPreview", true);
		let mmtMaskPreview = TgvMmtMaskView.window.createPreview(window.previewRect(mainWorkingView),
			"MMTMaskPreview");
		workingMmtMaskView = cloneView(mmtMaskPreview, "MMTMaskPreview", true);
		let tgvSupportPreview = TgvSupportView.window.createPreview(window.previewRect(mainWorkingView),
			"TGVSupportPreview");
		workingTgvSupportView = cloneView(tgvSupportPreview, "TGVSupportPreview", true);
		workingWindow.bringToFront();
	}

	writeMessageBlock("Calculated noise estimation (does not include multiplier): " + calculatedStdDev);

	CurrentProcessingInfo.tgvEdgeProtection = calculatedStdDev * CurrentProcessingInfo.tgvEdgeProtectionMultiplier;

	// exec tgv denoise using stddev as edge protection
	var tgv = new TGVDenoise();
	workingWindow.setMask(workingTgvMaskView.window);
	workingWindow.maskInverted = true;

	tgv.supportViewId = workingTgvSupportView.id;
	tgv.supportEnabled = true;
	tgv.supportRemovedWaveletLayers = CurrentProcessingInfo.tgvDenoiseSupport;
	tgv.smoothnessL = CurrentProcessingInfo.tgvSmoothness;
	tgv.strengthL = CurrentProcessingInfo.tgvStrength;
	tgv.edgeProtectionL = CurrentProcessingInfo.tgvEdgeProtection;

	tgv.rgbkMode = true;
	tgv.filterEnabledC = false;
	tgv.maxIterationsL = CurrentProcessingInfo.tgvIterations;

	if (CurrentProcessingInfo.tgvCreateProcessOnly != null && CurrentProcessingInfo.tgvCreateProcessOnly) {
		writeMessageBlock("Running TGVDenoise");
		tgv.launch();
	} else {
		tgv.executeOn(workingWindow.currentView);
	}

	// exec mmt based on default mmt strong settings
	if (CurrentProcessingInfo.runMmt) {
		writeMessageBlock("Running MultiscaleMedianTransform");
		workingWindow.setMask(workingMmtMaskView.window);
		workingWindow.maskInverted = true;

		var mmt = new MultiscaleMedianTransform;
		mmt.layers = [ // enabled, biasEnabled, bias, noiseReductionEnabled, noiseReductionThreshold, noiseReductionAmount, noiseReductionAdaptive
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[0], CurrentProcessingInfo.TgvMmtStr[0], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[1], CurrentProcessingInfo.TgvMmtStr[1], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[2], CurrentProcessingInfo.TgvMmtStr[2], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[3], CurrentProcessingInfo.TgvMmtStr[3], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[4], CurrentProcessingInfo.TgvMmtStr[4], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[5], CurrentProcessingInfo.TgvMmtStr[5], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[6], CurrentProcessingInfo.TgvMmtStr[6], 0.0000],
			[true, true, 0.000, true, CurrentProcessingInfo.TgvMmtThr[7], CurrentProcessingInfo.TgvMmtStr[7], 0.0000],
			[true, true, 0.000, false, 1.0000, 1.00, 0.0000]
		];
		mmt.transform = MultiscaleMedianTransform.prototype.MultiscaleMedianTransform;
		mmt.medianWaveletThreshold = 5.00;
		mmt.scaleDelta = 0;
		mmt.linearMask = false;
		mmt.linearMaskAmpFactor = 100;
		mmt.linearMaskSmoothness = 1.00;
		mmt.linearMaskInverted = true;
		mmt.linearMaskPreview = false;
		mmt.lowRange = 0.0000;
		mmt.highRange = 0.0000;
		mmt.previewMode = MultiscaleMedianTransform.prototype.Disabled;
		mmt.previewLayer = 0;
		mmt.toLuminance = true;
		mmt.toChrominance = true;
		mmt.linear = true;

		if (CurrentProcessingInfo.tgvCreateProcessOnly != null && CurrentProcessingInfo.tgvCreateProcessOnly) {
			mmt.launch();
		} else {
			mmt.executeOn(workingWindow.currentView);
		}
	}

	workingWindow.removeMask();

	// close mask images if requested
	if (CurrentProcessingInfo.tgvCloseMasks != null && CurrentProcessingInfo.tgvCloseMasks) {
		TgvSupportView.window.forceClose();
		TgvMaskView.window.forceClose();
		TgvMmtMaskView.window.forceClose();
	}

	if (isPreview) {
		workingTgvSupportView.window.forceClose();
		workingMmtMaskView.window.forceClose();
		workingTgvMaskView.window.forceClose();
	}

	return workingWindow.currentView;
}

// creation of all necessary masks based on current window
function createMasks() {
	writeMessageStart("Creating masks");
	let workingView = View.viewById(CurrentProcessingInfo.mainViewId);

	if(workingView.image.isColor) {
		TgvLCloneView = extractLightness(workingView);
		workingView = TgvLCloneView;
	}

	//create intermediate image and apply STF
	writeMessageBlock("Creating TGVSupport");
	TgvSupportView = cloneView(workingView, "_ez_TGVSupport_" + CurrentProcessingInfo.mainViewId);
	doSTF(TgvSupportView)
	doHistogramTransformation(TgvSupportView);

	//Make the MMT Mask
	writeMessageBlock("Creating MMTMask");
	TgvMmtMaskView = cloneView(TgvSupportView, "_ez_MMTMask_" + CurrentProcessingInfo.mainViewId);
	stretchToValue(TgvMmtMaskView, CurrentProcessingInfo.tgvMmtMaskMean);

	//Make TGV Mask
	writeMessageBlock("Creating TGVMask");
	TgvMaskView = cloneView(TgvSupportView, "_ez_TGVMask_" + CurrentProcessingInfo.mainViewId);
	applyCT(TgvMaskView, CurrentProcessingInfo.tgvContrastLow, CurrentProcessingInfo.tgvContrastHigh);
	stretchToValue(TgvMaskView, CurrentProcessingInfo.tgvMaskMean);
	writeMessageEnd("Masks created");
}

// applies curves to masks
function applyCT(view, low, high) {
	var curves = new CurvesTransformation;
	curves.K = [[0, low],
	[1, high]];
	curves.executeOn(view);
}


function customizeDialog() {
	dialog.infoBox.text = "<b>RistaMask / EZ Denoise:</b> A script to efficiently create masks and perform automatical noise reduction based on the method described by Jon Rista. The script is meant to be used on a linear image, directly after background modelization, color calibration and deconvolution."
	dialog.allowPreviews();

	dialog.bindings = null;

	dialog.tutorialPrerequisites = [
		"Image is cropped properly",
		"Image is not stretched (image is linear)"
	];
	dialog.tutorialSteps = ["Select image or preview to apply to",
		"If you just want to make masks for TGV Denoise select 'Create Masks Only'",
		"Otherwise it is recommended to select a preview in your image",
		"Run evaluation and check the results, it is recommended to run evaluation at about 250 iterations. However 250 iterations are not fully representative.",
		"Should noise evaluation fail, use a background preview",
		"If the denoise is too strong the first parameter to change would be the edge protection multiplier to 0.7 and decrease if necessary",
		"If too many dark structures are removed, decrease the MMT strength or increase the MMT mask median",
		"Once satisfied with preview results it is recommended to apply it to the whole image with the button on the right while adjusting the iterations to 1000-1500",
	];
	
	dialog.onEvaluateButton.show();


	dialog.onExit = function() { }

	dialog.onEvaluate = function () {
		// take original image
		let orgControl = dialog.tabBox.pageControlByIndex(0);
		let orgWindow = orgControl.previewFrameWindow;

		// clone it
		let clone = cloneView(orgWindow.mainView, "_ez_temp_DenoiseRun", true);

		// run decon
		let ranClone = execute(clone.window, false);
		clone.window.forceClose();

		// assign it to control
		let previewControl = new PreviewControl(dialog, true, true);

		previewControl.swap = function () {
			dialog.tabBox.currentPageIndex = 0;
		}

		previewControl.STF = dialog.tabBox.pageControlByIndex(0).STF;
		previewControl.SetView(ranClone, true);
		ranClone.window.forceClose();

		let swapToLatestButton = new PushButton(this);
		swapToLatestButton.text = "Change Tab to Original";
		swapToLatestButton.onClick = function () {
			previewControl.swap.call(previewControl);
		}
		previewControl.infoFrame.sizer.insertItem(0, swapToLatestButton);

		let closeButton = new PushButton(this);
		closeButton.text = "Close Tab";
		closeButton.icon = this.scaledResource(":/icons/cancel.png");
		closeButton.onClick = function () {
			previewControl.dispose();
			let index = 0;
			for (let i = 0; i < dialog.tabBox.numberOfPages; i++) {
				if (dialog.tabBox.pageControlByIndex(i) === previewControl) {
					index = i;
					break;
				}
			}
			dialog.tabBox.removePage(index);
		}
		previewControl.infoFrame.sizer.insertItem(1, closeButton);

		dialog.tabBox.addPage(previewControl, "Denoise Run " + (++CurrentProcessingInfo.denoiseRun));
		previewControl.SetProcessingInfo(CurrentProcessingInfo, "Denoise Run " + (CurrentProcessingInfo.denoiseRun));

		previewControl.iterTextBox = new NumericControl(previewControl);
		with (previewControl.iterTextBox) {
			label.text = "Iterations";
			label.scaledMinWidth = 100;
			setRange(100, 5000);
			toolTip = "Iterations for this run";
			slider.setRange(1, 5000);
			slider.scaledMinWidth = 150;
			setPrecision(2);
			setValue(previewControl.processingInfo.tgvIterations);
			onValueUpdated = function (value) {
				previewControl.processingInfo.tgvIterations = value;
			}
		}
		previewControl.applyGroupBox.sizer.insertItem(0, previewControl.iterTextBox);

		dialog.tabBox.currentPageIndex = dialog.tabBox.numberOfPages - 1;

		TgvMaskView.window.forceClose();
		TgvSupportView.window.forceClose();
		TgvMmtMaskView.window.forceClose();

		TgvMaskView = null;
		TgvSupportView = null;
		TgvMmtMaskView = null;
		TgvLCloneView = null;
	}

	dialog.addMainControl = function (viewId, expand) {
		let previewControl = new PreviewControl(dialog, true, true);

		previewControl.swap = function () {
			dialog.tabBox.currentPageIndex = dialog.tabBox.numberOfPages - 1;
		}

		previewControl.SetView(View.viewById(viewId));

		let swapToLatestButton = new PushButton(previewControl);
		swapToLatestButton.bindings = function() {
			swapToLatestButton.text = "Change Tab to " + dialog.tabBox.pageLabel(dialog.tabBox.numberOfPages-1);
		}
		swapToLatestButton.onClick = function () {
			previewControl.swap.call(previewControl);
		}
		previewControl.infoFrame.sizer.insertItem(0, swapToLatestButton);

		dialog.tabBox.insertPage(0, previewControl, CurrentProcessingInfo.workingViewId);

		dialog.tabBox.show();
	}

	dialog.onSelectedMainView = function(newMainViewId, prevMainViewId) {
		if (prevMainViewId != CurrentProcessingInfo.mainViewId) {
			for (let i = dialog.tabBox.numberOfPages - 1; i >= 0; i--) {
				dialog.tabBox.pageControlByIndex(i).dispose();
				dialog.tabBox.removePage(i);
			}
		} else {
			try {
				dialog.tabBox.pageControlByIndex(0).dispose();
				dialog.tabBox.removePage(0);
			} catch (e) { }
		}

		dialog.addMainControl(CurrentProcessingInfo.workingViewId);
		if(prevMainViewId == null) dialog.width *= 3;
		dialog.tabBox.currentPageIndex = 0;
	}

	dialog.onEmptyMainView = function () {
		for (let i = dialog.tabBox.numberOfPages - 1; i >= 0; i--) {
			dialog.tabBox.pageControlByIndex(i).dispose();
			dialog.tabBox.removePage(i);
		}

		dialog.tabBox.hide();
		dialog.adjustToContents();
	}


	dialog.canEvaluate = function() {
		return dialog.canRun();
	}

	dialog.canRun = function() {
		return ((CurrentProcessingInfo.tgvBackgroundReference != null)
			|| CurrentProcessingInfo.tgvNoiseEvaluation == true)
			&& CurrentProcessingInfo.runTgv
			&& CurrentProcessingInfo.mainViewId != null;
	}
	// #region "Mask"
	dialog.tgvTargetMeanSlider = new NumericControl(dialog);
	with (dialog.tgvTargetMeanSlider) {
		label.text = "Target mean";
		label.scaledMinWidth = 100;
		setRange(0.25, 0.75);
		toolTip = "Target mean value for the TGV mask. Higher values offer higher protection";
		slider.setRange(0, 1000);
		slider.scaledMinWidth = 250;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvMaskMean);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvMaskMean = value;
		}
	}

	dialog.tgvContrastLowSlider = new NumericControl(dialog);
	with (dialog.tgvContrastLowSlider) {
		toolTip = "Linear curves transformation will be applied. The low parameter represents the what value 0 will be mapped to, the high parameter represents what 1 will be mapped to.";
		label.text = "Contrast low";
		label.scaledMinWidth = 100;
		setRange(0.05, 0.45);
		slider.setRange(0, 1000);
		slider.scaledMinWidth = 250;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvContrastLow);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvContrastLow = value;
		}
	}

	dialog.tgvContrastHighSlider = new NumericControl(dialog);
	with (dialog.tgvContrastHighSlider) {
		toolTip = "Linear curves transformation will be applied. The low parameter represents the what value 0 will be mapped to, the high parameter represents what 1 will be mapped to.";
		label.text = "Contrast high";
		label.scaledMinWidth = 100;
		setRange(0.30, 0.75);
		slider.setRange(0, 1000);
		slider.scaledMinWidth = 250;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvContrastHigh);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvContrastHigh = value;
		}
	}

	dialog.mmtTargetMeanSlider = new NumericControl(dialog);
	with (dialog.mmtTargetMeanSlider) {
		toolTip = "Target mean value of the mask for MultiscaleMedianTransform";
		label.text = "Target mean";
		label.scaledMinWidth = 100;
		setRange(0.5, 0.99);
		slider.setRange(0, 1000);
		slider.scaledMinWidth = 250;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvMmtMaskMean);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvMmtMaskMean = value;
		}
	}


	let mmtGroupBox = new GroupBox(dialog);
	with(mmtGroupBox) {
		title = "MultiscaleMedianTransform mask settings";
		sizer = new VerticalSizer;
		sizer.scaledSpacing = 5;
		sizer.scaledMargin = 5;
		sizer.addItem(dialog.mmtTargetMeanSlider);
	}

	let tgvGroupBox = new GroupBox(dialog);
	with(tgvGroupBox) {
		title = "TGVDenoise mask settings";
		sizer = new VerticalSizer;
		sizer.scaledSpacing = 5;
		sizer.scaledMargin = 5;
		sizer.addItem(dialog.tgvTargetMeanSlider);
		sizer.addItem(dialog.tgvContrastLowSlider);
		sizer.addItem(dialog.tgvContrastHighSlider);
	}

	dialog.resetMaskSettingsButton = new PushButton(dialog);
	with (dialog.resetMaskSettingsButton) {
		text = "Reset Mask Settings";
		toolTip = "Reset TGV to default settings";
		icon = dialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.tgvMaskMean = 0.5;
			CurrentProcessingInfo.tgvContrastLow = 0.25;
			CurrentProcessingInfo.tgvContrastHigh = 0.55;
			CurrentProcessingInfo.tgvMmtMaskMean = 0.75;
		}
	}

	dialog.maskControlSizer = new VerticalSizer;
	dialog.maskControlSizer.spacing = 6;
	dialog.maskControlSizer.margin = 6;
	dialog.maskControlSizer.addItem(tgvGroupBox);
	dialog.maskControlSizer.addItem(mmtGroupBox);
	dialog.maskControlSizer.addItem(dialog.resetMaskSettingsButton);
	dialog.maskControlSizer.addStretch();
	let maskControl = new Frame;
	maskControl.sizer = dialog.maskControlSizer;

	// #endregion "Mask"

	// #region "TGV"
	let nrDisclaimer = new Label(dialog);
	with (nrDisclaimer) {
		frameStyle = FrameStyle_Box;
		wordWrapping = true;
		useRichText = true;
		margin = 4;
		text = "Either select a preview of pure background (no stars or objects) or use the NoiseEvaluation script option instead for an estimation of the background noise if you want to perform automatic noise reduction."
	}

	let tgvControl = new GroupBox(dialog);
	tgvControl.sizer = new VerticalSizer;
	tgvControl.sizer.scaledSpacing = 4;
	tgvControl.sizer.scaledMargin = 10;
	tgvControl.titleCheckBox = true;
	tgvControl.title = "Run TGVDenoise";
	tgvControl.bindings = function() {
		this.checked = CurrentProcessingInfo.runTgv;
	}
	tgvControl.onCheck = function(value) {
		CurrentProcessingInfo.runTgv = value;
	}

	dialog.tgvBackgroundViewSelector = new ViewList(dialog);
	with (dialog.tgvBackgroundViewSelector) {
		toolTip = "Select a preview that contains only background. It doesn't need to be big but it can not contain any stars or objects.";
		onViewSelected = function (value) {
			CurrentProcessingInfo.tgvBackgroundReference = (value == null || value.isNull) ? null : value.fullId;
		}
		bindings = function() {
			this.enabled = !CurrentProcessingInfo.tgvNoiseEvaluation;
		}
		excludeIdentifiersPattern = "_ez_*";
		enabled = false;
		getAll();
	}

	let bgLabel = new Label(dialog);
	bgLabel.text = "Background Reference";
	let tgvBackgroundSizer = new HorizontalSizer;
	tgvBackgroundSizer.addItem(bgLabel);
	tgvBackgroundSizer.addItem(dialog.tgvBackgroundViewSelector);

	let tgvDenoiseLabel = new Label;
	tgvDenoiseLabel.text = "Denoise Support";
	tgvDenoiseLabel.textAlignment = 2;

	dialog.tgvDenoiseSupport = new SpinBox(dialog);
	with (dialog.tgvDenoiseSupport) {
		setRange(0,3);
		bindings = function() {
			value = CurrentProcessingInfo.tgvDenoiseSupport;
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvDenoiseSupport = value;
		}
	}

	let tgvDenoiseSizer = new HorizontalSizer;
	tgvDenoiseSizer.addItem(tgvDenoiseLabel);
	tgvDenoiseSizer.addItem(dialog.tgvDenoiseSupport);
	tgvDenoiseSizer.scaledSpacing = 5;

	dialog.tgvStrengthSlider = new NumericControl(dialog);
	with (dialog.tgvStrengthSlider) {
		label.text = "Strength";
		label.scaledMinWidth = 100;
		setRange(0.01, 20);
		slider.setRange(0, 100000);
		slider.scaledMinWidth = 150;
		setPrecision(5);
		bindings = function() {
			setValue(CurrentProcessingInfo.tgvStrength);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvStrength = value;
		}
		edit.scaledMinWidth = 100;
	}

	dialog.tgvSmoothnessSlider = new NumericControl(dialog);
	with (dialog.tgvSmoothnessSlider) {
		label.text = "Smoothness";
		label.scaledMinWidth = 100;
		setRange(0.01, 20);
		slider.setRange(0, 100000);
		slider.scaledMinWidth = 150;
		setPrecision(5);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvSmoothness);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvSmoothness = value;
		}
		edit.scaledMinWidth = 100;
	}

	dialog.tgvIterationsSlider = new NumericControl(dialog);
	with (dialog.tgvIterationsSlider) {
		label.text = "Iterations";
		label.scaledMinWidth = 100;
		setRange(100, 5000);
		slider.setRange(0, 98);
		slider.scaledMinWidth = 150;
		setPrecision(-2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.tgvIterations);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvIterations = value;
		}
		edit.scaledMinWidth = 100;
	}

	// denoise edge protection detection
	let noiseScriptCheckbox = new CheckBox(dialog);
	with (noiseScriptCheckbox) {
		text = "Use NoiseEvaluation script instead of preview";
		toolTip = "Alternative to the noise evaluation using a manually set preview";
		bindings = function() {
			this.checked = CurrentProcessingInfo.tgvNoiseEvaluation;
		}
		onCheck = function (value) {
			CurrentProcessingInfo.tgvNoiseEvaluation = value;
		}
	}

	let tgvStdevMultiplierSlider = new NumericControl(dialog);
	with (tgvStdevMultiplierSlider) {
		label.text = "Edge protection multiplier";
		toolTip = "If you find the edge protection value too high/low you can alter it here. Higher values result in LESS edge protection, lower values result in higher protection."
		label.scaledMinWidth = 100;
		setRange(0.01, 10);
		slider.setRange(0, 10000);
		slider.scaledMinWidth = 150;
		setPrecision(3);
		bindings = function() {
			setValue(CurrentProcessingInfo.tgvEdgeProtectionMultiplier);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.tgvEdgeProtectionMultiplier = value;
		}
	}

	let tgvEdgeProtectionGroupBox = new GroupBox(dialog);
	with(tgvEdgeProtectionGroupBox) {
		title = "TGV Edge Protection Determination";
		sizer = new VerticalSizer;
		sizer.spacing = 5;
		sizer.margin = 5;
		sizer.addItem(noiseScriptCheckbox);
		sizer.addItem(tgvBackgroundSizer);
		sizer.addItem(tgvStdevMultiplierSlider);
	}
	// denoise edge protection detection end

	// denoise settings
	let tgvSettingsGroupBox = new GroupBox(dialog);
	with(tgvSettingsGroupBox) {
		title = "TGV Settings";
		sizer = new VerticalSizer;
		sizer.scaledSpacing = 5;
		sizer.scaledMargin = 5;
		sizer.addItem(tgvDenoiseSizer);
		sizer.addItem(dialog.tgvStrengthSlider);
		sizer.addItem(dialog.tgvSmoothnessSlider);
		sizer.addItem(dialog.tgvIterationsSlider);
	}

	dialog.resetTgvSettingsButton = new PushButton(dialog);
	with (dialog.resetTgvSettingsButton) {
		text = "Reset TGV Settings";
		toolTip = "Reset TGV to default settings";
		icon = dialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.tgvStrength = 2;
			CurrentProcessingInfo.tgvDenoiseSupport = 0;
			CurrentProcessingInfo.tgvIterations = 1500;
			CurrentProcessingInfo.tgvSmoothness = 0.8;
		}
	}

	tgvControl.sizer.addItem(nrDisclaimer);
	tgvControl.sizer.addItem(tgvEdgeProtectionGroupBox);
	tgvControl.sizer.addItem(tgvSettingsGroupBox);
	tgvControl.sizer.addItem(dialog.resetTgvSettingsButton);
	tgvControl.sizer.addStretch();
	// #endregion "TGV"

	// #region "MMT"

	let mmtControl = new GroupBox(dialog);
	with(mmtControl) {
		sizer = new VerticalSizer;
		sizer.scaledSpacing = 4;
		sizer.scaledMargin = 10;
		titleCheckBox = true;
		bindings = function() {
			this.checked = CurrentProcessingInfo.runMmt;
			this.enabled = CurrentProcessingInfo.runTgv;
		}
		title = "Run MultiscaleMedianTransform";
		onCheck = function(value) {
			CurrentProcessingInfo.runMmt = value;
		}
	}

	let mmtDisclaimer = new Label(dialog);
	with (mmtDisclaimer) {
		frameStyle = FrameStyle_Box;
		wordWrapping = true;
		useRichText = true;
		margin = 4;
		text = "MultiScaleMedianTransform is ideally run after the TGV denoise to get rid of possible uneven larger scale noise structures generated by TGVDenoise.";
	}

	let mmtSliderLabel_str = new Label(dialog);
	with(mmtSliderLabel_str){
		text = "Layer    Strength"
	}

	let mmtSliderLabel_thr = new Label(dialog);
	with(mmtSliderLabel_thr){
		text = "   Threshold"
	}


	dialog.mmtStrSlider_1 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_1){
		label.text = "1   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[0]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[0] = value;
		}
	}
	

	dialog.mmtThrSlider_1 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_1){
		//label.text = "1";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[0]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[0] = value;
			
		}
	}


	dialog.mmtStrSlider_2 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_2){
		label.text = "2   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[1]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[1] = value;
		}
	}
	

	dialog.mmtThrSlider_2 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_2){
		//label.text = "2";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[1]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[1] = value;
			
		}
	}


	dialog.mmtStrSlider_3 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_3){
		label.text = "3   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[2]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[2] = value;
		}
	}
	

	dialog.mmtThrSlider_3 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_3){
		//label.text = "3";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[2]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[2] = value;
			
		}
	}

	dialog.mmtStrSlider_4 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_4){
		label.text = "4   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[3]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[3] = value;
		}
	}
	

	dialog.mmtThrSlider_4 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_4){
		//label.text = "4";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[3]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[3] = value;
			
		}
	}


	dialog.mmtStrSlider_5 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_5){
		label.text = "5   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[4]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[4] = value;
		}
	}
	

	dialog.mmtThrSlider_5 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_5){
		//label.text = "5";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[4]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[4] = value;
			
		}
	}


	dialog.mmtStrSlider_6 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_6){
		label.text = "6   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[5]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[5] = value;
		}
	}
	

	dialog.mmtThrSlider_6 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_6){
		//label.text = "6";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[5]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[5] = value;
			
		}
	}

	dialog.mmtStrSlider_7 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_7){
		label.text = "7   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[6]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[6] = value;
		}
	}
	

	dialog.mmtThrSlider_7 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_7){
		//label.text = "7";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[6]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[6] = value;
			
		}
	}


	dialog.mmtStrSlider_8 = new NumericControl(dialog);
	with (dialog.mmtStrSlider_8){
		label.text = "8   ";
		label.minWidth = 10;
		setRange(0.01, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtStr[7]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtStr[7] = value;
		}
	}
	

	dialog.mmtThrSlider_8 = new NumericControl(dialog);
	with (dialog.mmtThrSlider_8){
		//label.text = "8";
		label.minWidth = 10;
		setRange(0.01, 10);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function() {
			this.setValue(CurrentProcessingInfo.TgvMmtThr[7]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.TgvMmtThr[7] = value;
			
		}
	}

	

	let mmtStrSizer = new VerticalSizer(dialog);
	with(mmtStrSizer){
		addItem(mmtSliderLabel_str);
		addItem(dialog.mmtStrSlider_1);
		addItem(dialog.mmtStrSlider_2);
		addItem(dialog.mmtStrSlider_3);
		addItem(dialog.mmtStrSlider_4);
		addItem(dialog.mmtStrSlider_5);
		addItem(dialog.mmtStrSlider_6);
		addItem(dialog.mmtStrSlider_7);
		addItem(dialog.mmtStrSlider_8);
	}

	let mmtThrSizer = new VerticalSizer(dialog);
	with(mmtThrSizer){
		addItem(mmtSliderLabel_thr);
		addItem(dialog.mmtThrSlider_1);
		addItem(dialog.mmtThrSlider_2);
		addItem(dialog.mmtThrSlider_3);
		addItem(dialog.mmtThrSlider_4);
		addItem(dialog.mmtThrSlider_5);
		addItem(dialog.mmtThrSlider_6);
		addItem(dialog.mmtThrSlider_7);
		addItem(dialog.mmtThrSlider_8);
	}

	let mmtSizer = new HorizontalSizer(dialog);
	mmtSizer.addItem(mmtStrSizer);
	mmtSizer.addItem(mmtThrSizer);

	dialog.resetMmtButton = new PushButton(dialog);
	with (dialog.resetMmtButton) {
		text = "Reset MMT Settings";
		toolTip = "Reset MMT to default settings";
		icon = dialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.TgvMmtThr[0] = 10;
			CurrentProcessingInfo.TgvMmtThr[1] = 10;
			CurrentProcessingInfo.TgvMmtThr[2] = 7;
			CurrentProcessingInfo.TgvMmtThr[3] = 5;
			CurrentProcessingInfo.TgvMmtThr[4] = 5;
			CurrentProcessingInfo.TgvMmtThr[5] = 2.5;
			CurrentProcessingInfo.TgvMmtThr[6] = 2;
			CurrentProcessingInfo.TgvMmtThr[7] = 2;
			CurrentProcessingInfo.TgvMmtStr[0] = 1;
			CurrentProcessingInfo.TgvMmtStr[1] = 1;
			CurrentProcessingInfo.TgvMmtStr[2] = 1;
			CurrentProcessingInfo.TgvMmtStr[3] = 1;
			CurrentProcessingInfo.TgvMmtStr[4] = 1;
			CurrentProcessingInfo.TgvMmtStr[5] = 1;
			CurrentProcessingInfo.TgvMmtStr[6] = 1;
			CurrentProcessingInfo.TgvMmtStr[7] = 1;
		}
	}

	mmtControl.sizer.addItem(mmtDisclaimer);
	mmtControl.sizer.addItem(mmtSizer);
	mmtControl.sizer.addItem(dialog.resetMmtButton);
	mmtControl.sizer.addStretch();

	// #endregion "MMT"

	dialog.closeMaskImageCheckBox = new CheckBox(dialog);
	with(dialog.closeMaskImageCheckBox) {
		text = "Close Mask Images after Execution";
		toolTip = "Close all generated masks after script has been executed";
		bindings = function() {
			this.checked = CurrentProcessingInfo.closeMaskImages;
		}
		onCheck = function (value) {
			CurrentProcessingInfo.closeMaskImages = value;
		}
	}

	dialog.masksButton = new PushButton(dialog);
	with(dialog.masksButton) {
		text = "Create Masks Only";
		icon = dialog.scaledResource(":/icons/ok.png");
		bindings = function() {
			this.enabled = !CurrentProcessingInfo.closeMaskImages;
		}
		onClick = function () {
			CurrentProcessingInfo.masksOnly = true;
			dialog.dialog.ok();
		}
	}

	dialog.processButton = new PushButton(dialog);
	with(dialog.processButton) {
		text = "Create Masks and Denoise Processes";
		icon = dialog.scaledResource(":/icons/ok.png");
		bindings = function() {
			this.enabled = dialog.canRun();
		}
		onClick = function () {
			CurrentProcessingInfo.tgvCreateProcessOnly = true;
			dialog.dialog.ok();
		}
	}

	dialog.runAndCloseGroupBox.sizer.insertItem(0, dialog.closeMaskImageCheckBox);
	dialog.runAndCloseGroupBox.sizer.insertItem(1, dialog.masksButton);
	dialog.runAndCloseGroupBox.sizer.insertItem(2, dialog.processButton);

	dialog.replacementTabBox = new TabBox(dialog);
	with(dialog.replacementTabBox) {
		addPage(maskControl, "Mask Settings");
		addPage(tgvControl, "TGV Settings");
		addPage(mmtControl, "MMT Settings");
		setScaledMaxWidth(450);
		setScaledMinWidth(450);
		bindings = function() {
			this.enabled = CurrentProcessingInfo.mainViewId != null;
		}
	}

	dialog.controlSizer.insertItem(3, dialog.replacementTabBox);

	dialog.controlSizer.removeItem(dialog.mainControl);
	dialog.mainControl.hide();
}

function getViewName(view) {
	return (view.isPreview ? view.window.mainView.id : view.id) + (view.isPreview ? "->" + view.id : "");
}

function DenoiseInfo() {
	this.runTgv = null;
	this.runMmt = null;
	this.denoiseRun = null;
	this.tgvMaskMean = null;
	this.tgvContrastLow = null;
	this.tgvContrastHigh = null;
	this.tgvMmtMaskMean = null;
	this.tgvNoiseEvaluation = null;
	this.tgvBackgroundReference = null;
	this.tgvEdgeProtectionMultiplier = null;
	this.tgvStrength = null;
	this.tgvSmoothness = null;
	this.tgvIterations = null;
	this.tgvEdgeProtection = null;
}

main();
