// Copyright (C) 2020-2023 S Dimant (aka darkarchon#4313)
// File name: EZ_Decon.js

/*
 * ------------------- Version 2020-06-03 --------------------
 * tested on PixInsight 1.8.8-5 Ripley
 *
 * This script allows easy deconvolution on images.
 * It can create PSF, StarMasks for star replacement and apply the deconvolution process
 * Hands-free flow is
 * 		- create appropriate star mask
 * 		- create appropriate psf
 * 		- apply deconvolution with stf and default settings
 * 		- apply pixelmath several times with a mask to replace the stars in the image
 *
 * Copyright information
 * 
 * 		Made by S Dimant (aka darkarchon#4313)
 * 		Original Easy Decon idea by OkeWoke#6745
 * 
 * 		Create PSF Image code snippets, ellipsoid creation as well as drawing adapted from the GAME script by Hartmut v. Bornemann
 * 		Acknowledgements for the ellispoid creation also go to Adam Block
*/

// #region "IncludesAndDefines"

#feature-id EZ Processing Suite > EZ Decon

var NAME = 'EZ Decon';
var VERSION = '0.13HF6';
var AUTHOR = "S. Dimant";

#include "EZ_Common.js"

#define PSF_starIndex   0
#define PSF_function    1
#define PSF_circular    2
#define PSF_status      3
#define PSF_B           4
#define PSF_A           5
#define PSF_cx          6
#define PSF_cy          7
#define PSF_sx          8
#define PSF_sy          9
#define PSF_theta      10
#define PSF_beta       11
#define PSF_residual   12
#define PSF_mad   	   12
#define PSF_x0         13
#define PSF_y0         14
#define PSF_x1         15
#define PSF_y1         16

// VARIABLE NAMING SCHEME
// - Generally, if applicable, variables end with the type of the variable (i.e. View, Window, etc.)
// - Global declared variables use UpperCamelCase
// - local used variables are lowerCamelCase
// - avoid using var inside functions, prefer let

// #endregion "IncludesAndDefines"

// #region "Main"

function saveSettings() {
	Settings.write("EZDecon.DownsampleStarNet", 0, CurrentProcessingInfo.downsampleStarnet);
	Settings.write("EZDecon.UseStarNet2", 0, CurrentProcessingInfo.useStarNet2);
	Settings.write("EZDecon.PSFMaxStars", 1, CurrentProcessingInfo.psfMaxStars);
	Settings.write("EZDecon.DeconIterations", 1, CurrentProcessingInfo.deconIterations);
	Settings.write("EZDecon.PixelMathIterations", 1, CurrentProcessingInfo.pixelMathIterations);
	Settings.write("EZDecon.StarSensitivity", 10, CurrentProcessingInfo.starSensitivity);
	Settings.write("EZDecon.BackgroundReplacement", 0, CurrentProcessingInfo.backgroundReplacement);
	Settings.write("EZDecon.BackgroundBlending", 10, CurrentProcessingInfo.backgroundBlending);
	Settings.write("EZDecon.WaveletStr1", 10, CurrentProcessingInfo.waveletStr[0]);
	Settings.write("EZDecon.WaveletStr2", 10, CurrentProcessingInfo.waveletStr[1]);
	Settings.write("EZDecon.WaveletStr3", 10, CurrentProcessingInfo.waveletStr[2]);
	Settings.write("EZDecon.WaveletStr4", 10, CurrentProcessingInfo.waveletStr[3]);
	Settings.write("EZDecon.WaveletStr5", 10, CurrentProcessingInfo.waveletStr[4]);
	Settings.write("EZDecon.WaveletThr1", 10, CurrentProcessingInfo.waveletThr[0]);
	Settings.write("EZDecon.WaveletThr2", 10, CurrentProcessingInfo.waveletThr[1]);
	Settings.write("EZDecon.WaveletThr3", 10, CurrentProcessingInfo.waveletThr[2]);
	Settings.write("EZDecon.WaveletThr4", 10, CurrentProcessingInfo.waveletThr[3]);
	Settings.write("EZDecon.WaveletThr5", 10, CurrentProcessingInfo.waveletThr[4]);
}

function generateProcessingInfo() {
	let deconInfo = new DeconInfo();
	deconInfo.mainViewId = null;
	deconInfo.workingViewId = null;
	deconInfo.originalViewId = null;
	deconInfo.starMaskId = null;
	deconInfo.backgroundMaskId = null;
	deconInfo.backgroundReplacement = readFromSettingsOrDefault("EZDecon.BackgroundReplacement", 0, false);
	deconInfo.backgroundBlending = readFromSettingsOrDefault("EZDecon.BackgroundBlending", 10, 1);
	deconInfo.starSensitivity = readFromSettingsOrDefault("EZDecon.StarSensitivity", 10, 1.0);
	deconInfo.downsampleStarnet = readFromSettingsOrDefault("EZDecon.DownsampleStarNet", 0, false);
	deconInfo.useStarNet2 = readFromSettingsOrDefault("EZDecon.UseStarNet2", 0, false);
	deconInfo.psfViewId = null;
	deconInfo.psfMaxStars = readFromSettingsOrDefault("EZDecon.PSFMaxStars", 1, 50);
	deconInfo.waveletStr = [readFromSettingsOrDefault("EZDecon.WaveletStr1", 10, 1),
	readFromSettingsOrDefault("EZDecon.WaveletStr2", 10, 0.9),
	readFromSettingsOrDefault("EZDecon.WaveletStr3", 10, 0.8),
	readFromSettingsOrDefault("EZDecon.WaveletStr4", 10, 0.7),
	readFromSettingsOrDefault("EZDecon.WaveletStr5", 10, 0.7)];
	deconInfo.waveletThr = [readFromSettingsOrDefault("EZDecon.WaveletThr1", 10, 10),
	readFromSettingsOrDefault("EZDecon.WaveletThr2", 10, 8),
	readFromSettingsOrDefault("EZDecon.WaveletThr3", 10, 6),
	readFromSettingsOrDefault("EZDecon.WaveletThr4", 10, 4),
	readFromSettingsOrDefault("EZDecon.WaveletThr5", 10, 2)];
	deconInfo.deconIterations = readFromSettingsOrDefault("EZDecon.DeconIterations", 1, 25);
	deconInfo.pixelMathIterations = readFromSettingsOrDefault("EZDecon.PixelMathIterations", 1, 5);
	deconInfo.createProcesesOnly = false;
	deconInfo.currentDeconRun = 0;
	return deconInfo;
}

function execute(window, bringToFront = true, runOnMain = false) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageStart("Executing on " + window.currentView.id);

	let mainView = window.mainView;

	CurrentProcessingInfo.originalViewId = cloneView(mainView, "_ez_" + mainView.id + "_org").id;
	View.viewById(CurrentProcessingInfo.originalViewId).window.iconize();

	if (bringToFront) {
		mainView.window.bringToFront();
	}

	let workingView = window.mainView;

	let runningOnPreview = workingView.id != CurrentProcessingInfo.workingViewId;

	if (runningOnPreview && !runOnMain) {
		workingView = cloneView(View.viewById(CurrentProcessingInfo.workingViewId), "_ez_temp_working_" + CurrentProcessingInfo.mainViewId);
	}

	ConsoleWriter.writeMessageBlock("Running Deconvolution");

	let orgVisible = workingView.window.visible;
	if (orgVisible) {
		workingView.window.hide();
	}

	workingView.window.removeMask();
	doDecon(workingView);

	ConsoleWriter.writeMessageBlock("Running PixelMath to replace stars");
	doPixelMathMask(workingView,
		CurrentProcessingInfo.originalViewId,
		CurrentProcessingInfo.starMaskId, CurrentProcessingInfo.pixelMathIterations,
		View.viewById(CurrentProcessingInfo.workingViewId).isPreview && !runOnMain);

	if(CurrentProcessingInfo.backgroundReplacement) {
		ConsoleWriter.writeMessageBlock("Running PixelMath to blend background");
		doPixelMath(View.viewById(CurrentProcessingInfo.backgroundMaskId), "$T*{0}".format(CurrentProcessingInfo.backgroundBlending));
		doPixelMathMask(workingView, CurrentProcessingInfo.originalViewId,
			CurrentProcessingInfo.backgroundMaskId, 1,
			View.viewById(CurrentProcessingInfo.workingViewId).isPreview && !runOnMain);
		View.viewById(CurrentProcessingInfo.backgroundMaskId).window.undo();
	}

	if (orgVisible) {
		workingView.window.show();
	}

	if (runningOnPreview && !runOnMain) {
		View.viewById(CurrentProcessingInfo.originalViewId).window.forceClose();
	}

	ConsoleWriter.writeMessageEnd("Done.");

	JobStack.stopProcessing();
	return workingView;
}

function onExit() { }
function onInit() { }

// #endregion "Main"

// #region "Do"

function doPixelMathMask(view, expression, maskId, iterations, isPreview) {
	let starMask = View.viewById(maskId);
	let originalViewId = CurrentProcessingInfo.originalViewId;
	let originalView = View.viewById(originalViewId);

	if (isPreview) {
		let previewRect = View.viewById(CurrentProcessingInfo.mainViewId).window.previewRect(View.viewById(CurrentProcessingInfo.workingViewId));
		let starMaskPart = null;
		for (let i = 0; i < starMask.window.previews.length; i++) {
			Console.writeln("Checking preview " + i);
			let tempRect = starMask.window.previewRect(starMask.window.previews[i]);
			if (tempRect.x0 == previewRect.x0 && tempRect.x1 == previewRect.x1 && tempRect.y0 == previewRect.y0 && tempRect.y1 == previewRect.y1) {
				starMaskPart = starMask.window.previews[i];
				break;
			}
		}

		if (starMaskPart == null) starMaskPart = starMask.window.createPreview(previewRect);
		starMask = cloneView(starMaskPart, "_ez_temp_working_" + starMask.id);
		let originalViewPart = originalView.window.createPreview(View.viewById(CurrentProcessingInfo.mainViewId).window.previewRect(View.viewById(CurrentProcessingInfo.workingViewId)));
		let orgId = originalView.id;
		originalView = cloneView(originalViewPart, "_ez_temp_working_" + orgId);
		expression = expression.replace(originalViewId, originalView.id);
	}

	view.window.mask = starMask.window;
	view.window.maskVisible = false;
	view.window.maskInverted = false;

	var pixelMath = new PixelMath;
	pixelMath.expression = expression;
	pixelMath.expression1 = "";
	pixelMath.expression2 = "";
	pixelMath.expression3 = "";
	pixelMath.useSingleExpression = true;
	pixelMath.symbols = "";
	pixelMath.generateOutput = true;
	pixelMath.singleThreaded = false;
	pixelMath.use64BitWorkingImage = false;
	pixelMath.rescale = false;
	pixelMath.rescaleLower = 0;
	pixelMath.rescaleUpper = 1;
	pixelMath.truncate = true;
	pixelMath.truncateLower = 0;
	pixelMath.truncateUpper = 1;
	pixelMath.createNewImage = false;
	pixelMath.showNewImage = true;
	pixelMath.newImageId = "";
	pixelMath.newImageWidth = 0;
	pixelMath.newImageHeight = 0;
	pixelMath.newImageAlpha = false;
	pixelMath.newImageColorSpace = PixelMath.prototype.SameAsTarget;
	pixelMath.newImageSampleFormat = PixelMath.prototype.SameAsTarget;

	if (CurrentProcessingInfo.createProcesesOnly) {
		pixelMath.launch();
	} else {
		for (let i = 0; i < iterations; i++) {
			pixelMath.executeOn(view);
		}
	}

	if (isPreview) {
		starMask.window.forceClose();
		originalView.window.forceClose();
	}

	view.window.removeMask();
}

function doBinarize(view) {
	let binarize = new Binarize;
	binarize.thresholdRK = 0.1;
	binarize.thresholdG = 0.1;
	binarize.thresholdB = 0.1;
	binarize.isGlobal = true;

	binarize.executeOn(view);
}

function doDilate(view) {
	let dilute = new MorphologicalTransformation;
	dilute.operator = MorphologicalTransformation.prototype.Dilation;
	dilute.interlacingDistance = 1;
	dilute.lowThreshold = 0.000000;
	dilute.highThreshold = 0.000000;
	dilute.numberOfIterations = 1;
	dilute.amount = 1.00;
	dilute.selectionPoint = 0.50;
	dilute.structureName = "5x5 Circular Structure";
	dilute.structureSize = 5;
	dilute.structureWayTable = [ // mask
		[[
			0x00, 0x01, 0x01, 0x01, 0x00,
			0x01, 0x01, 0x01, 0x01, 0x01,
			0x01, 0x01, 0x01, 0x01, 0x01,
			0x01, 0x01, 0x01, 0x01, 0x01,
			0x00, 0x01, 0x01, 0x01, 0x00
		]]
	];

	dilute.executeOn(view);
}

function doConvolve(view) {
	let convolve = new Convolution;
	convolve.mode = Convolution.prototype.Parametric;
	convolve.sigma = 4.50;
	convolve.shape = 2.00;
	convolve.aspectRatio = 1.00;
	convolve.rotationAngle = 0.00;
	convolve.filterSource = "";
	convolve.rescaleHighPass = false;
	convolve.viewId = "";

	convolve.executeOn(view);
}

function doBoost(view) {
	let boostCurves = new CurvesTransformation;
	boostCurves.K = [ // x, y
		[0.00000, 0.00000],
		[0.44082, 0.58367],
		[1.00000, 1.00000]
	];
	boostCurves.St = CurvesTransformation.prototype.AkimaSubsplines;

	boostCurves.executeOn(view);
}

function doDecon(view) {
	var decon = new Deconvolution;
	decon.algorithm = Deconvolution.prototype.RichardsonLucy;
	decon.numberOfIterations = CurrentProcessingInfo.deconIterations;
	decon.deringing = false;
	decon.toLuminance = true;
	decon.psfMode = Deconvolution.prototype.External;
	decon.psfViewId = CurrentProcessingInfo.psfViewId;
	decon.psfFFTSizeLimit = 15;
	decon.useRegularization = true;
	decon.waveletLayers = [ // noiseThreshold, noiseReduction
		[CurrentProcessingInfo.waveletThr[0], CurrentProcessingInfo.waveletStr[0]],
		[CurrentProcessingInfo.waveletThr[1], CurrentProcessingInfo.waveletStr[1]],
		[CurrentProcessingInfo.waveletThr[2], CurrentProcessingInfo.waveletStr[2]],
		[CurrentProcessingInfo.waveletThr[3], CurrentProcessingInfo.waveletStr[3]],
		[CurrentProcessingInfo.waveletThr[4], CurrentProcessingInfo.waveletStr[4]]
	];
	decon.noiseModel = Deconvolution.prototype.Gaussian;
	decon.numberOfWaveletLayers = 5;
	decon.scalingFunction = Deconvolution.prototype.B3Spline5x5;
	decon.iterations = [ // count
		[CurrentProcessingInfo.deconIterations],
		[CurrentProcessingInfo.deconIterations],
		[CurrentProcessingInfo.deconIterations]
	];

	if (CurrentProcessingInfo.createProcesesOnly) {
		decon.launch();
	} else {
		decon.executeOn(view);
	}
}

//#endregion "Do"

// #region "Create"

function createRawStarMask(deconInfo) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageStart("Creating raw star mask based on " + deconInfo.mainViewId);
	// clone main image
	let mainImageView = View.viewById(deconInfo.mainViewId).window.mainView;

	let lightness = extractLightness(mainImageView);
	// apply stf
	doSTF(lightness);
	// apply ht
	doHistogramTransformation(lightness);
	// check downsampling
	// downsample if necessary
	if (deconInfo.downsampleStarnet) {
		ConsoleWriter.writeMessageBlock("Downsampling " + lightness.id);
		var downSample = new IntegerResample;
		downSample.zoomFactor = -2;
		downSample.downsamplingMode = IntegerResample.prototype.Average;
		downSample.xResolution = 72.000;
		downSample.yResolution = 72.000;
		downSample.metric = false;
		downSample.forceResolution = false;
		downSample.noGUIMessages = false;

		downSample.executeOn(lightness);
	}
	// run starnet
	let starNet = getStarNet(deconInfo.useStarNet2);
	starNet.mask = true;
	starNet.stride = 0;
	ConsoleWriter.writeMessageBlock("Running StarNet++ on " + lightness.id + " - hold tight, this might take a while.");
	starNet.executeOn(lightness);
	let oldCloned = lightness;
	lightness = ImageWindow.activeWindow.currentView;
	lightness.id = oldCloned.id;
	oldCloned.window.forceClose();
	// upscale if necessary
	if (deconInfo.downsampleStarnet) {
		ConsoleWriter.writeMessageBlock("Upscaling " + lightness.id);
		var upSample = new Resample;
		upSample.xSize = mainImageView.image.width / lightness.image.width;
		upSample.ySize = mainImageView.image.height / lightness.image.height;
		upSample.mode = Resample.prototype.RelativeDimensions;
		upSample.absoluteMode = Resample.prototype.ForceWidthAndHeight;
		upSample.xResolution = 72.000;
		upSample.yResolution = 72.000;
		upSample.metric = false;
		upSample.forceResolution = false;
		upSample.interpolation = Resample.prototype.Auto;
		upSample.clampingThreshold = 0.30;
		upSample.smoothness = 1.50;
		upSample.noGUIMessages = false;

		upSample.executeOn(lightness);
	}

	// reset stf
	doResetSTF(lightness);
	let newClonedView = cloneView(lightness, "_ez_Decon_" + View.viewById(deconInfo.mainViewId).window.mainView.id + "_StarMask");
	lightness.window.forceClose();
	deconInfo.starMaskId = newClonedView.id;
	ConsoleWriter.writeMessageEnd("Raw Mask Creation done", false, true);
	JobStack.stopProcessing();
}

function createPSF(deconInfo) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageStart("Generating PSF image");
	let usedStars = [];
	var sensitivity = CurrentProcessingInfo.starSensitivity;
	var Max = 0.8;
	var Min = 0.02;
	var minMad = 1;
	var maxMad = 0;
	let selectedStars = [];
	//
	// collect all fitted stars
	//
	var functions = [];

	functions.push(DynamicPSF.prototype.Function_Moffat);
	functions.push(DynamicPSF.prototype.Function_Moffat10);
	functions.push(DynamicPSF.prototype.Function_Moffat8);
	functions.push(DynamicPSF.prototype.Function_Moffat6);
	functions.push(DynamicPSF.prototype.Function_Moffat4);
	functions.push(DynamicPSF.prototype.Function_Moffat25);
	functions.push(DynamicPSF.prototype.Function_Moffat15);

	var functionList = [];
	for (var i in functions) {
		var functionIndex = functions[i];
		var functionName = "";

		if (functionIndex === DynamicPSF.prototype.Function_Moffat) functionName = "Moffat";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat10) functionName = "Moffat10";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat8) functionName = "Moffat8";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat6) functionName = "Moffat6";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat4) functionName = "Moffat4";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat25) functionName = "Moffat25";
		if (functionIndex === DynamicPSF.prototype.Function_Moffat15) functionName = "Moffat15";

		functionList.push({ functionName: functionName, count: 0 });
	}

	var A = [];
	var B = [];
	var SX = [];
	var SY = [];
	var THETA = [];
	var BETA = [];

	let mainImageView = View.viewById(deconInfo.mainViewId).window.mainView;
	let originalIsColor = mainImageView.image.isColor;
	if (originalIsColor) {
		ConsoleWriter.writeMessageBlock("Original image is color, extracting luminance", true, false);
		var lumExtraction = new ChannelExtraction;
		lumExtraction.colorSpace = ChannelExtraction.prototype.CIELab;
		lumExtraction.channels = [
			[true, ""],
			[false, ""],
			[false, ""]
		];
		lumExtraction.sampleFormat = ChannelExtraction.prototype.SameAsSource;
		lumExtraction.executeOn(mainImageView);
		mainImageView = ImageWindow.activeWindow.currentView;
	}

	processEvents();

	selectedStars = getStars(mainImageView, sensitivity);

	if (originalIsColor) mainImageView.window.forceClose();

	ConsoleWriter.writeMessageBlock("Computing PSF", true, false);
	processEvents();
	// get min max MAD
	for (let i = 0;i<selectedStars.length;i++) {
		var sp = selectedStars[i];
		if (sp.mad > maxMad) maxMad = sp.mad;
		if (sp.mad < minMad) minMad = sp.mad;
	}

	for (var i = 0; i < selectedStars.length; i++) {
		var sp = selectedStars[i];

		var index = functions.indexOf(sp.psf_function);

		if (index < 0) continue;

		if (sp.a < Min || sp.a > Max) continue;

		A.push(sp.a);
		B.push(sp.b);
		SX.push(sp.sx);
		SY.push(sp.sy);
		THETA.push(sp.theta);
		BETA.push(sp.beta);
		usedStars.push(sp);

		functionList[index].count += 1;

		if (A.length == CurrentProcessingInfo.psfMaxStars) break;
	}

	if (A.length > 0) {
		var b = average(B);
		var a = average(A);
		var sx = average(SX);
		var sy = average(SY);
		var theta = average(THETA);
		var beta = average(BETA);
		let psfImage = createStarImage(b, a, sx, sy, theta, beta);

		var psfName = "_ez_PSF_" + View.viewById(deconInfo.mainViewId).window.mainView.id;

		var iw = new ImageWindow(psfImage.width, psfImage.height,
			1, 32, true, false, psfName);
		iw.mainView.beginProcess(UndoFlag_NoSwapFile);
		iw.mainView.image.assign(psfImage);
		iw.mainView.endProcess();
		iw.show();
		iw.visible = true;

		CurrentProcessingInfo.psfViewId = iw.mainView.id;
	}

	if (CurrentProcessingInfo.psfViewId == null) {
		ConsoleWriter.writeWarningBlock("Could not compute PSF! Adjust sensitivity and try again.");
	}
	ConsoleWriter.writeMessageEnd("PSF Creation done");

	JobStack.stopProcessing();
}

function createProcessedStarMask(deconInfo) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageStart("Creating processed star mask based on " + deconInfo.mainViewId);
	createRawStarMask(deconInfo);
	applyStf(deconInfo.starMaskId);
	applyBinarize(deconInfo.starMaskId);
	if (!deconInfo.downsampleStarnet) {
		applyDilate(deconInfo.starMaskId);
	}
	applyConvolute(deconInfo.starMaskId);
	applyDilate(deconInfo.starMaskId);
	ConsoleWriter.writeMessageEnd("Mask creation done", false, true);
	JobStack.stopProcessing();
}

// #endregion "Create"

// #region "PSF"

function createStarImage(b, a, sx, sy, theta, beta) {
	//
	// implements Moffat function
	//
	var box = boxSize(b, a, beta, sx, sy, theta);

	var c = Math.floor(box / 2);

	var cx = c + 1;
	var cy = c + 1;

	var img = new Image(box, box);

	var max = moffat(cx, cy, b, a, cx, cy, beta, sx, sy);
	var min = moffat(0, 0, b, a, cx, cy, beta, sx, sy);

	var f = 1 / (max - min);

	for (var y = 0; y < img.height; y++) {
		for (var x = 0; x < img.width; x++) {
			var t = new transformXY(- c + x, - c + y, theta);
			var m = moffat(t.x + cx, t.y + cy, b, a, cx, cy, beta, sx, sy);
			m = (m - min) * f;
			img.setSample(m, x, img.height - y - 1);
		}
	}

	return img;
}

function boxSize(b, a, beta, sx, sy, theta) {
	var max = moffat(0, 0, b, a, 0, 0, beta, sx, sy);

	var x = 0;
	var y = 0;
	var v = 2;

	while (true) {
		var t = new transformXY(x, 0, theta);
		var mx = moffat(x, 0, b, a, 0, 0, beta, sx, sy);
		mx /= max;

		if (v - mx < 0.01) break;

		v = mx;

		x += 1;

		if (x > 32) break;
	}

	v = 2;

	while (true) {
		var t = new transformXY(x, y, theta);
		var my = moffat(0, y, b, a, 0, 0, beta, sx, sy);
		my /= max;

		if (v - my < 0.01) break;

		v = my;

		y += 1;

		if (y > 32) break;
	}

	var box = Math.max(x - 1, y - 1);

	box *= 2;

	box += 1;

	return box;
}

function transformXY(x, y, theta) {
	this.x = x * Math.cos(theta * Math.RAD) + y * Math.sin(theta * Math.RAD);
	this.y = -x * Math.sin(theta * Math.RAD) + y * Math.cos(theta * Math.RAD);
}

function moffat(x, y, B, A, cx, cy, beta, sigmax, sigmay) {
	var sqx = sigmax * sigmax;
	var sqy = sigmay * sigmay;
	var dx2 = Math.pow(x - cx, 2);
	var dy2 = Math.pow(y - cy, 2);

	return B + A / Math.pow((1 + dx2 / sqx + dy2 / sqy), beta);
}

function getStars(view, sensitivity) {
	ConsoleWriter.writeMessageStart("Getting stars for " + view.id);
	processEvents();
	var std = new StarDetector();
	std.sensitivity = Math.pow(10.0, sensitivity);

	var stars = std.stars(view.image);

	if (stars == null) return [];
	if (stars.length == 0) return [];

	var barycenters = new Array;

	var s = stars[0];

	var keys = Object.keys(s);

	for (var i = 0; i != stars.length; ++i) {
		barycenters.push({
			position: stars[i].pos,
			radius: Math.max(3, Math.ceil(Math.sqrt(stars[i].size)))
		});
	}

	processEvents();
	var dynamicPSF = new DynamicPSF;

	stars = [];

	for (var i = 0; i !== barycenters.length; ++i) {
		stars.push([0, 0, DynamicPSF.prototype.Star_DetectedOk,
			barycenters[i].position.x - barycenters[i].radius,
			barycenters[i].position.y - barycenters[i].radius,
			barycenters[i].position.x + barycenters[i].radius,
			barycenters[i].position.y + barycenters[i].radius,
			barycenters[i].position.x,
			barycenters[i].position.y]);
	}
	ConsoleWriter.writeMessageBlock("Detected stars " + barycenters.length);

	var starProfiles = [];
	var increment = Math.floor(stars.length / 100);
	if (increment === 0) increment = stars.length;

	//
	// PSF analysis
	//

	dynamicPSF.autoPSF = true;		// start with auto, select by function codes
	dynamicPSF.gaussianPSF = false;
	var views = [];
	views.push(new Array(view.id));
	dynamicPSF.views = views;
	dynamicPSF.views[0] = view.id;
	dynamicPSF.signedAngles = true;
	dynamicPSF.regenerate = true;
	var allStars = [];

	dynamicPSF.stars = stars;

	dynamicPSF.executeGlobal();

	for (var i = 0; i < dynamicPSF.psf.length; ++i) {
		var psfRow = dynamicPSF.psf[i];
		allStars.push(psfRow);
		if (psfRow[3] === DynamicPSF.prototype.PSF_FittedOk) {
			starProfiles.push(new starProfile(
				psfRow[PSF_function],
				psfRow[PSF_circular],
				psfRow[PSF_status],
				psfRow[PSF_B],
				psfRow[PSF_A],
				psfRow[PSF_cx],
				psfRow[PSF_cy],
				psfRow[PSF_sx],
				psfRow[PSF_sy],
				psfRow[PSF_theta],
				psfRow[PSF_beta],
				psfRow[PSF_mad]
			));
		}
	}

	var a = uniqueArray(starProfiles, starProfileCompareMAD);
	if (a.length === 0) {
		ConsoleWriter.writeWarningBlock("Could not detect any stars. This works only on linear images!");
	}
	ConsoleWriter.writeMessageEnd("Getting stars done");
	return a;
}

function starProfile(psf_function, psf_circular, psf_status, B, A, cx, cy,
	sx, sy, theta, beta, mad) {
	this.psf_function = psf_function;
	this.psf_circular = psf_circular;
	this.psf_status = psf_status;
	this.a = A;
	this.b = B;
	this.cx = cx;
	this.cy = cy;
	this.sx = sx;
	this.sy = sy;
	this.theta = theta;
	this.beta = beta;
	this.mad = mad;
}

function starProfileCompareMAD(a, b) {
	return a.mad < b.mad ? -1 : 1;
}

function uniqueArray(values, compareFunction) {
	if (values.length < 2) {
		return values;
	}
	values.sort(compareFunction);

	var j = 0;
	for (var i = 1; i != values.length; ++i) {
		if (compareFunction(values[j], values[i]) == -1) {
			++j;
			values[j] = values[i];
		}
	}
	return values.slice(0, j + 1);
}

function average(a) {
	if (a == null) return 0;
	if (a.length == 0) return 0;
	return Math.sum(a) / a.length;
}

// #endregion "PSF"

// #region "Apply"
function applyStf(viewId) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageBlock("Applying STF to " + viewId, true, false);
	let view = View.viewById(viewId);
	// apply stf
	doSTF(view);
	// apply ht
	doHistogramTransformation(view);
	// reset stf
	doResetSTF(view);
	JobStack.stopProcessing();
}

function applyBinarize(viewId) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageBlock("Applying Binarize to " + viewId, true, false);
	let view = View.viewById(viewId);
	// apply binarize
	// threshold 0.10
	doBinarize(view);
	JobStack.stopProcessing();
}

function applyDilate(viewId) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageBlock("Applying Dilate to " + viewId, true, false);
	let view = View.viewById(viewId);
	// apply morphtransform
	// dilation, amount 1, 1 iteration, 5x5 circular
	doDilate(view);
	JobStack.stopProcessing();
}

function applyConvolute(viewId) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageBlock("Applying Convolve to " + viewId, true, false);
	let view = View.viewById(viewId);
	// apply convolution
	// sigma 4.5, shape 2
	doConvolve(view);
	JobStack.stopProcessing();
}

function applyBoost(viewId) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageBlock("Applying boost to " + viewId, true, false);
	let view = View.viewById(viewId);
	// apply curvestransformation
	doBoost(view);
	JobStack.stopProcessing();
}

// #endregion "Apply"

// #region "Dialog"

function customizeDialog() {
	GlobalDialog.infoBox.text = "<b>EZ Decon:</b> A script to easily deconvolve and sharpen an image. It is based on sharpening the image using deconvolution without deringing and replacing the stars in the image. A good star mask is required and can be generated with this script. For star mask generation, StarNet++ needs to be installed.";
	GlobalDialog.allowPreviews();

	GlobalDialog.tutorialPrerequisites = ["Image is cropped properly", "Image is not stretched (image is linear)", "StarNet++ is installed or StarNet++ raw star mask is present"];
	GlobalDialog.tutorialSteps = ["Select image or preview to apply to",
		"Press 'Create New Processed Star Mask' or 'Create new raw Star Mask' or select a already processed or raw star mask",
		"Adjust Star Mask if necessary with 'Edit Star Mask' buttons and the custom ellipses in the panel on the right",
		"Verify Star Mask is covering all stars well with the 'Alternative Version of Image' view of the 'Star Mask' tab",
		"On demand, either specify or create a new background mask. The background mask will be used to replace the background after deconvolution",
		"Generate or select a PSF in 'Deconvolution' tab, warning: will take long on large images, might be better to create one manually",
		"Press 'Evaluate EZ Decon Run' to evaluate the current settings",
		"Verify result is adequate, eventually adjust Star Mask, Wavelets or Iterations and repeat evaluation",
		"If image gets noisier increase wavelet strength",
		"If image is oversharpened, reduce iterations",
		"If stars have ringing increase Star Mask radius to cover stars better",
		"Once happy with the result either run EZ Decon or Apply Current of a specified run"];

	GlobalDialog.starMaskControlIndex = 1;
	GlobalDialog.psfControlIndex = 2;

	GlobalDialog.onEvaluateButton.show();

	GlobalDialog.onExit = function () { }

	GlobalDialog.onSelectedMainView = function (value, prevMainViewId) {
		GlobalDialog.starMaskImageSelector.excludedView = value.window.mainView;
		GlobalDialog.psfImageSelector.excludedView = value.window.mainView;
		if (prevMainViewId != CurrentProcessingInfo.mainViewId) {
			if (GlobalDialog.psfImageSelector.currentView != null)
				GlobalDialog.psfImageSelector.remove(GlobalDialog.psfImageSelector.currentView);
			GlobalDialog.psfImageSelector.reload();
			CurrentProcessingInfo.psfViewId = null;

			if (GlobalDialog.starMaskImageSelector.currentView != null)
				GlobalDialog.starMaskImageSelector.remove(GlobalDialog.starMaskImageSelector.currentView);
			GlobalDialog.starMaskImageSelector.reload();
			CurrentProcessingInfo.starMaskId = null;

			for (let i = GlobalDialog.tabBox.numberOfPages - 1; i >= 0; i--) {
				GlobalDialog.tabBox.pageControlByIndex(i).dispose();
				GlobalDialog.tabBox.removePage(i);
			}
		} else {
			try {
				GlobalDialog.tabBox.pageControlByIndex(0).dispose();
				GlobalDialog.tabBox.removePage(0);
			} catch (e) { }
		}
		GlobalDialog.addMainControl(true, CurrentProcessingInfo.workingViewId, null);
		GlobalDialog.tabBox.currentPageIndex = 0;
		if (prevMainViewId == null) GlobalDialog.width *= 3;
	}

	GlobalDialog.onEmptyMainView = function () {
		GlobalDialog.tabBox.hide();
		GlobalDialog.adjustToContents();
	}

	GlobalDialog.canRun = function () {
		return CurrentProcessingInfo.mainViewId != null
			&& CurrentProcessingInfo.psfViewId != null
			&& CurrentProcessingInfo.starMaskId != null
			&& (CurrentProcessingInfo.backgroundReplacement == false 
				|| (CurrentProcessingInfo.backgroundReplacement == true && CurrentProcessingInfo.backgroundMaskId != null));
	}

	GlobalDialog.canEvaluate = function () { return GlobalDialog.canRun(); }

	GlobalDialog.starMaskImageSelector = new ViewList(GlobalDialog);
	with (GlobalDialog.starMaskImageSelector) {
		bindings = function() {
			if(CurrentProcessingInfo.starMaskId != null
				&& CurrentProcessingInfo.starMaskId != this.currentView.id) {
				getMainViews();
				this.currentView = View.viewById(CurrentProcessingInfo.starMaskId);
				this.onViewSelected(this.currentView);
			}
		}
		toolTip = "Select Star Mask";
		onViewSelected = function (value) {
			if (value.isNull) {
				CurrentProcessingInfo.starMaskId = null;
				let oldStarMask = GlobalDialog.findControlInTabBox("Star Mask");
				if (oldStarMask != null) {
					oldStarMask.dispose();
					GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(oldStarMask));
				}
				return;
			}
			if (value.image.isColor) {
				GlobalDialog.showWarningDialog("Cannot use RGB Star Mask.");
				GlobalDialog.starMaskImageSelector.remove(value);
			} else {
				let mainView = View.viewById(CurrentProcessingInfo.mainViewId);
				if (value.image.width != mainView.image.width || value.image.height != mainView.image.height) {
					GlobalDialog.showWarningDialog("Incompatible mask geometry");
					GlobalDialog.starMaskImageSelector.remove(value);
					return;
				} else {
					CurrentProcessingInfo.starMaskId = value.isPreview ? value.fullId : value.id;
					ConsoleWriter.writeMessageBlock("Selected star mask '" + CurrentProcessingInfo.starMaskId + "'", true, true);
					GlobalDialog.addStarMaskControl();
				}
			}
		}
		excludeIdentifiersPattern = "_ez_temp_*";
		getMainViews();
	}

	GlobalDialog.backgroundProtectionSelector = new ViewList(GlobalDialog);
	with (GlobalDialog.backgroundProtectionSelector) {
		toolTip = "Select Background Replacement";
		bindings = function() {
			if(CurrentProcessingInfo.backgroundMaskId != null
				&& CurrentProcessingInfo.backgroundMaskId != this.currentView.id) {
				getMainViews();
				this.currentView = View.viewById(CurrentProcessingInfo.backgroundMaskId);
				this.onViewSelected(this.currentView);
			}
		}
		onViewSelected = function (value) {
			if (value.isNull) {
				CurrentProcessingInfo.backgroundMaskId = null;
				let backgroundMask = GlobalDialog.findControlInTabBox("Background");
				if (backgroundMask != null) {
					backgroundMask.dispose();
					GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(backgroundMask));
				}
				return;
			}
			if (value.image.isColor) {
				GlobalDialog.showWarningDialog("Cannot use RGB Background Mask.");
				GlobalDialog.backgroundProtectionSelector.remove(value);
			} else {
				let mainView = View.viewById(CurrentProcessingInfo.mainViewId);
				if (value.image.width != mainView.image.width || value.image.height != mainView.image.height) {
					GlobalDialog.showWarningDialog("Incompatible mask geometry");
					GlobalDialog.backgroundProtectionSelector.remove(value);
					return;
				} else {
					CurrentProcessingInfo.backgroundMaskId = value.isPreview ? value.fullId : value.id;
					ConsoleWriter.writeMessageBlock("Selected background mask '" + CurrentProcessingInfo.backgroundMaskId + "'", true, true);
					GlobalDialog.addBackgroundMaskControl();
				}
			}
		}
		excludeIdentifiersPattern = "_ez_temp_*";
		getMainViews();
	}

	GlobalDialog.addMainControl = function (clear, viewId) {
		if (viewId != null) {
			let previewControl = new PreviewControl(GlobalDialog, true, true);

			previewControl.swap = function () {
				GlobalDialog.tabBox.currentPageIndex = GlobalDialog.tabBox.numberOfPages - 1;
			}

			previewControl.SetView(View.viewById(viewId));

			let swapToLatestButton = new PushButton(previewControl);
			swapToLatestButton.text = "Change Tab to Latest Run";
			swapToLatestButton.onClick = function () {
				previewControl.swap.call(previewControl);
			}
			swapToLatestButton.bindings = function () {
				swapToLatestButton.text = "Change Tab to " + GlobalDialog.tabBox.pageLabel(GlobalDialog.tabBox.numberOfPages - 1);
			}
			previewControl.infoFrame.sizer.insertItem(0, swapToLatestButton);

			GlobalDialog.tabBox.insertPage(0, previewControl, CurrentProcessingInfo.workingViewId);

			GlobalDialog.tabBox.show();
		} else {
			GlobalDialog.tabBox.hide();
		}
	}

	GlobalDialog.addBackgroundMaskControl = function () {
		JobStack.startProcessing();
		let backgroundMaskControl = GlobalDialog.findControlInTabBox("Background");
		if (backgroundMaskControl != null) {
			backgroundMaskControl.dispose();
			GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(backgroundMaskControl));
		}

		let previewControl = new PreviewControl(GlobalDialog, false, false);
		previewControl.syncView = false;
		previewControl.cloned = false;

		previewControl.bindings = function () {
			if (!JobStack.isProcessing()) {
				let curIndex = this.previewFrameWindow.mainView.historyIndex;
				if (curIndex != this.previousHistory) {
					this.previousHistory = curIndex;
					this.forceRerender();
				}
			}
		}

		previewControl.computeAltImage = function () {
			JobStack.startProcessing();
			let orgControl = GlobalDialog.tabBox.pageControlByIndex(0);

			if (this.previewFrameAltWindow == null) {
				this.previewFrameAltWindow = cloneView(orgControl.previewFrameWindow.mainView, "_ez_temp_" + this.previewFrameWindow.currentView.id + "Alt", true, true).window;
			}

			let clonedView = cloneView(orgControl.previewFrameWindow.mainView, "_ez_temp_clone", true, true);
			doSTF(clonedView);
			doHistogramTransformation(clonedView);

			var pixelMath = new PixelMath;
			pixelMath.expression = "max({0},1-{1})".format(clonedView.id, CurrentProcessingInfo.backgroundMaskId);
			pixelMath.expression1 = "iif({0}<(1-{1}),0,{0})".format(clonedView.id, CurrentProcessingInfo.backgroundMaskId);
			pixelMath.expression2 = "iif({0}<(1-{1}),0,{0})".format(clonedView.id, CurrentProcessingInfo.backgroundMaskId);
			pixelMath.expression3 = "";
			pixelMath.useSingleExpression = false;
			pixelMath.symbols = "";
			pixelMath.generateOutput = true;
			pixelMath.singleThreaded = false;
			pixelMath.use64BitWorkingImage = false;
			pixelMath.rescale = false;
			pixelMath.rescaleLower = 0;
			pixelMath.rescaleUpper = 1;
			pixelMath.truncate = true;
			pixelMath.truncateLower = 0;
			pixelMath.truncateUpper = 1;
			pixelMath.createNewImage = false;
			pixelMath.showNewImage = true;
			pixelMath.newImageId = "";
			pixelMath.newImageWidth = 0;
			pixelMath.newImageHeight = 0;
			pixelMath.newImageAlpha = false;
			pixelMath.newImageColorSpace = PixelMath.prototype.SameAsTarget;
			pixelMath.newImageSampleFormat = PixelMath.prototype.SameAsTarget;

			pixelMath.executeOn(this.previewFrameAltWindow.currentView);

			clonedView.window.forceClose();

			Console.writeln("Ran PixelMath on " + this.previewFrameWindow.currentView.id);
			JobStack.stopProcessing();
		};

		previewControl.previousHistory = View.viewById(CurrentProcessingInfo.backgroundMaskId).historyIndex;

		previewControl.SetView(View.viewById(CurrentProcessingInfo.backgroundMaskId), true);

		let infoPanel = new SpacedRichLabel(previewControl);
		with (infoPanel) {
			frameStyle = FrameStyle_Box;
			text = "<b>This mask display is just an approximation! Red areas will not be replaced. It is possible that the preview is not ideal.</b><br /><br />The Goal of this mask should be to cover background in the image. <br/><br/>The background will be replaced after running deconvolution.<br/><br/>Use The Blending control to determine the blending strength after deconvolution.";
		}
		previewControl.infoFrame.sizer.insertItem(0, infoPanel);

		GlobalDialog.tabBox.insertPage(2, previewControl, "Background");
		GlobalDialog.tabBox.currentPageIndex = GlobalDialog.findControlIndexInTabBox(GlobalDialog.findControlInTabBox("Background"));
		JobStack.stopProcessing();
	}

	GlobalDialog.addStarMaskControl = function () {
		JobStack.startProcessing();
		let oldStarMaskControl = GlobalDialog.findControlInTabBox("Star Mask");
		if (oldStarMaskControl != null) {
			oldStarMaskControl.dispose();
			GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(oldStarMaskControl));
		}

		let previewControl = new PreviewControl(GlobalDialog, false, false);
		previewControl.syncView = false;
		previewControl.cloned = false;

		previewControl.bindings = function () {
			if (!JobStack.isProcessing()) {
				let curIndex = this.previewFrameWindow.mainView.historyIndex;
				if (curIndex != this.previousHistory) {
					this.previousHistory = curIndex;
					this.forceRerender();
				}
			}
		}

		previewControl.ellipsoids = [];
		previewControl.previousEllipsoids = [];
		previewControl.dragging = false;

		previewControl.computeAltImage = function () {
			JobStack.startProcessing();
			let orgControl = GlobalDialog.tabBox.pageControlByIndex(0);

			if (this.previewFrameAltWindow == null) {
				this.previewFrameAltWindow = cloneView(orgControl.previewFrameWindow.mainView, "_ez_temp_" + this.previewFrameWindow.currentView.id + "Alt", true).window;
			}

			let clonedView = cloneView(orgControl.previewFrameWindow.mainView, "_ez_temp_clone", true);
			doSTF(clonedView);
			doHistogramTransformation(clonedView);

			var pixelMath = new PixelMath;
			pixelMath.expression = clonedView.id + "*(1-" + CurrentProcessingInfo.starMaskId + ")";
			pixelMath.expression1 = "";
			pixelMath.expression2 = "";
			pixelMath.expression3 = "";
			pixelMath.useSingleExpression = true;
			pixelMath.symbols = "";
			pixelMath.generateOutput = true;
			pixelMath.singleThreaded = false;
			pixelMath.use64BitWorkingImage = false;
			pixelMath.rescale = false;
			pixelMath.rescaleLower = 0;
			pixelMath.rescaleUpper = 1;
			pixelMath.truncate = true;
			pixelMath.truncateLower = 0;
			pixelMath.truncateUpper = 1;
			pixelMath.createNewImage = false;
			pixelMath.showNewImage = true;
			pixelMath.newImageId = "";
			pixelMath.newImageWidth = 0;
			pixelMath.newImageHeight = 0;
			pixelMath.newImageAlpha = false;
			pixelMath.newImageColorSpace = PixelMath.prototype.SameAsTarget;
			pixelMath.newImageSampleFormat = PixelMath.prototype.SameAsTarget;

			pixelMath.executeOn(this.previewFrameAltWindow.currentView);

			clonedView.window.forceClose();

			Console.writeln("Ran PixelMath on " + this.previewFrameWindow.currentView.id);
			JobStack.stopProcessing();
		};

		
		//#region Ellipsoid
		previewControl.findEllipsoid = function (x, y) {
			//
			// check top object at first
			//
			if (this.getEllipsoid() != null) {
				var e = this.getEllipsoid();
				if (e.findSelect(x, y)) {
					this.deselectAll();
					e.selected = true;
					return e;
				}
			}
			//
			// search all
			//
			for (var i = 0; i < this.ellipsoids.length; i++) {
				var e = this.ellipsoids[i];
				if (e.findSelect(x, y)) {
					this.deselectAll();
					for (var i = 0; i < this.ellipsoids.length; i++) {
						this.ellipsoids[i].selected = this.ellipsoids[i] == e;
					}
					return e;
				}
			}
			return null;
		}

		previewControl.deselectAll = function () {
			for (let i = 0; i < this.ellipsoids.length; i++) {
				this.ellipsoids[i].selected = false;
			}
		}

		previewControl.getEllipsoid = function () {
			for (let i = 0; i < this.ellipsoids.length; i++) {
				if (this.ellipsoids[i].selected) return this.ellipsoids[i];
			}

			return null;
		}

		previewControl.onCustomPaint = function (g, x0, y0, x1, y1) {
			//
			// draw ellipsoids
			//
			for (let i = 0;i<this.ellipsoids.length;i++) {
				this.ellipsoids[i].draw(g);
			}
		}

		previewControl.onCustomMouseDown = function (x, y, button, buttonState, modifiers) {
			var e = this.findEllipsoid(x, y);
			if (e == null) {
				return;              // cursor far away from any point
			}
			//
			// data to controls
			//
			if (e.sp == 0) {
				// move center
				this.dragging = true;
			}
			else {
				// move a or b - point
				this.dragging = true;
			}
		}
		previewControl.onCustomMouseMove = function (x, y, buttonState, modifiers) {
			if (this.dragging) {
				var e = this.getEllipsoid();
				e.movePoint(new Point(x, y));
				this.parent.repaint();    // update ellipsoid object
			}
		}

		previewControl.onCustomMouseUp = function (x, y, button, buttonState, modifiers) {
			this.dragging = false;
			this.parent.repaint();
		}

		previewControl.editAddEllipse = new PushButton(previewControl);
		with (previewControl.editAddEllipse) {
			toolTip = "Add ellipse";
			text = "Add Ellipse";
			icon = GlobalDialog.scaledResource(":/icons/add.png");
			onClick = function () {
				let control = previewControl;
				let p = control.center();
				control.ellipsoids.push(new ellipsoid(p.x, p.y, 50, 50, 0, control));
				control.deselectAll();
				control.ellipsoids[control.ellipsoids.length - 1].selected = true;
				control.repaint();
			}
		}

		previewControl.editDeleteEllipse = new PushButton(previewControl);
		with (previewControl.editDeleteEllipse) {
			toolTip = "Remove selected ellipse";
			text = "Remove Selected Ellipse";
			icon = GlobalDialog.scaledResource(":/icons/delete.png");
			bindings = function () {
				this.enabled = previewControl.getEllipsoid() != null;
			}
			onClick = function () {
				let control = previewControl;
				let newArr = [];
				for (let i = 0; i < previewControl.ellipsoids.length; i++) {
					if (!previewControl.ellipsoids[i].selected) newArr.push(previewControl.ellipsoids[i]);
				}
				previewControl.ellipsoids = newArr;
				previewControl.repaint();
			}
		}

		previewControl.restorePreviousEllipses = new PushButton(previewControl);
		with (previewControl.restorePreviousEllipses) {
			toolTip = "Restore last used ellipses";
			text = "Restore last used Ellipses";
			icon = GlobalDialog.scaledResource(":/icons/undo.png");
			bindings = function () {
				this.enabled = previewControl.previousEllipsoids.length > 0;
			}
			onClick = function () {
				for (let i = 0; i < previewControl.previousEllipsoids.length; i++) {
					let previous = previewControl.previousEllipsoids[i];
					previous.selected = false;
					previewControl.ellipsoids.push(previous);
				}
				previewControl.previousEllipsoids = [];
				previewControl.repaint();
			}
		}

		previewControl.ellipseGroupBox = new GroupBox(previewControl);
		with (previewControl.ellipseGroupBox) {
			sizer = new SpacedVerticalSizer;
			title = "Custom ellipses";
			sizer.addItem(previewControl.editAddEllipse);
			sizer.addItem(previewControl.editDeleteEllipse);
			sizer.addItem(previewControl.restorePreviousEllipses);
		}

		previewControl.starMaskAdd = new PushButton(previewControl);
		with (previewControl.starMaskAdd) {
			text = "Add all to mask";
			icon = GlobalDialog.scaledResource(":/icons/add.png");
			bindings = function () {
				this.enabled = previewControl.ellipsoids.length > 0;
			}
			onClick = function () {
				let view = cloneView(View.viewById(CurrentProcessingInfo.starMaskId), "_ez_temp_ellipsoids", true);
				view.beginProcess(UndoFlag_NoSwapFile);
				view.image.assign(ellipsoidsImage(view, previewControl.ellipsoids));
				view.endProcess();
				doPixelMath(View.viewById(CurrentProcessingInfo.starMaskId), "max($T,{0})".format(view.id), true);
				previewControl.previousEllipsoids = previewControl.ellipsoids;
				previewControl.ellipsoids = [];
				view.window.forceClose();
			}
		}

		previewControl.starMaskRemove = new PushButton(previewControl);
		with (previewControl.starMaskRemove) {
			text = "Subtract all from mask";
			icon = GlobalDialog.scaledResource(":/icons/delete.png");
			bindings = function () {
				this.enabled = previewControl.ellipsoids.length > 0;
			}
			onClick = function () {
				let view = cloneView(View.viewById(CurrentProcessingInfo.starMaskId), "_ez_temp_ellipsoids", true);
				view.beginProcess(UndoFlag_NoSwapFile);
				view.image.assign(ellipsoidsImage(view, previewControl.ellipsoids));
				view.endProcess();
				doPixelMath(View.viewById(CurrentProcessingInfo.starMaskId), "$T-{0}".format(view.id), true);
				previewControl.previousEllipsoids = previewControl.ellipsoids;
				previewControl.ellipsoids = [];
				view.window.forceClose();
			}
		}

		previewControl.starmaskEditGroupBox = new GroupBox(previewControl);
		with (previewControl.starmaskEditGroupBox) {
			sizer = new SpacedVerticalSizer;
			title = "Ellipse Mask Adjustment";
			sizer.addItem(previewControl.starMaskAdd);
			sizer.addItem(previewControl.starMaskRemove);
		}
		//#endregion Ellipsoid

		
		previewControl.SetView(View.viewById(CurrentProcessingInfo.starMaskId), true);
		previewControl.previousHistory = previewControl.previewFrameWindow.mainView.historyIndex;

		let infoPanel = new SpacedRichLabel(previewControl);
		with (infoPanel) {
			frameStyle = FrameStyle_Box;
			text = "Use the 'Edit Star Mask' controls on the left to adjust the star mask to cover all stars in the image. <br/><br/>Use the 'Alternative Version of image' checkbox above to show the subtracted Star Mask from the original image.<br/><br/>Use the Ellipse controls below to add ellipses and add or subtract them from the star mask should some stars or structures not be covered (i.e. newton spikes).<br/><br/>The Goal should be to cover all stars in the image + about 50% of the size of the stars.<br /><br /><i>Note: not all stars need to be fully black when subtracted, this can be taken care of with more PixelMath iterations</i>";
		}
		previewControl.infoFrame.sizer.insertItem(0, infoPanel);
		previewControl.infoFrame.sizer.insertItem(2, previewControl.ellipseGroupBox);
		previewControl.infoFrame.sizer.insertItem(3, previewControl.starmaskEditGroupBox);

		GlobalDialog.tabBox.insertPage(1, previewControl, "Star Mask");
		GlobalDialog.tabBox.currentPageIndex = 1;
		JobStack.stopProcessing();
	}

	GlobalDialog.addPSFControl = function () {
		JobStack.startProcessing();
		// add previewcontrol
		let oldPSFControl = GlobalDialog.findControlInTabBox("PSF");
		if (oldPSFControl != null) {
			oldPSFControl.dispose();
			GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(oldPSFControl));

		}

		let previewControl = new PreviewControl(GlobalDialog, false, false);

		previewControl.SetView(View.viewById(CurrentProcessingInfo.psfViewId), false);
		previewControl.UpdateZoom(8);

		let infoPanel = new SpacedRichLabel(previewControl);
		with (infoPanel) {
			frameStyle = FrameStyle_Box;
			text = "Verify the generated or selected PSF image here.";
		}
		previewControl.infoFrame.sizer.insertItem(0, infoPanel);
		previewControl.cloned = false;

		GlobalDialog.tabBox.insertPage(3, previewControl, "PSF");
		GlobalDialog.tabBox.currentPageIndex = GlobalDialog.findControlIndexInTabBox(GlobalDialog.findControlInTabBox("PSF"));
		JobStack.stopProcessing();
	}

	GlobalDialog.starMaskImageLabel = new Label(GlobalDialog);
	with (GlobalDialog.starMaskImageLabel) {
		text = "Star Mask";
	}

	GlobalDialog.starMaskImageSizer = new SpacedHorizontalSizer();
	with (GlobalDialog.starMaskImageSizer) {
		addItem(GlobalDialog.starMaskImageLabel);
		addItem(GlobalDialog.starMaskImageSelector);
	}

	GlobalDialog.createRawStarMaskButton = new PushButton(GlobalDialog);
	with (GlobalDialog.createRawStarMaskButton) {
		toolTip = "Create a raw star mask with StarNet++";
		text = "Create New Raw Star Mask";
		icon = GlobalDialog.scaledResource(":/browser/launch.png");
		bindings = function () {
			this.enabled = getStarNet(CurrentProcessingInfo.useStarNet2) != null && CurrentProcessingInfo.starMaskId == null;
		}
		onClick = function () {
			createRawStarMask(CurrentProcessingInfo);
		}
	}

	GlobalDialog.createProcessedStarMaskButton = new PushButton(GlobalDialog);
	with (GlobalDialog.createProcessedStarMaskButton) {
		toolTip = "Creates raw star mask and processes it with default values (stf, binarize, dilate, convolve, dilate)";
		text = "Create New Processed Star Mask";
		icon = GlobalDialog.scaledResource(":/icons/forward.png");
		bindings = function () {
			this.enabled = getStarNet(CurrentProcessingInfo.useStarNet2) != null && CurrentProcessingInfo.starMaskId == null;
		}
		onClick = function () {
			createProcessedStarMask(CurrentProcessingInfo);
		}
	}

	GlobalDialog.downsampleStarNetCheckBox = new CheckBox(GlobalDialog);
	with (GlobalDialog.downsampleStarNetCheckBox) {
		toolTip = ""
		text = "Use Downsampling for StarNet++";
		enabled = getStarNet(CurrentProcessingInfo.useStarNet2) != null;
		checked = CurrentProcessingInfo.downsampleStarnet;
		onCheck = function (value) {
			CurrentProcessingInfo.downsampleStarnet = value;
		}
	}

	GlobalDialog.useStarNet2 = new CheckBox(GlobalDialog);
	with (GlobalDialog.useStarNet2) {
		toolTip = ""
		text = "Use StarNet2";
		enabled = getStarNet(true) != null;
		checked = CurrentProcessingInfo.useStarNet2;
		onCheck = function (value) {
			CurrentProcessingInfo.useStarNet2 = value;
		}
	}

	// #region "EditButtons"

	GlobalDialog.editUndoButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editUndoButton) {
		toolTip = "Undo last action";
		text = "Undo";
		bindings = function () {
			if (CurrentProcessingInfo.starMaskId == null) return;
			this.enabled = View.viewById(CurrentProcessingInfo.starMaskId).historyIndex > 0;
		}
		icon = GlobalDialog.scaledResource(":/icons/undo.png");
		onClick = function () {
			JobStack.startProcessing();
			ConsoleWriter.writeMessageBlock("Reverting last step", true, true);
			View.viewById(CurrentProcessingInfo.starMaskId).window.undo();
			JobStack.stopProcessing();
		}
	}

	GlobalDialog.editApplyStfStretchButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editApplyStfStretchButton) {
		toolTip = "Apply STF Stretch to Star Mask";
		text = "STF Stretch";
		icon = GlobalDialog.scaledResource(":/icons/burn.png");
		onClick = function () {
			applyStf(CurrentProcessingInfo.starMaskId);
		}
	}

	GlobalDialog.editApplyBinarizeButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editApplyBinarizeButton) {
		toolTip = "Binarizes the Star Mask";
		text = "Binarize";
		icon = GlobalDialog.scaledResource(":/icons/picture-contrast.png");
		onClick = function () {
			applyBinarize(CurrentProcessingInfo.starMaskId);
		}
	}

	GlobalDialog.editApplyDilateButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editApplyDilateButton) {
		toolTip = "Extends the stars in the Star Mask";
		text = "Dilate";
		icon = GlobalDialog.scaledResource(":/toolbar/image-mode-zoom-in.png");
		onClick = function () {
			applyDilate(CurrentProcessingInfo.starMaskId);
		}
	}

	GlobalDialog.editApplyConvoluteButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editApplyConvoluteButton) {
		toolTip = "Softens the Star Mask";
		text = "Convolve";
		icon = GlobalDialog.scaledResource(":/shapes/shape-sphere-gray.png");
		onClick = function () {
			applyConvolute(CurrentProcessingInfo.starMaskId);
		}
	}

	GlobalDialog.editApplyBoostButton = new PushButton(GlobalDialog);
	with (GlobalDialog.editApplyBoostButton) {
		toolTip = "Boosts the Star Masks histogram slightly";
		text = "Boost";
		icon = GlobalDialog.scaledResource(":/icons/statistics.png");
		onClick = function () {
			applyBoost(CurrentProcessingInfo.starMaskId);
		}
	}

	GlobalDialog.spacerLabel = new Label(GlobalDialog);

	GlobalDialog.editHorizSizer1 = new SpacedHorizontalSizer();
	with (GlobalDialog.editHorizSizer1) {
		addItem(GlobalDialog.editApplyStfStretchButton);
		addItem(GlobalDialog.editApplyBoostButton);
	}

	GlobalDialog.editHorizSizer2 = new SpacedHorizontalSizer();
	with (GlobalDialog.editHorizSizer2) {
		addItem(GlobalDialog.editApplyDilateButton);
		addItem(GlobalDialog.editApplyConvoluteButton);
	}

	GlobalDialog.editHorizSizer3 = new SpacedHorizontalSizer();
	with (GlobalDialog.editHorizSizer3) {
		addItem(GlobalDialog.editApplyBinarizeButton);
	}

	GlobalDialog.editStarMaskGroupBox = new GroupBox(GlobalDialog);
	with (GlobalDialog.editStarMaskGroupBox) {
		title = "Edit Star Mask";
		sizer = new SpacedVerticalSizer;
		bindings = function () {
			this.enabled = CurrentProcessingInfo.starMaskId != null;
		}
		sizer.addItem(GlobalDialog.editUndoButton);
		sizer.addItem(GlobalDialog.spacerLabel);
		sizer.addItem(GlobalDialog.editHorizSizer1);
		sizer.addItem(GlobalDialog.editHorizSizer2);
		sizer.addItem(GlobalDialog.editHorizSizer3);
	}

	// #endregion "EditButtons"


	GlobalDialog.backgroundImageLabel = new Label(GlobalDialog);
	with (GlobalDialog.backgroundImageLabel) {
		text = "Background Mask";
	}

	GlobalDialog.backgroundImageSizer = new SpacedHorizontalSizer();
	with (GlobalDialog.backgroundImageSizer) {
		addItem(GlobalDialog.backgroundImageLabel);
		addItem(GlobalDialog.backgroundProtectionSelector);
	}

	GlobalDialog.backgroundBlendingSlider = new NumericControl(GlobalDialog);
	with(GlobalDialog.backgroundBlendingSlider) {
		setRange(0.1, 1);
		slider.setRange(1,100);
		setPrecision(2);
		label.text = "Blending Strength"
		bindings = function() {
			setValue(CurrentProcessingInfo.backgroundBlending);
		}
		onValueUpdated = function(value) {
			CurrentProcessingInfo.backgroundBlending = value;
		}
	}

	GlobalDialog.backgroundMaskCreateButton = new PushButton(GlobalDialog);
	with(GlobalDialog.backgroundMaskCreateButton) {
		text = "Create Background Mask";
		icon = GlobalDialog.scaledResource(":/browser/launch.png");
		toolTip = "Creates a Background Mask using the Median of the image";
		bindings = function() {
			this.enabled = CurrentProcessingInfo.backgroundMaskId == null && CurrentProcessingInfo.backgroundReplacement;
		}
		onClick = function() {
			CurrentProcessingInfo.backgroundMaskId = createBackgroundMask(View.viewById(CurrentProcessingInfo.mainViewId), "_ez_Decon_" + CurrentProcessingInfo.mainViewId + "_bg");
		}
	}

	GlobalDialog.backgroundGroupBox = new GroupBox(GlobalDialog);
	with(GlobalDialog.backgroundGroupBox) {
		titleCheckBox = true;
		title = "Background Protection"
		bindings = function() { 
			this.checked = CurrentProcessingInfo.backgroundReplacement;
		}
		onCheck = function(value) {
			CurrentProcessingInfo.backgroundReplacement = value;
		}
		sizer = new SpacedVerticalSizer(GlobalDialog.backgroundGroupBox);
		sizer.addItem(GlobalDialog.backgroundImageSizer);
		sizer.addItem(GlobalDialog.backgroundMaskCreateButton);
		sizer.addItem(GlobalDialog.backgroundBlendingSlider);
	}

	GlobalDialog.masksTabControl = new Control(GlobalDialog);
	with (GlobalDialog.masksTabControl) {
		sizer = new SpacedVerticalSizer(GlobalDialog.masksTabControl);
		sizer.addItem(GlobalDialog.starMaskImageSizer);
		sizer.addItem(GlobalDialog.createRawStarMaskButton);
		sizer.addItem(GlobalDialog.createProcessedStarMaskButton);
		sizer.addItem(GlobalDialog.downsampleStarNetCheckBox);
		sizer.addItem(GlobalDialog.useStarNet2);
		sizer.addItem(GlobalDialog.editStarMaskGroupBox);
		sizer.addItem(GlobalDialog.backgroundGroupBox);
		sizer.addStretch();
	}

	// #region "PSFImageControl"

	GlobalDialog.psfImageSelector = new ViewList(GlobalDialog);
	with (GlobalDialog.psfImageSelector) {
		toolTip = "Select PSF";
		bindings = function() {
			if(CurrentProcessingInfo.psfViewId != null
				&& CurrentProcessingInfo.psfViewId != this.currentView.id) {
				getMainViews();
				this.currentView = View.viewById(CurrentProcessingInfo.psfViewId);
				this.onViewSelected(this.currentView);
			}
		}
		onViewSelected = function (value) {
			if (value.isNull) {
				CurrentProcessingInfo.psfViewId = null;
				let oldStarMask = GlobalDialog.findControlInTabBox("PSF");
				if (oldStarMask != null) {
					oldStarMask.dispose();
					GlobalDialog.tabBox.removePage(GlobalDialog.findControlIndexInTabBox(oldStarMask));
				}
				return;
			}
			if (value.image.isColor) {
				GlobalDialog.showWarningDialog("Cannot use RGB PSF.");
				GlobalDialog.starMaskImageSelector.remove(value);
			} else {
				CurrentProcessingInfo.psfViewId = value.isPreview ? value.fullId : value.id;
				ConsoleWriter.writeMessageBlock("Selected PSF '" + CurrentProcessingInfo.psfViewId + "'", true, true);
				GlobalDialog.addPSFControl();
				GlobalDialog.tabBox.currentPageIndex = GlobalDialog.findControlIndexInTabBox(GlobalDialog.findControlInTabBox("PSF"));
			}
		}
		excludeIdentifiersPattern = "_ez_temp_*";
		getMainViews();
	}

	GlobalDialog.onEvaluate = function () {
		// take original image
		let orgControl = GlobalDialog.tabBox.pageControlByIndex(0);
		let orgWindow = orgControl.previewFrameWindow;

		// clone it
		let clone = cloneView(orgWindow.mainView, "_ez_temp_DeconRun", true);

		// run decon
		let ranClone = execute(clone.window, false);
		clone.window.forceClose();
		clone = ranClone;

		// assign it to control
		let previewControl = new PreviewControl(GlobalDialog, true, true);

		previewControl.swap = function () {
			GlobalDialog.tabBox.currentPageIndex = 0;
		}

		previewControl.STF = GlobalDialog.tabBox.pageControlByIndex(0).STF;
		previewControl.SetView(clone, true);
		clone.window.forceClose();

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
			for (let i = 0; i < GlobalDialog.tabBox.numberOfPages; i++) {
				if (GlobalDialog.tabBox.pageControlByIndex(i) === previewControl) {
					index = i;
					break;
				}
			}
			GlobalDialog.tabBox.removePage(index);
		}
		previewControl.infoFrame.sizer.insertItem(1, closeButton);

		GlobalDialog.tabBox.addPage(previewControl, "Decon Run " + (++CurrentProcessingInfo.currentDeconRun));
		previewControl.SetProcessingInfo(CurrentProcessingInfo, "Decon Run " + (CurrentProcessingInfo.currentDeconRun));

		GlobalDialog.tabBox.currentPageIndex = GlobalDialog.tabBox.numberOfPages - 1;
	}

	GlobalDialog.psfImageLabel = new Label(GlobalDialog);
	with (GlobalDialog.psfImageLabel) {
		text = "PSF Image";
	}

	GlobalDialog.psfImageSizer = new SpacedHorizontalSizer();
	with (GlobalDialog.psfImageSizer) {
		addItem(GlobalDialog.psfImageLabel);
		addItem(GlobalDialog.psfImageSelector);
	}

	GlobalDialog.generatePsfButton = new PushButton(GlobalDialog);
	with (GlobalDialog.generatePsfButton) {
		toolTip = "Generates a PSF for this image";
		text = "Generate PSF";
		icon = GlobalDialog.scaledResource(":/browser/launch.png");
		bindings = function () {
			this.enabled = CurrentProcessingInfo.psfViewId == null;
		}
		onClick = function () {
			createPSF(CurrentProcessingInfo);
			GlobalDialog.psfImageSelector.currentView = View.viewById(CurrentProcessingInfo.psfViewId);
			if (CurrentProcessingInfo.psfViewId != null) {
				GlobalDialog.addPSFControl();
			}
		}
	}

	GlobalDialog.maxStarsForPsfNumericControl = new NumericControl(GlobalDialog);
	with (GlobalDialog.maxStarsForPsfNumericControl) {
		toolTip = "Maximum amount of stars for PSF generation";
		label.text = "Max PSF Stars";
		label.minWidth = 100;
		setRange(10, 100);
		slider.setRange(10, 100);
		slider.scaledMinWidth = 250;
		setPrecision(0);
		setValue(CurrentProcessingInfo.psfMaxStars);
		onValueUpdated = function (value) {
			CurrentProcessingInfo.psfMaxStars = value;
		}
	}

	GlobalDialog.starSensitivityNumericControl = new NumericControl(GlobalDialog);
	with (GlobalDialog.starSensitivityNumericControl) {
		toolTip = "Maximum amount of stars for PSF generation";
		label.text = "Sensitivity";
		label.minWidth = 100;
		setRange(0.01, 10);
		slider.setRange(1, 10000);
		slider.scaledMinWidth = 250;
		setPrecision(2);
		setValue(CurrentProcessingInfo.starSensitivity);
		onValueUpdated = function (value) {
			CurrentProcessingInfo.starSensitivity = value;
		}
	}

	GlobalDialog.psfOptionsGroupBox = new GroupBox(GlobalDialog);
	with (GlobalDialog.psfOptionsGroupBox) {
		title = "PSF Generation Options";
		sizer = new SpacedVerticalSizer;
		sizer.addItem(GlobalDialog.maxStarsForPsfNumericControl);
		sizer.addItem(GlobalDialog.starSensitivityNumericControl);
	}

	// #endregion "PSFImageControl"

	// #region "Wavelets"
	GlobalDialog.waveletNoiseStrSlider_1 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseStrSlider_1) {
		label.minWidth = 10;
		setRange(0.1, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletStr[0]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletStr[0] = value;
		}
	}

	GlobalDialog.waveletNoiseThrSlider_1 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseThrSlider_1) {
		label.text = "1:";
		//label.text = "1";
		label.minWidth = 10;
		setRange(0.1, 16);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletThr[0]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletThr[0] = value;
		}
	}

	GlobalDialog.waveletNoiseStrSlider_2 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseStrSlider_2) {
		label.minWidth = 10;
		setRange(0.1, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletStr[1]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletStr[1] = value;
		}
	}

	GlobalDialog.waveletNoiseThrSlider_2 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseThrSlider_2) {
		label.text = "2:";
		//label.text = "2";
		label.minWidth = 10;
		setRange(0.1, 16);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletThr[1]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletThr[1] = value;
		}
	}

	GlobalDialog.waveletNoiseStrSlider_3 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseStrSlider_3) {
		label.minWidth = 10;
		setRange(0.1, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletStr[2]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletStr[2] = value;
		}
	}

	GlobalDialog.waveletNoiseThrSlider_3 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseThrSlider_3) {
		label.text = "3:";
		//label.text = "3";
		label.minWidth = 10;
		setRange(0.1, 16);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletThr[2]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletThr[2] = value;
		}
	}

	GlobalDialog.waveletNoiseStrSlider_4 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseStrSlider_4) {
		label.minWidth = 10;
		setRange(0.1, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletStr[3]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletStr[3] = value;
		}
	}

	GlobalDialog.waveletNoiseThrSlider_4 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseThrSlider_4) {
		label.text = "4:";
		//label.text = "4";
		label.minWidth = 10;
		setRange(0.1, 16);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletThr[3]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletThr[3] = value;
		}
	}

	GlobalDialog.waveletNoiseStrSlider_5 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseStrSlider_5) {
		label.minWidth = 10;
		setRange(0.1, 1);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletStr[4]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletStr[4] = value;
		}
	}

	GlobalDialog.waveletNoiseThrSlider_5 = new NumericControl(GlobalDialog);
	with (GlobalDialog.waveletNoiseThrSlider_5) {
		//label.text = "5";
		label.text = "5:";
		label.minWidth = 10;
		setRange(0.1, 16);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(2);
		bindings = function () {
			this.setValue(CurrentProcessingInfo.waveletThr[4]);
		}
		onValueUpdated = function (value) {
			CurrentProcessingInfo.waveletThr[4] = value;
		}
	}

	GlobalDialog.wavelet1Sizer = new SpacedHorizontalSizer();
	with (GlobalDialog.wavelet1Sizer) {
		addItem(GlobalDialog.waveletNoiseThrSlider_1);
		addItem(GlobalDialog.waveletNoiseStrSlider_1);
	}

	GlobalDialog.wavelet2Sizer = new SpacedHorizontalSizer();
	with (GlobalDialog.wavelet2Sizer) {
		addItem(GlobalDialog.waveletNoiseThrSlider_2);
		addItem(GlobalDialog.waveletNoiseStrSlider_2);
	}

	GlobalDialog.wavelet3Sizer = new SpacedHorizontalSizer();
	with (GlobalDialog.wavelet3Sizer) {
		addItem(GlobalDialog.waveletNoiseThrSlider_3);
		addItem(GlobalDialog.waveletNoiseStrSlider_3);
	}

	GlobalDialog.wavelet4Sizer = new SpacedHorizontalSizer();
	with (GlobalDialog.wavelet4Sizer) {
		addItem(GlobalDialog.waveletNoiseThrSlider_4);
		addItem(GlobalDialog.waveletNoiseStrSlider_4);
	}

	GlobalDialog.wavelet5Sizer = new SpacedHorizontalSizer();
	with (GlobalDialog.wavelet5Sizer) {
		addItem(GlobalDialog.waveletNoiseThrSlider_5);
		addItem(GlobalDialog.waveletNoiseStrSlider_5);
	}

	GlobalDialog.waveletLabel = new Label();
	with (GlobalDialog.waveletLabel) {
		text = "Noise Threshold";
	}

	GlobalDialog.waveletReductionLabel = new Label();
	GlobalDialog.waveletReductionLabel.text = "Noise Reduction";

	GlobalDialog.waveletLabelSizer = new SpacedHorizontalSizer();
	with (GlobalDialog.waveletLabelSizer) {
		addItem(GlobalDialog.waveletLabel);
		addItem(GlobalDialog.waveletReductionLabel);
	}

	GlobalDialog.resetButton = new PushButton(GlobalDialog);
	with (GlobalDialog.resetButton) {
		text = "Reset Wavelet Settings";
		toolTip = "Reset Wavelets to default settings";
		icon = GlobalDialog.scaledResource(":/icons/debug-restart.png");
		onClick = function () {
			CurrentProcessingInfo.waveletThr[0] = 10;
			CurrentProcessingInfo.waveletThr[1] = 8;
			CurrentProcessingInfo.waveletThr[2] = 6;
			CurrentProcessingInfo.waveletThr[3] = 4;
			CurrentProcessingInfo.waveletThr[4] = 2;
			CurrentProcessingInfo.waveletStr[0] = 1;
			CurrentProcessingInfo.waveletStr[1] = 0.9;
			CurrentProcessingInfo.waveletStr[2] = 0.8;
			CurrentProcessingInfo.waveletStr[3] = 0.7;
			CurrentProcessingInfo.waveletStr[4] = 0.7;
		}
	}

	GlobalDialog.waveletGroupBox = new GroupBox(GlobalDialog);
	with (GlobalDialog.waveletGroupBox) {
		title = "Wavelets";
		sizer = new SpacedVerticalSizer();
		sizer.addItem(GlobalDialog.waveletLabelSizer);
		sizer.addItem(GlobalDialog.wavelet1Sizer);
		sizer.addItem(GlobalDialog.wavelet2Sizer);
		sizer.addItem(GlobalDialog.wavelet3Sizer);
		sizer.addItem(GlobalDialog.wavelet4Sizer);
		sizer.addItem(GlobalDialog.wavelet5Sizer);
		sizer.addItem(GlobalDialog.resetButton);
	}

	// #endregion "Wavelets"

	GlobalDialog.deconIterationsSlider = new NumericControl(GlobalDialog);
	with (GlobalDialog.deconIterationsSlider) {
		label.text = "Decon iterations";
		label.minWidth = 160;
		setRange(1, 150);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(0);
		setValue(CurrentProcessingInfo.deconIterations);
		onValueUpdated = function (value) {
			CurrentProcessingInfo.deconIterations = value;
		}
	}

	GlobalDialog.pixelMathIterationsSlider = new NumericControl(GlobalDialog);
	with (GlobalDialog.pixelMathIterationsSlider) {
		label.text = "PixelMath iterations";
		label.minWidth = 160;
		setRange(1, 20);
		slider.setRange(0, 100);
		slider.scaledMinWidth = 50;
		setPrecision(0);
		setValue(CurrentProcessingInfo.pixelMathIterations);
		onValueUpdated = function (value) {
			CurrentProcessingInfo.pixelMathIterations = value;
		}
	}

	GlobalDialog.applyDeconGroupBox = new GroupBox(GlobalDialog);
	with (GlobalDialog.applyDeconGroupBox) {
		title = "Apply";
		sizer = new SpacedVerticalSizer();
		sizer.addItem(GlobalDialog.deconIterationsSlider);
		sizer.addItem(GlobalDialog.pixelMathIterationsSlider);
	}

	GlobalDialog.deconvolutionControl = new Control(GlobalDialog);
	with (GlobalDialog.deconvolutionControl) {
		sizer = new SpacedVerticalSizer();
		sizer.addItem(GlobalDialog.psfImageSizer);
		sizer.addItem(GlobalDialog.generatePsfButton);
		sizer.addItem(GlobalDialog.psfOptionsGroupBox);
		sizer.addItem(GlobalDialog.waveletGroupBox);
		sizer.addItem(GlobalDialog.applyDeconGroupBox);
		sizer.addStretch();
	}

	GlobalDialog.replacementTabBox = new TabBox(GlobalDialog);
	with (GlobalDialog.replacementTabBox) {
		addPage(GlobalDialog.masksTabControl, "Masking");
		addPage(GlobalDialog.deconvolutionControl, "Deconvolution");
		bindings = function () {
			this.enabled = CurrentProcessingInfo.mainViewId != null;
		}
	}

	// GlobalDialog.replaceMainControl(GlobalDialog.replacementTabBox);

	GlobalDialog.controlSizer.insertItem(3, GlobalDialog.replacementTabBox);

	GlobalDialog.controlSizer.removeItem(GlobalDialog.mainControl);
	GlobalDialog.mainControl.hide();


	GlobalDialog.createProcessesButton = new PushButton(GlobalDialog);
	with (GlobalDialog.createProcessesButton) {
		text = "Create Processes only";
		toolTip = "Will create processes only";
		icon = GlobalDialog.scaledResource(":/icons/ok.png");
		bindings = function () {
			this.enabled = GlobalDialog.canRun();
		}
		onClick = function () {
			CurrentProcessingInfo.createProcesesOnly = true;
			GlobalDialog.ok();
		}
	}

	GlobalDialog.runAndCloseGroupBox.sizer.insertItem(0, GlobalDialog.createProcessesButton);
}

// #endregion "Dialog"

function DeconInfo() {
	this.mainViewId = null;
	this.workingViewId = null;
	this.originalViewId = null;
	this.starMaskId = null;
	this.backgroundMaskId = null;
	this.backgroundReplacement = null;
	this.backgroundBlending = null
	this.starSensitivity = null;
	this.downsampleStarnet = null;
	this.useStarNet2 = null;
	this.psfViewId = null;
	this.psfMaxStars = null;
	this.waveletStr = null;
	this.waveletThr = null;
	this.deconIterations = null;
	this.pixelMathIterations = null;
	this.createProcesesOnly = null;
	this.currentDeconRun = null;
}
DeconInfo.prototype = new ProcessingInfo;

function ellipsoidsImage(view, ellipsoids) {
	// pls. see:
	// https://math.stackexchange.com/questions/91132/how-to-get-the-limits-of-rotated-ellipse
	//
	var img = new Image(view.image.width, view.image.height);
	img.fill(0);

	for (let i = 0; i < ellipsoids.length; i++) {
		let e = ellipsoids[i];
		var c = Math.cos(e.pa);
		var s = Math.sin(e.pa);
		var c2 = c * c;
		var s2 = s * s;
		var a2 = e.a * e.a;
		var b2 = e.b * e.b;
		var mx = Math.sqrt(a2 * c2 + b2 * s2);
		var my = Math.sqrt(a2 * s2 + b2 * c2);
		//
		// R is the box around the ellipsoid, expanded by 2 pixel
		//
		var R = new Rect(Math.floor(e.x - mx - 1),
			Math.floor(e.y - my - 1),
			Math.ceil(e.x + mx + 1),
			Math.ceil(e.y + my + 1));
		//
		// intersect rectangle of ellipsoid with image frame
		//
		R = R.intersection(new Rect(0, 0, view.image.width, view.image.height));
		//
		// create the image and set pixel intensities
		//
		for (var y = R.y0; y < R.y1; y++) {
			for (var x = R.x0; x < R.x1; x++) {
				var K = Math.sqrt(Math.pow(((x - e.x) * c + (y - e.y) * s) / e.a, 2) +
					Math.pow(((x - e.x) * s - (y - e.y) * c) / e.b, 2));
				if (K < 1) img.setSample(1, x, y);
			}
		}
	}
	return img;
}

ellipsoid.prototype = new Object;

function ellipsoid(x, y, a, b, pa) {
	this.__base__ = Object;
	this.__base__();

	this.x = x;     // origin x
	this.y = y;     // origin y
	this.a = a;     // 1st axis radius
	this.b = b;     // 2nd axis radius
	this.pa = pa;    // position angle in radians

	this.sp = -1;     // index of selected point or axis {0 = center, 1 = a, 2 = b}
	this.sina = 0;
	this.cosa = 0;
	this.sinb = 0;
	this.cosb = 0;

	this.p11 = new Point(this.a, 0);    // axis 1
	this.p12 = new Point(-this.a, 0);
	this.p21 = new Point(0, this.b);    // axis 2
	this.p22 = new Point(0, -this.b);

	this.selected = true;

	this.timeStamp = Date.now();

	update(this);

	this.setSettings = function (settingsObj) {
		settings = settingsObj;
	}
	//
	// object methods
	//
	this.getStringObject = function () {
		return { figure: 'ellipse', data: { x: this.x, y: this.y, a: this.a, b: this.b, pa: this.pa } }
	}

	this.getPoint = function (index) {
		// index = 0, center
		// index = 1, p1 (axis1)
		// index = 2, p2 (axis1)
		// index = 3, p1 (axis2)
		// index = 4, p2 (axis2)
		switch (index) {
			case 0:
				return new Point(this.x, this.y);
			case 1:
				return new Point(this.x + this.p11.x, this.y + this.p11.y);
			case 2:
				return new Point(this.x + this.p12.x, this.y + this.p12.y);
			case 3:
				return new Point(this.x + this.p21.x, this.y + this.p21.y);
			case 4:
				return new Point(this.x + this.p22.x, this.y + this.p22.y);
		}
		return new Point();
	}

	this.getPoints = function () {
		return [new Point(this.x, this.y),
		new Point(this.x + this.p11.x, this.y + this.p11.y),
		new Point(this.x + this.p12.x, this.y + this.p12.y),
		new Point(this.x + this.p21.x, this.y + this.p21.y),
		new Point(this.x + this.p22.x, this.y + this.p22.y)];
	}


	this.movePoint = function (p) {
		if (this.sp < 0) return;
		if (this.sp == 0) {
			//
			// move center
			//
			this.x = p.x;
			this.y = p.y;
			return;
		}

		var u = p.x - this.x;
		var v = p.y - this.y;

		if (this.sp == 1) {
			//
			// move axis 1 point, calc pa
			//
			this.pa = positionAngle(u, v, 0, 0);
			this.a = Math.sqrt(u * u + v * v);
		}
		else if (this.sp == 2) {
			//
			// move axis 2 point, calc pa
			//
			var a = positionAngle(u, v, 0, 0);
			this.pa = a - Math.PI2;
			this.b = Math.sqrt(u * u + v * v);
		}
		update(this);
	}

	function update(obj) {
		obj.sina = Math.sin(obj.pa);
		obj.cosa = Math.cos(obj.pa);
		obj.sinb = Math.sin(obj.pa + Math.PI2);
		obj.cosb = Math.cos(obj.pa + Math.PI2);
		obj.p11 = new Point(obj.a * obj.cosa, obj.a * obj.sina);
		obj.p12 = new Point(-obj.p11.x, -obj.p11.y);
		obj.p21 = new Point(obj.b * obj.cosb, obj.b * obj.sinb);
		obj.p22 = new Point(-obj.p21.x, -obj.p21.y);
	}

	function positionAngle(x1, y1, x2, y2) {
		return Math.atan2(y1 - y2, x1 - x2);
	}

	this.findSelect = function (x, y) {
		//
		// check next point to x, y (input screen absolut coordinates)
		// and set point or axis
		//
		this.sp = -1;
		if (this.pointDist(x, y, this.x, this.y)) {
			//
			// center is absolute point
			//
			this.sp = 0;
			this.selected = true;
			return true;
		}

		var u = x - this.x;
		var v = y - this.y;

		if (this.pointDist(u, v, this.p11.x, this.p11.y))
			this.sp = 1;   // axis 1
		else if (this.pointDist(u, v, this.p12.x, this.p12.y))
			this.sp = 1;   // axis 1
		else if (this.pointDist(u, v, this.p21.x, this.p21.y))
			this.sp = 2;   // axis 1
		else if (this.pointDist(u, v, this.p22.x, this.p22.y))
			this.sp = 2;   // axis 1
		if (this.sp > -1) {
			this.selected = true;
			return true;
		}
		else
			return false;
	}

	this.pointDist = function (x1, y1, x2, y2) {
		// is p near x, y ?
		var dx2 = Math.pow(x1 - x2, 2);
		var dy2 = Math.pow(y1 - y2, 2);
		var d = Math.sqrt(dx2 + dy2);
		return d <= 16 + 16;
	}

	this.getRect = function () {
		return new Rect(-this.a, -this.b, this.a, this.b);
	}


	this.setX = function (x) {
		this.x = x;
		update(this);
	}

	this.setY = function (y) {
		this.y = y;
		update(this);
	}

	this.setA = function (a) {
		this.a = a;
		this.polygon = [];
		update(this);
	}

	this.setB = function (b) {
		this.b = b;
		this.polygon = [];
		update(this);
	}

	this.setPa = function (angleDegrees) {
		this.pa = angleDegrees * Math.RAD;
		this.polygon = [];
		update(this);
	}

	this.getPa = function () {
		return this.pa * Math.DEG;
	}

	this.draw = function (g) {
		var radius = 15 / 2;
		var lineColor;
		var lineStyle = PenStyle_Solid;
		var centerColor;
		if (this.selected) {
			lineColor = 0xff00ffff;
			centerColor = 0xffff0000;
		}
		else {
			lineColor = Transparent(0xff00ffff, 0.5);
			centerColor = Transparent(0xffff0000, 0.5);
		}
		g.pen = new Pen(lineColor, 0, lineStyle);

		var m = g.transformationMatrix;

		var points = this.getPoints();
		var rot = this.pa;
		if (rot > 0) rot -= Math.PI;

		g.translateTransformation(points[0]);
		g.rotateTransformation(-rot);
		g.drawEllipse(this.getRect());
		g.resetTransformation();
		g.transformationMatrix = m;
		g.drawLine(points[1], points[2]);
		g.drawLine(points[3], points[4]);

		for (var i = 1; i < points.length; i++) {
			g.drawCircle(points[i], radius);
		}
		//
		// center point
		//
		radius = 20 / 2;
		g.pen = new Pen(centerColor);

		g.drawCircle(new Point(this.x, this.y), radius);
	}
}

function toView(p, offset) {
	return new Point(p.x - offset.x, p.y - offset.y);
}

function toImage(p, offset) {
	return new Point(p.x + offset.x, p.y + offset.y);
}

function Transparent(color, transparency) {
	var r = Color.redF(color);
	var g = Color.greenF(color);
	var b = Color.blueF(color);
	var a = Color.alphaF(color);
	a *= transparency;
	var c = Color.rgbaColorF(r, g, b, a);
	return c;
}

main();
