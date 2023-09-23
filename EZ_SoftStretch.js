/*
 * ------------------- Version 2020-06-03 --------------------
 * tested on PixInsight 1.8.8-5 Ripley
 *
 * This script allows easy soft stretching an image to non-linear state.
 * Hands-free flow is
 * 	 calculate statistics targets
 *   stretch image appropriately
 *
 * Copyright information
 * 
 * 		Made by S Dimant (aka darkarchon#4313)
 *      Original idea by S Dimant
*/

// #region "IncludesAndDefines"

#feature-id EZ Processing Suite > EZ Soft Stretch

var NAME = "EZ Soft Stretch";
var VERSION = "0.11";
var AUTHOR = "S. Dimant";

#include "EZ_Common.js"


// VARIABLE NAMING SCHEME
// - Generally, if applicable, variables end with the type of the variable (i.e. View, Window, etc.)
// - Global declared variables use UpperCamelCase
// - local used variables are lowerCamelCase
// - avoid using var inside functions, prefer let

// #region "Main"

function onInit() { }
function onExit() { }

function saveSettings() {
	Settings.write("EZSoftStretch.ExpandLow", 10, CurrentProcessingInfo.htExpandLow);
	Settings.write("EZSoftStretch.ZeroInWhitePoint", 0, CurrentProcessingInfo.zeroInWhitePoint);
	Settings.write("EZSoftStretch.SlopeConfidence", 10, CurrentProcessingInfo.slopeConfidence);
	Settings.write("EZSoftStretch.MedianTarget", 10, CurrentProcessingInfo.medianTarget);
	Settings.write("EZSoftStretch.ClipAggressiveness", 1, CurrentProcessingInfo.aggressiveness);
}

function generateProcessingInfo() {
	let starReductionInfo = new SoftStrechInfo();
	starReductionInfo.mainViewId = null;
	starReductionInfo.htExpandLow = readFromSettingsOrDefault("EZSoftStretch.ExpandLow", 10, 0.05);
	starReductionInfo.zeroInWhitePoint = readFromSettingsOrDefault("EZSoftStretch.ZeroInWhitePoint", 0, false);
	starReductionInfo.slopeConfidence = readFromSettingsOrDefault("EZSoftStretch.SlopeConfidence", 10, 95);
	starReductionInfo.aggressiveness = readFromSettingsOrDefault("EZSoftStretch.ClipAggressiveness", 1, 10);
	starReductionInfo.medianTarget = readFromSettingsOrDefault("EZSoftStretch.MedianTarget", 10, 0.2);
	return starReductionInfo;
}

function execute(window) {
	let mainView = window.mainView;
	mainView.window.bringToFront();

	writeMessageStart("Running SoftStretch");
	doSoftStretch(mainView);

	writeMessageEnd("Stretching complete");
}

// #endregion "Main"

// #region "Do"

function doSoftStretch(view) {
	let workingView = view;
	view.window.removeMask();

	// calculate white point, median and black point from histogram
	let histogramMatrix = workingView.computeOrFetchProperty("Histogram16");

	let totalPixels = 0;
	for (let i = 0; i < histogramMatrix.cols; i++) {
		totalPixels += histogramMatrix.at(0, i);
	}

	let whitePointADU = [0,0,0];
	let medianCount = [0,0,0];

	let medianCompute = view.computeOrFetchProperty("Median");
	let medianNormArr = [];
	medianNormArr[0] = medianCompute.at(0);
	if(histogramMatrix.rows == 3) {
		medianNormArr[1] = medianCompute.at(1);
		medianNormArr[2] = medianCompute.at(2);
	} else {
		medianNormArr[1] = medianNormArr[0];
		medianNormArr[2] = medianNormArr[0];
	}
	let medianADU = [parseInt(medianNormArr[0]*65536),parseInt(medianNormArr[1]*65536),parseInt(medianNormArr[2]*65536)];
	let blackPointADU = [0,0,0];
	let clippedPixels = [0,0,0];
	let histogramPeakADU = [[0,0],[0,0],[0,0]];
	for (let rgbc = 0; rgbc < histogramMatrix.rows; rgbc++) {
		for (let i = histogramMatrix.cols - 1; i > 0; i--) {
			if (histogramMatrix.at(rgbc, i) != 0) {
				whitePointADU[rgbc] = i;
				break;
			}
		}

		let additiveHistogram = [];

		for (let i = 0; i<medianADU[rgbc]; i++) {
			let value = histogramMatrix.at(rgbc, i);
			let nextValue = histogramMatrix.at(rgbc, i + 1);

			let prevHisto = additiveHistogram.length == 0 ? 0 : additiveHistogram[additiveHistogram.length - 1];
			let avgValue = Math.mean([value, nextValue])
			additiveHistogram.push(prevHisto + avgValue);

			if (avgValue > histogramPeakADU[rgbc][1]) {
				histogramPeakADU[rgbc][0] = medianADU[rgbc];
				histogramPeakADU[rgbc][1] = avgValue;
			}
		}

		let madMinADU = 0;
		for (let j = 0; j < additiveHistogram.length; j++) {
			if (additiveHistogram[j] > (totalPixels / 10000) * CurrentProcessingInfo.aggressiveness) {
				madMinADU = j;
				break;
			}
		}

		writeMessageStart("Detecting HT slope for channel " + rgbc);
		writeMessageBlock("", false, true);
		let y = [];
		let y2 = [];
		let x = [];
		let x2 = [];
		let xy = [];
		let n = histogramPeakADU[rgbc][0] - madMinADU;
		for (let j = madMinADU; j < histogramPeakADU[rgbc][0]; j++) {
			y.push(additiveHistogram[j]);
			x.push(j);
			let nj = j - madMinADU;
			y2.push(y[nj] * y[nj]);
			x2.push(x[nj] * x[nj]);
			xy.push(x[nj] * y[nj]);
		}
		let r2 = Math.pow(((n * Math.sum(xy)) - (Math.sum(x) * Math.sum(y))) / Math.sqrt(((n * Math.sum(x2) - (Math.sum(x) * Math.sum(x))) * (n * Math.sum(y2) - (Math.sum(y) * Math.sum(y))))), 2);
		let m = ((n * Math.sum(xy)) - (Math.sum(x) * Math.sum(y))) / ((n * Math.sum(x2)) - (Math.sum(x) * Math.sum(x)));
		let c = (Math.sum(y) - (m * (Math.sum(x)))) / (n);
		blackPointADU[rgbc] = parseInt(-(c / m));

		processEvents();
		writeMessageBlock("HT Slope origin for channel " + rgbc + " determined at x=" + blackPointADU[rgbc], false, true);
		writeMessageBlock("Confidence R²: " + (r2 * 100).toFixed(2) + "%, Steepness: " + m.toFixed(2), false, true);
		if (blackPointADU[rgbc] == 0) {
			writeWarningBlock("No HT slope origin found for channel " + rgbc, false, true);
		}
		writeMessageEnd("");
	}

	if(histogramMatrix.rows == 1) { 
		whitePointADU[1] = whitePointADU[0];
		whitePointADU[2] = whitePointADU[0];
		medianADU[1] = medianADU[0];
		medianADU[2] = medianADU[0];
		blackPointADU[1] = blackPointADU[0];
		blackPointADU[2] = blackPointADU[0];
	}

	for(let rgbc = 0;rgbc < histogramMatrix.rows;rgbc++) {
		for(let i = 0;i<Math.minElem(blackPointADU);i++) {
			clippedPixels[rgbc] += histogramMatrix.at(rgbc, i);
		}
	}

	// reset whitePoint if not zeroing in
	if (!CurrentProcessingInfo.zeroInWhitePoint) whitePointADU = [histogramMatrix.columns-1,histogramMatrix.columns-1,histogramMatrix.columns-1];

	let medianNorm = Math.minElem(medianNormArr);
	let whitePointNorm = Math.maxElem(whitePointADU) / (histogramMatrix.cols-1);
	let blackPointNorm = Math.minElem(blackPointADU) / (histogramMatrix.cols-1);

	writeMessageStart("Calculated value info");
	writeMessageBlock("", false, true);
	writeMessageBlock("Total PX             : " + totalPixels, false, true);
	writeMessageBlock("BlackPoint ADU       : " + blackPointADU, false, true);
	writeMessageBlock("BlackPoint ADU Min   : " + Math.minElem(blackPointADU), false, true);
	writeMessageBlock("BlackPoint Normalized: " + blackPointNorm, false, true);
	writeMessageBlock("Total Clipped Pixels : " + Math.sum(clippedPixels) + " (" + ((Math.sum(clippedPixels)/totalPixels)*100).toFixed(4) + "%)", false, true);
	writeMessageBlock("WhitePoint ADU       : " + whitePointADU, false, true);
	writeMessageBlock("WhitePoint ADU Max   : " + Math.maxElem(whitePointADU), false, true);
	writeMessageBlock("WhitePoint Normalized: " + whitePointNorm, false, true);
	writeMessageBlock("Median ADU           : " + medianADU, false, true);
	writeMessageBlock("Median ADU Min       : " + Math.minElem(medianADU), false, true);
	writeMessageBlock("Median Normalized    : " + medianNorm, false, true);
	writeMessageEnd("");

	if(blackPointNorm == 0 || blackPointNorm+"" == "NaN") {
		blackPointNorm = 0;
		writeWarningBlock("Could not determine blackpoint of histogram, decrease aggressiveness and try again. Assuming 0.");
	}

	if(medianNorm < blackPointNorm) {
		blackPointNorm = 0;
		writeWarningBlock("Median ADU was smaller than blackpoint ADU. Something went terribly, terribly wrong during calculation. Maybe adjust aggressiveness? Assuming 0.");
	}

	let newMedianTarget = (CurrentProcessingInfo.medianTarget*(whitePointNorm/1)
		-CurrentProcessingInfo.htExpandLow*(whitePointNorm/1));
	writeMessageBlock("Calculating Median Transfer Function to target " + newMedianTarget.toFixed(2) + " (Median (" + CurrentProcessingInfo.medianTarget*(whitePointNorm/1) +")-low expand ("+CurrentProcessingInfo.htExpandLow*(whitePointNorm/1)+"))");
	processEvents();
	///((1+CurrentProcessingInfo.htExpandLow)/1);
	var mtfNorm = 1-findMidtonesBalance(medianNorm-blackPointNorm, newMedianTarget, 0.00000001);
		//((1+CurrentProcessingInfo.htExpandLow)/1)

	//console.writeln(CurrentProcessingInfo.medianTarget + " / " + CurrentProcessingInfo.htExpandLow);
	//console.writeln(newMedianTarget+"="+mtfNorm);

	// stretch
	var HT = new HistogramTransformation;
	HT.H = [[0, 0.5, 1.0, 0, 1.0],
	[0, 0.5, 1.0, 0, 1.0],
	[0, 0.5, 1.0, 0, 1.0],
	[blackPointNorm, mtfNorm, whitePointNorm, -CurrentProcessingInfo.htExpandLow, 1.0],
	[0, 0.5, 1.0, 0, 1.0]];

	HT.executeOn(view);

	// reset STF on view
	var STFunction = new ScreenTransferFunction();
	STFunction.executeOn(view);
}

//#endregion "Do"

function customizeDialog() {
	dialog.infoBox.text = "<b>EZ Soft Stretch:</b> A script to easily delinearize an image non-aggressively to a state that allows further post-processing in the non-linear state. Ideally is run after using EZ Denoise.";

	dialog.tutorialPrerequisites = [
		"Image is cropped properly",
		"Image is not stretched (image is linear)",
		"Image is color calibrated (RGB)"
	];
	dialog.tutorialSteps = ["Select image or preview to apply to",
		"Stretch Preview will open that shows you what the image will be stretched to",
		"If result is not adequate read the console messages",
		"To adjust the stretch strength adjust 'Target Median', 'Expand Low' and 'Zero in White Point'",
		"To adjust clipping strength adjust 'Aggressiveness'",
		"Note: depending on data Aggressiveness might or might not do anything",
		"Once happy Run EZ Soft Stretch"
	];

	dialog.prevMedianTarget = CurrentProcessingInfo.medianTarget;
	dialog.prevHtExpandLow = CurrentProcessingInfo.htExpandLow;
	dialog.prevZeroIn = CurrentProcessingInfo.zeroInWhitePoint;
	dialog.prevAggressive = CurrentProcessingInfo.aggressiveness;
	dialog.isRendering = false;

	dialog.customBindings = function() {
		if(dialog.isSliding || dialog.isRendering) return;
		let anyChanges = false;
		if(CurrentProcessingInfo.aggressiveness != dialog.prevAggressive) {
			anyChanges = true; dialog.prevAggressive = CurrentProcessingInfo.aggressiveness;
		}
		if(CurrentProcessingInfo.htExpandLow != dialog.prevHtExpandLow) {
			anyChanges = true; dialog.prevHtExpandLow = CurrentProcessingInfo.htExpandLow;
		}
		if(CurrentProcessingInfo.zeroInWhitePoint != dialog.prevZeroIn) {
			anyChanges = true; dialog.prevZeroIn = CurrentProcessingInfo.zeroInWhitePoint;
		}
		if(CurrentProcessingInfo.medianTarget != dialog.prevMedianTarget) {
			anyChanges = true; dialog.prevMedianTarget = CurrentProcessingInfo.medianTarget;
		}
		if(CurrentProcessingInfo.mainViewId != null && anyChanges) {
			dialog.isRendering = true;
			startProcessing();
			dialog.stretchControl.forceRerender();
			dialog.bitmap = generateHistogramImage(dialog.stretchControl.previewFrameWindow.mainView);
			dialog.histogramFrame.repaint();
			stopProcessing();
			dialog.isRendering = false;
		}

	}

	dialog.onSelectedMainView = function() {
		if(dialog.stretchControl != null) {
			dialog.stretchControl.SetView(View.viewById(CurrentProcessingInfo.mainViewId), false);
			dialog.tabBox.show();
			dialog.bitmap = generateHistogramImage(dialog.stretchControl.previewFrameWindow.mainView);
			dialog.histogramFrame.update();
			return;
		};

		dialog.stretchControl = new PreviewControl(dialog, true, false);

		dialog.stretchControl.computeOrgImage = function() {
			if(this.previewFrameWindow != null && !this.previewFrameWindow.isNull) {
				this.previewFrameWindow.forceClose();
			}
	
			let viewToExecuteOn = this.originalView.window.mainView;
	
			this.previewFrameWindow = cloneView(viewToExecuteOn, "_ez_temp_" + viewToExecuteOn.id, true).window;
			doSoftStretch(this.previewFrameWindow.mainView);
		}

		dialog.stretchControl.SetView(View.viewById(CurrentProcessingInfo.mainViewId), false);

		dialog.tabBox.addPage(dialog.stretchControl, "Stretch Preview");

		dialog.stretchControl.infoFrame.hide();

		dialog.tabBox.show();

		dialog.bitmap = generateHistogramImage(dialog.stretchControl.previewFrameWindow.mainView);
		dialog.histogramFrame.update();

		dialog.adjustToContents();
	}

	dialog.onEmptyMainView = function() {
		dialog.tabBox.hide();
		dialog.adjustToContents();
	}
	dialog.onExit = function() {}
	dialog.canRun = function() { return true; }
	dialog.canEvaluate = function() { return true; }

	//#region custom controls
	dialog.zeroInWhitePointCheckBox = new CheckBox(dialog);
	with (dialog.zeroInWhitePointCheckBox) {
		toolTip = "Zeroes in the white point (might result in a more aggressive stretch)"
		text = "Zero in White Point";
		enabled = true;
		checked = CurrentProcessingInfo.zeroInWhitePoint;
		bindings = function() {
			this.checked = CurrentProcessingInfo.zeroInWhitePoint;
		}
		onCheck = function (value) {
			CurrentProcessingInfo.zeroInWhitePoint = value;
		}
	}
	
	dialog.expandLowSlider = new NumericControl(dialog);
	with (dialog.expandLowSlider) {
		label.text = "Expand Low";
		label.minWidth = 130;
		setRange(0, 0.2);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 60;
		setPrecision(2);
		edit.scaledMinWidth = 60;
		bindings = function() {
			this.setValue(CurrentProcessingInfo.htExpandLow);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.htExpandLow = value;
		}
		slider.onMousePress = function() {
			dialog.isSliding = true;
		}
		slider.onMouseRelease = function() {
			dialog.isSliding = false;
		}
	}

	dialog.htMedianSlider = new NumericControl(dialog);
	with (dialog.htMedianSlider) {
		label.text = "Target Median";
		label.minWidth = 130;
		slider.setRange(0, 100);
		slider.scaledMinWidth = 60;
		setPrecision(2);
		edit.scaledMinWidth = 60;
		bindings = function() {
			if((CurrentProcessingInfo.htExpandLow + 0.0999999) > (CurrentProcessingInfo.medianTarget)) {
				CurrentProcessingInfo.medianTarget += 0.1;
			}
			this.setRange(CurrentProcessingInfo.htExpandLow + 0.099999, 0.4);
			this.setValue(CurrentProcessingInfo.medianTarget);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.medianTarget = value;
		}
		slider.onMousePress = function() {
			dialog.isSliding = true;
		}
		slider.onMouseRelease = function() {
			dialog.isSliding = false;
		}
	}

	dialog.aggressivenessSlider = new NumericControl(dialog);
	with (dialog.aggressivenessSlider) {
		label.text = "Aggressiveness";
		label.minWidth = 130;
		toolTip = "Attempts to adjust the histogram clipping point. Increase to clip more.";
		setRange(1, 100);
		slider.setRange(0, 1000);
		slider.scaledMinWidth = 60;
		setPrecision(2);
		edit.scaledMinWidth = 60;
		bindings = function() {
			this.setValue(CurrentProcessingInfo.aggressiveness);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.aggressiveness = value;
		}
		slider.onMousePress = function() {
			dialog.isSliding = true;
		}
		slider.onMouseRelease = function() {
			dialog.isSliding = false;
		}
	}

	dialog.resetButton = new PushButton(dialog);
	with(dialog.resetButton) {
		text = "Reset Stretch Settings";
		toolTip = "Reset Stretch to default settings";
		icon = dialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.htExpandLow = 0.05;
			CurrentProcessingInfo.medianTarget = 0.2;
			CurrentProcessingInfo.zeroInWhitePoint = false;
			CurrentProcessingInfo.aggressiveness = 5;
		}
	}
	//#endregion

	dialog.histogramFrame = new Control(dialog);
	with(dialog.histogramFrame) {
		scaledMinWidth = 430;
		scaledMinHeight = 200;
	}

	dialog.histogramFrame.onPaint = function (x0, y0, x1, y1) {
		var graphics = new VectorGraphics(this);
		graphics.antialiasing = true;
		graphics.fillRect(x0, y0, x1, y1, new Brush(0xff202020));
		if(dialog.bitmap != null) {
			graphics.drawScaledBitmap(x0+5, y0+5, x1-5, y1-5, dialog.bitmap);
		}
		graphics.end();
	}

	dialog.mainControl.sizer.insertItem(0, dialog.htMedianSlider);
	dialog.mainControl.sizer.insertItem(1, dialog.expandLowSlider);
	dialog.mainControl.sizer.insertItem(2, dialog.zeroInWhitePointCheckBox);
	dialog.mainControl.sizer.insertItem(3, dialog.aggressivenessSlider);
	dialog.mainControl.sizer.insertItem(4, dialog.resetButton);
	//dialog.mainControl.sizer.insertItem(6, dialog.slopeDetectionIterationsSlider);
	dialog.mainControl.sizer.insertItem(10, dialog.histogramFrame);

	dialog.mainControl.bindings = function() {
		this.enabled = CurrentProcessingInfo.mainViewId != null;
	}
}


function SoftStrechInfo() {
	this.htExpandLow = null;
	this.zeroInWhitePoint = null;
	this.slopeConfidence = null;
	this.medianTarget = null;
}

SoftStrechInfo.prototype = new ProcessingInfo;

main();
