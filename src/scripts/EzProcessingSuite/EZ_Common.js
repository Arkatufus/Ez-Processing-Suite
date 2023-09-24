// Copyright (C) 2020-2023 S Dimant (aka darkarchon#4313)
// File name: EZ_common.js

/*
	Acknowledgements
		 Andres del Pozo for his PreviewControl.js
*/

#include <pjsr/StarDetector.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/ColorSpace.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/SectionBar.jsh>
#include <pjsr/StdCursor.jsh>
#include <pjsr/PropertyType.jsh>
#include <pjsr/PropertyAttribute.jsh>
#include <pjsr/PenStyle.jsh>
#include <pjsr/Color.jsh>

//STF settings:
// Shadows clipping point in (normalized) MAD units from the median.
#define DEFAULT_AUTOSTRETCH_SCLIP -2.8
// Target mean background in the [0,1] range.
#define DEFAULT_AUTOSTRETCH_TGBND 0.25

#define CONSOLE_WIDTH 72
#define PADDING 4
#define DEFAULT_STF [[0.5,0,1,0,1],[0.5,0,1,0,1],[0.5,0,1,0,1],[0.5,0,1,0,1]]

#define StorePropertyAttribute (PropertyAttribute_Permanent | PropertyAttribute_Storable)

// #region Globals
var CommonVersion = "2.7";
var FullName = NAME + " v" + VERSION;
var WarningMessage = "WARNING: THE EZ PROCESSING SUITE IS STILL UNDER HEAVY DEVELOPMENT. PLEASE SAVE YOUR WORK BEFORE DOING ANYTHING IN THE \"" + FullName.toUpperCase() + "\" SCRIPT INCLUDING SELECTING AN IMAGE. PIXINSIGHT COULD CRASH AND YOU COULD LOSE ALL YOUR UNSAVED WORK.";
var ShowWarning = false;

var CurrentProcessingInfo = new ProcessingInfo();
var GlobalDialog = null;
var JobStack = new ProcessStack();
var ConsoleWriter = new ConsoleBlock();

SpacedVerticalSizer.prototype = new VerticalSizer;
SpacedHorizontalSizer.prototype = new HorizontalSizer;
SpacedRichLabel.prototype = new Label;

// -------------------------------------
// CLASS ProcessingInfo

function ProcessingInfo() {
	this.mainViewId = null;
	this.workingViewId = null;

	this.toString = function()
	{
		let result = "";
		for (let propName in this) {
			result += this.constructor.name + "." +propName + " = " + this[propName];
		}
		return result;
	}

	this.reset = function ()
	{
		for (let propName in this) {
			delete this[propName];
		}

		this.mainViewId = null;
		this.workingViewId = null;
	}
}
ProcessingInfo.prototype = new Object;

// -------------------------------------
// CLASS ConsoleBlock

function ConsoleBlock() {
	this.messageLevel = 0;
	
	this.writeMessage = function (text, useSeparatorBefore = true, useSeparatorAfter = true, level = 0, warning = false)
	{
		let textLine = this.levelPadLeft("║", level);
		let orgPadding = textLine.length;
		for (let i = 0; i < PADDING; i++) {
			textLine += " ";
		}
		let preamble = textLine.length;

		if (useSeparatorBefore) {
			if (!warning) {
				Console.noteln(this.getSeparator(level, true));
			} else {
				Console.warningln(this.getSeparator(level, true));
			}
		}

		if(text != null) {
			if (text.length + textLine.length + PADDING > CONSOLE_WIDTH) {
				let split = text.split(" ");
				let paddedLength = preamble + PADDING;
				for (let i = 0; i < split.length; i++) {
					if (paddedLength + split[i].length + PADDING > CONSOLE_WIDTH) {
						split[i] = split[i].substring(0, CONSOLE_WIDTH - (paddedLength + 4)) + "...";
					}
				}
				while (split.length > 0) {
					do {
						processEvents();
						if (split.length === 0) break;
						if (textLine.length + split[0].length + " ".length + PADDING > CONSOLE_WIDTH) {
							break;
						}

						textLine += split[0] + " ";
						paddedLength = textLine.length + PADDING;
						split.shift();
					} while (true);
					textLine = this.padTextRight(textLine);
					if (!warning) {
						Console.noteln(textLine);
					} else {
						Console.warningln(textLine);
					}
					textLine = this.levelPadLeft("║", level);
					for (let i = 0; i < preamble - orgPadding; i++) {
						textLine += " ";
					}
				}
			} else {
				if (!warning) {
					Console.noteln(this.padTextRight(textLine + text));
				} else {
					Console.warningln(this.padTextRight(textLine + text));
				}
			}
		}

		if (useSeparatorAfter) {
			if (!warning) {
				Console.noteln(this.getSeparator(level, false));
			} else {
				Console.warningln(this.getSeparator(level, false));
			}
		}
	}

	this.getSeparator = function (level, top) {
		let leftChar = "╔";
		if (!top) leftChar = "╚";
		let rightChar = "╗";
		if (!top) rightChar = "╝";
		let separator = this.levelPadLeft(leftChar, level)
		for (let i = separator.length; i < CONSOLE_WIDTH - 1; i++) {
			separator += "═";
		}
		separator += rightChar;
		return separator;
	}

	this.levelPadLeft = function (text, level) {
		let padText = "";
		for (let i = 0; i < level * PADDING; i++) {
			if (i % PADDING === 0) padText += "║";
			else padText += " ";
		}

		return padText + text;
	}

	this.padTextRight = function (text) {
		while (text.length < CONSOLE_WIDTH - 1) {
			text += " ";
		}
		text += "║";
		return text;
	}

	this.writeMessageBlock = function (text, useBorders = true, decreaseLevel = false) {
		if (decreaseLevel) this.messageLevel--;
		this.writeMessage(text, useBorders, useBorders, this.messageLevel);
		if (decreaseLevel) this.messageLevel++;
	}

	this.writeWarningBlock = function (text, useBorders, decreaseLevel = false) {
		if (decreaseLevel) this.messageLevel--;
		this.writeMessage(text, useBorders, useBorders, this.messageLevel, true);
		if (decreaseLevel) this.messageLevel++;
	}

	this.writeMessageStart = function (text) {
		this.writeMessage(text, true, false, this.messageLevel);
		this.messageLevel++;
	}

	this.writeMessageEnd = function (text) {
		this.messageLevel--;
		this.messageLevel < 0 ? this.messageLevel = 0 : this.messageLevel;
		this.writeMessage(text, false, true, this.messageLevel);
	}
}
ConsoleBlock.prototype = new Object;

// -------------------------------------
// CLASS JobProcessor

function ProcessStack()
{
	this._stack = [];

	this.startProcessing = function () {
		this._stack.push(true);
		GlobalDialog.recalculateAll();
	}

	this.stopProcessing = function () {
		this._stack.pop();
	}

	this.isProcessing = function () {
		return this._stack.length !== 0;
	}
}

// #region Utility

Object.prototype.printPropertiesDebug = function() {
	for (let propName in this) {
		Console.writeln(this.constructor.name + "." +propName + " = " + this[propName]);
	}
}

Array.prototype.removeItem = function(item) {
	let idx = this.indexOf(item);
	if(idx > -1) {
		this.splice(idx, 1);
	}
}

String.prototype.format = function () {
	let a = this;
	for (let k in arguments) {
		a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
	}
	return a
}

function getStarNet(useStarNet2 = true) {
	try {
		return useStarNet2 ? new StarNet2 : new StarNet;
	} catch (e) {
		return null;
	}
}

function readFromSettingsOrDefault(key, type, defaultVal) {
	let value = Settings.read(key, type);
	return Settings.lastReadOK ? value : defaultVal;
}

function readImage(filePath, ignoreKeywords = false) {
	JobStack.startProcessing();
	let ext = File.extractExtension(filePath);
	let fileFormat = new FileFormat(ext, true/*toRead*/, false/*toWrite*/);

	let fileFormatInstance = new FileFormatInstance(fileFormat);

	let image = null;
	try {
		image = fileFormatInstance.open(filePath, "fits-keywords normalize raw cfa");
	} catch(e) {
		ConsoleWriter.writeWarningBlock("Could not read file");
		JobStack.stopProcessing();
		return null;
	}

	let fileName = sanitizeViewId(File.extractName(filePath));
	if (!View.viewById(fileName).isNull) {
		fileName += "1";
	}

	let window = new ImageWindow(1, 1, 1,/*numberOfChannels*/ 32,/*bitsPerSample*/
		true/*floatSample*/, false, fileName);

	let view = window.mainView;
	view.beginProcess(UndoFlag_NoSwapFile);

	if (!fileFormatInstance.readImage(view.image)) {
		JobStack.stopProcessing();
		view.endProcess();
		throw new Error("Unable to read file: " + filePath);
	}

	if (fileFormat.canStoreImageProperties && !ignoreKeywords)
		if (fileFormat.supportsViewProperties) {
			let info = view.importProperties(fileFormatInstance);
			if (info.isEmpty)
				Console.criticalln("<end><cbr>*** Error reading image properties:\n", info);
		}

	if (fileFormat.canStoreKeywords && !ignoreKeywords)
		window.keywords = fileFormatInstance.keywords;

	view.endProcess();

	fileFormatInstance.close();

	JobStack.stopProcessing();
	return window;
}

function sanitizeViewId(id) {
	let fId = "";
	if (id.length === 0) {
		return "_";
	}
	let c = id.charAt(0);
	if ("0" <= c && c <= "9") {
		fId = fId + "_";
	}
	for (let i = 0; i !== id.length; ++i) {
		c = id.charAt(i);
		fId = fId + (
			(("0" <= c && c <= "9") || ("a" <= c && c <= "z") || ("A" <= c && c <= "Z")) ? c : "_"
		);
		if (fId.length > 3 && fId.substring(fId.length - 4, fId.length) === "____") {
			fId = fId.substring(0, fId.length - 1);
		}
	}
	return fId;
}

function printProperties(view) {
	ConsoleWriter.writeMessageStart("Properties of " + view.id);
	for (let i = 0; i < view.properties.length; i++) {
		ConsoleWriter.writeMessageBlock(view.properties[i] + " = " + view.propertyValue(view.properties[i]), false, true);
	}
	ConsoleWriter.writeMessageEnd()
}

// #endregion Utilities

// #region Image Modification
function cloneProperties(oldView, newView, func = null) {
	#ifdef DEBUG
	Console.warningln("Cloning properties from " + oldView.id + " to " + newView.id);
	#endif

	let oldProperties = [];
	for (let i = 0; i < oldView.properties.length; i++) {
		oldProperties.push([oldView.properties[i], oldView.propertyValue(oldView.properties[i]), oldView.propertyAttributes((oldView.properties[i]))]);
	}
	let oldKeywords = oldView.keywords;

	if (func != null) func();

	for (let i = 0; i < oldProperties.length; i++) {
		try {
			newView.setPropertyValue(oldProperties[i][0], oldProperties[i][1]);
			newView.setPropertyAttributes(oldProperties[i][0], oldProperties[i][2]);
			#ifdef DEBUG
			Console.warningln("prop " + oldProperties[i][0] + ":" + oldProperties[i][1]);
			#endif
		} catch (e) { /* probably some reserved property */ }
	}

	newView.beginProcess(UndoFlag_NoSwapFile);
	newView.keywords = oldKeywords;
	newView.endProcess();
}

View.prototype.storeProperty = function(property, value) {
	this.setPropertyValue(property, value, PropertyType_Auto, StorePropertyAttribute);
}

function convertFromViewStf(stf) {
	let newStf = [];
	for (let i = 0; i < stf.length; i++) {
		newStf.push([stf[i][1], stf[i][2], stf[i][0], stf[i][3], stf[i][4]]);
	}
	return newStf;
}

function convertToViewStf(stf) {
	let newStf = [];
	for (let i = 0; i < stf.length; i++) {
		newStf.push([stf[i][2], stf[i][0], stf[i][1], stf[i][3], stf[i][4]]);
	}
	return newStf;
}

function doSTF(view, stf = null, unlinked = false) {
	let transformation = [
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1]];

	if (stf == null) {
		//get values from the image to calculate STF
		let median = view.computeOrFetchProperty("Median");
		let mad = view.computeOrFetchProperty("MAD");

		//set variables
		let targetBackground = DEFAULT_AUTOSTRETCH_TGBND;
		let shadowsClipping = DEFAULT_AUTOSTRETCH_SCLIP;

		if ((!unlinked && !view.image.isGrayscale) || view.image.isGrayscale) {
			// calculate STF settings based on DeLinear Script
			let clipping = (1 + mad.at(0) !== 1) ?
				Math.range(median.at(0) + shadowsClipping * mad.at(0), 0.0, 1.0) : 0.0;
			let targetMedian = Math.mtf(targetBackground, median.at(0) - clipping);

			transformation[0] = [clipping, 1, targetMedian, 0, 1];
			if(!view.image.isGrayscale) {
				transformation[1] = [clipping, 1, targetMedian, 0, 1];
				transformation[2] = [clipping, 1, targetMedian, 0, 1];
			}
		} else {
			for (let i = 0; i < 3; i++) {
				// calculate STF settings based on DeLinear Script
				let clipping = (1 + mad.at(i) !== 1) ?
					Math.range(median.at(i) + shadowsClipping * mad.at(i), 0.0, 1.0) : 0.0;
				let targetMedian = Math.mtf(targetBackground, median.at(i) - clipping);

				transformation[i] = [clipping, 1, targetMedian, 0, 1];
			}
		}
	} else {
		transformation = stf;
	}

	let STFunction = new ScreenTransferFunction();
	STFunction.STF = transformation;

	STFunction.executeOn(view);

	return transformation;
}

// applies ht transformation on current image
function doHistogramTransformation(view) {
	let HT = new HistogramTransformation;

	if (view.image.isGrayscale) {
		//get values from STF
		let clipping = view.stf[0][1];
		let median = view.stf[0][0];
		HT.H = [[0, 0.5, 1.0, 0, 1.0],
		[0, 0.5, 1.0, 0, 1.0],
		[0, 0.5, 1.0, 0, 1.0],
		[clipping, median, 1.0, 0, 1.0],
		[0, 0.5, 1.0, 0, 1.0]];
	} else {
		HT.H = [[view.stf[0][1], view.stf[0][0], 1.0, 0, 1.0],
		[view.stf[1][1], view.stf[1][0], 1.0, 0, 1.0],
		[view.stf[2][1], view.stf[2][0], 1.0, 0, 1.0],
		[0, 0.5, 1.0, 0, 1.0],
		[0, 0.5, 1.0, 0, 1.0]];
	}

	view.beginProcess();
	HT.executeOn(view.image);
	view.endProcess();
}

function doResetSTF(view) {
	let transformation = [
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1],
		[0, 1, 0.5, 0, 1]];

	let STFunction = new ScreenTransferFunction();
	STFunction.STF = transformation;

	STFunction.executeOn(view);

	return transformation;
}

// stretches view to target value
function stretchToValue(view, target) {
	let AH = new AutoHistogram;
	AH.clip = false;
	AH.stretch = true;
	AH.stretchTogether = true;
	AH.stretchMethod = AutoHistogram.prototype.MTF;
	AH.targetMedianR = target;
	AH.targetMedianG = target;
	AH.targetMedianB = target;

	AH.executeOn(view);
}

//uses NoiseEvaluation script to get an estimation of the background noise. Returns stdev
function noiseEvaluation(window) {

	let img = window.mainView.image;

	let a, n = 4, m = 0.01 * img.selectedRect.area;

	for (; ;) {
		a = img.noiseMRS(n);
		if (a[1] >= m)
			break;
		if (--n === 1) {
			Console.writeln("Issue with MRS noise evaluation (did not converge). Using k-sigma noise evaluation. Try using manually selected preview for noise estimation.");
			break;
		}
	}

	return a[0];
}

function EZ_ScaledNoiseEvaluation(image)
{
   let scale = image.Sn();
   if ( 1 + scale === 1 )
      throw Error( "Zero or insignificant data." );

   let a, n = 4, m = 0.01*image.selectedRect.area;
   for ( ;; )
   {
      a = image.noiseMRS( n );
      if ( a[1] >= m )
         break;
      if ( --n === 1 )
      {
         Console.writeln( "<end><cbr>** Warning: No convergence in MRS noise evaluation routine - using k-sigma noise estimate." );
         a = image.noiseKSigma();
         break;
      }
   }
   this.sigma = a[0]/scale; // estimated scaled stddev of Gaussian noise
   this.count = a[1]; // number of pixels in the noisy pixels set
   this.layers = n;   // number of layers used for noise evaluation
}

// copies an existing view to a new name
function cloneView(view, newName, hide = false, convertToColor = false) {
	let newWindow = new ImageWindow(view.image.width, view.image.height, convertToColor ? 3 : view.image.numberOfChannels,
		view.window.bitsPerSample, view.window.isFloatSample, view.image.colorSpace !== ColorSpace_Gray || convertToColor,
		newName);

	newWindow.mainView.beginProcess(UndoFlag_NoSwapFile);

	newWindow.mainView.image.assign(view.image);
	if(convertToColor && view.image.colorSpace === 0)
	{
		newWindow.mainView.image.colorSpace = 1;
	}
	newWindow.mainView.endProcess();
	// clone keywords and properties
	cloneProperties(view, newWindow.mainView);

	newWindow.mainView.stf = view.stf;

	if (!hide) {
		newWindow.show();
	}

	return newWindow.mainView;
}

function extractLightness(view) {
	let clonedView = null;

	if (view.image.isColor) {
		ConsoleWriter.writeMessageBlock("Original image is color, extracting luminance");
		let lumExtraction = new ChannelExtraction;
		lumExtraction.colorSpace = ChannelExtraction.prototype.CIELab;
		lumExtraction.channels = [
			[true, ""],
			[false, ""],
			[false, ""]
		];
		lumExtraction.sampleFormat = ChannelExtraction.prototype.SameAsSource;
		lumExtraction.executeOn(view);
		clonedView = ImageWindow.activeWindow.currentView;
		clonedView.id = "_ez_lightness_temp";
	} else {
		clonedView = cloneView(view, "_ez_lightness_temp");
	}

	return clonedView;
}

function createBackgroundMask(view, maskName, stretch = true) {
	JobStack.startProcessing();
	ConsoleWriter.writeMessageStart("Creating background mask based on " + view.id);
	let lightnessClone = extractLightness(view);
	if(stretch)
		doStretch(lightnessClone);
	let backgroundMaskView = doBackgroundRangeSelection(lightnessClone);
	lightnessClone.window.forceClose();
	backgroundMaskView.id = maskName;
	backgroundMaskView.window.iconize();
	ConsoleWriter.writeMessageEnd("Mask creation done");
	JobStack.stopProcessing();
	return backgroundMaskView.id;
}

function doBackgroundRangeSelection(view) {
	let median = view.computeOrFetchProperty("Median").at(0);
	let rangeSelection = new RangeSelection();
	rangeSelection.fuzziness = 0.1;
	rangeSelection.smoothness = 5;
	rangeSelection.highRange = median;
	rangeSelection.executeOn(view);
	return ImageWindow.activeWindow.mainView;
}

View.prototype.readPropertyOrKeyword = function(property, keyword) {
	let value = this.propertyValue(property);
	if(value != null) return value;
	try {
		let keywords = this.window.keywords;
		for(let i = 0;i<keywords.length;i++) {
			let fitskeyword = new FITSKeyword(keywords[i]);
			if(fitskeyword.name === keyword) {
				return fitskeyword.strippedValue;
			}
		}
	} catch(e) {
	}

	return null;
}

function doStretch(view) {
	ConsoleWriter.writeMessageBlock("Stretching image");
	doSTF(view);
	doHistogramTransformation(view);
}

function doPixelMath(view, expression, useSingleExpression = true) {
    cloneProperties(view, view, function () {
        let pixelMath = new PixelMath;
        if (useSingleExpression) {
            pixelMath.expression = expression;
            pixelMath.expression1 = "";
            pixelMath.expression2 = "";
            pixelMath.expression3 = "";
            pixelMath.useSingleExpression = true;
        } else {
            pixelMath.expression = expression;
            pixelMath.expression1 = expression;
            pixelMath.expression2 = expression;
            pixelMath.expression3 = "";
            pixelMath.useSingleExpression = false;
        }
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

        pixelMath.executeOn(view);
    });
}

// #endregion Image Modification

// #region Histogram Stuff

function detectPeaks(arr, windowWidth, threshold) {
	const peaks = [];
	let prev = 0;
	for (let i = 0; i < arr.length; i++) {
		const start = Math.max(0, i - windowWidth);
		const end = Math.min(arr.length, i + windowWidth);
		let deltaAcc = 0;
		for (let a = start; a < end; a++) {
			let cur = arr[a];
			deltaAcc += Math.abs(prev - cur);
			prev = cur;
		}
		if (deltaAcc > threshold) {
			peaks.push([i, deltaAcc]);
		}
		i += end - start - 1;
	}
	return peaks;
}

function findMidtonesBalance(v0, v1, eps) {
	if (!eps)
		eps = 1.0e-5;
	else
		eps = Math.max(1.0e-10, eps);

	let m0, m1;
	if (v1 < v0) {
		m0 = 0;
		m1 = 0.5;
	}
	else {
		m0 = 0.5;
		m1 = 1;
	}

	for (; ;) {
		let m = 0.5 * (m0 + m1);
		let v = Math.mtf(m, v1);

		processEvents();

		if (Math.abs(v - v0) < eps)
			return m;

		if (v < v0)
			m1 = m;
		else
			m0 = m;
	}
}

function generateNoiseEvalImage(noiseEvalValues) {
	let vals = [];
	let noiseEvalValuesString = null;
	if(noiseEvalValues != null) {
		noiseEvalValuesString = noiseEvalValues.toString();
	}
	if(noiseEvalValuesString != null && noiseEvalValuesString.indexOf(";") >= 0) {
		vals = noiseEvalValuesString.split(";");
	}
	let xScale = 400;
	let yScale = 400;


	let bitmap = new Bitmap(xScale, yScale);
	let graphics = new VectorGraphics(bitmap);

	// do some drawing magic
	graphics.antialiasing = true;
	graphics.fillRect(0, 0, xScale, yScale, new Brush(0xFF202020));

	if(noiseEvalValuesString == null || vals.length === 0) {
		graphics.end();
		return bitmap;
	}

	ConsoleWriter.writeMessageBlock("Generating Noise Evaluation Image");

	// find minVal
	let minVal = vals[0];
	for(let i = 0;i<vals.length;i++) {
		if(vals[i] < minVal) {
			minVal = vals[i];
		}
	}

	// find maxVAl
	let maxVal = vals[0];
	for(let i = 0;i<vals.length;i++) {
		if(vals[i] > maxVal) {
			maxVal = vals[i];
		}
	}

	let radius = 2.5;
	let xValScale = ((xScale-radius*2)/(vals.length-1));

	const px = 0xFFAAAAAA;
	let points = [];
	for(let i = 0;i<vals.length;i++) {
		let val = vals[i];
		let yPos = (yScale-radius*2)*((val-minVal)/(maxVal-minVal));
		let point = new Point(i*xValScale+radius, yScale-radius-yPos);
		points.push(point);
	}

	for(let i = 0;i<points.length;i++) {
		let nextPoint = i+1 > points.length ? null : points[i+1];
		graphics.fillCircle(points[i], radius, new Brush(px));
		if(nextPoint != null) {
			graphics.pen = new Pen(px);
			graphics.drawLine(points[i], nextPoint);
		}
	}

	graphics.end();

	processEvents();

	return bitmap;
}

function generateHistogramImage(view) {
	let xScale = 450;
	let yScale = 250;

	ConsoleWriter.writeMessageBlock("Generating Histogram Image");

	let histogramMatrix = view.computeOrFetchProperty("Histogram16");
	let htStep = parseInt(histogramMatrix.cols / xScale);
	let htMax = 0;

	let matrixarray = histogramMatrix.toArray();
	let rgb = [];
	if (histogramMatrix.rows === 1) {
		rgb.push(matrixarray);
	}
	else {
		rgb.push(matrixarray.slice(0, 65536));
		rgb.push(matrixarray.slice(65537, 65536 * 2));
		rgb.push(matrixarray.slice(65536 * 2 + 1, 65536 * 3));
	}

	let peaks = [];
	for (let rgbc = 0; rgbc < histogramMatrix.rows; rgbc++) {
		peaks = detectPeaks(rgb[rgbc], 10000, 50000);
		processEvents();
		let selectedPeak = 0;
		let selectedPeakVal = 0;
		for (let i = 0; i < peaks.length; i++) {
			let value = peaks[i][1];
			if (value > selectedPeakVal) {
				selectedPeakVal = value;
				selectedPeak = peaks[i][0];
			}
		}

		for (let i = selectedPeak; i < rgb[rgbc].length; i++) {
			let value = rgb[rgbc][i];
			if (value > htMax) {
				htMax = value;
			}
		}
	}
	let scaleMult = (yScale / htMax);

	let newChannelMatrix = [];

	let summedValue = [];
	for (let rgbc = 0; rgbc < histogramMatrix.rows; rgbc++) {
		newChannelMatrix.push([]);
		for (let i = 0; i < histogramMatrix.cols; i++) {
			summedValue.push(histogramMatrix.at(rgbc, i));
			if (i % htStep === 0) {
				newChannelMatrix[rgbc].push(Math.maxElem(summedValue) * scaleMult);
				summedValue = [];
			}
		}
	}

	let bitmap = new Bitmap(xScale, yScale);
	let graphics = new VectorGraphics(bitmap);
	graphics.antialiasing = true;
	graphics.fillRect(0, 0, xScale, yScale, new Brush(0xFF202020));
	graphics.fillRect(0, 0, 1, yScale, new Brush(0x33FFFFFF));
	graphics.fillRect(xScale, 0, xScale - 1, yScale, new Brush(0x33FFFFFF));
	graphics.fillRect(0, 0, xScale, 1, new Brush(0x33FFFFFF));
	graphics.fillRect(0, yScale, xScale, yScale - 1, new Brush(0x33FFFFFF));
	for (let i = 1; i < 4; i++) {
		graphics.fillRect(parseInt((xScale * 0.25)) * i, 0, parseInt((xScale * 0.25)) * i, yScale, new Brush(0x33FFFFFF));
	}

	for (let i = 0; i < newChannelMatrix[0].length; i++) {
		if (newChannelMatrix.length === 1) {
			for (let j = 0; j < yScale; j++) {
				let px = 0xAA000000;
				if (newChannelMatrix[0][i] > j) px |= 0x00CCCCCC;
				if (px !== 0xAA000000) {
					graphics.fillRect(i, yScale - j, i, yScale - j, new Brush(px));
				}
			}
		} else {
			for (let j = 0; j < yScale; j++) {
				let px = 0xAA000000;
				if (newChannelMatrix[0][i] > j) px |= 0x00FF0000;
				if (newChannelMatrix[1][i] > j) px |= 0x0000FF00;
				if (newChannelMatrix[2][i] > j) px |= 0x000000FF;
				if (px !== 0xAA000000) {
					graphics.fillRect(i, yScale - j, i, yScale - j, new Brush(px));
				}
			}
		}
	}
	graphics.end();

	processEvents();

	return bitmap;
}

// #endregion Histogram Stuff

// #region "Dialog"
Control.prototype.bindings = null;

Control.prototype.evaluateBindings = function() {
	//Console.warningln("Evaluating bindings for " + this.constructor.name + ", parent: " + (this.parent == null ? "-" : this.parent.constructor.name));
	if(this.bindings != null) {
		//Console.warningln("Evaluating bindings for " + this.constructor.name + ", parent: " + (this.parent == null ? "-" : this.parent.constructor.name));
		if(this.hasFocus != null && !this.hasFocus)
			this.bindings();
	}
}

Sizer.prototype.evaluateBindings = function() {
	if(this.bindings != null) {
		if(this.hasFocus != null && !this.hasFocus)
			this.bindings();
	}
}

TabBox.prototype.recalculateAll = function(previous) {
	for(let i = 0;i<this.numberOfPages;i++) {
		let item = this.pageControlByIndex(i);
		let alreadyProcessed = false;
		for(let j = 0;j<previous.length;j++) {
			if(previous[j] === item) {
				alreadyProcessed = true;
				break;
			}
		}
		if(alreadyProcessed) continue;

		previous.push(item);
		if(item.evaluateBindings != null) item.evaluateBindings();
		if(item.recalculateAll != null) item.recalculateAll(previous);
	}
}

GroupBox.prototype.recalculateAll = function(previous) {
	this.sizer.recalculateAll(previous);
}

Sizer.prototype.recalculateAll = function(previous) {
	previous.push(this);
	if(this.evaluateBindings != null) {
		this.evaluateBindings();
	}
	//Console.warningln("Previous " + previous);
	for(let i = 0;i<this.items.length;i++) {
		let item = this.items[i];
		let alreadyProcessed = false;
		for(let j = 0;j<previous.length;j++) {
			if(previous[j] === item) {
				alreadyProcessed = true;
				break;
			}
		}
		if(alreadyProcessed) continue;
		previous.push(item);

		if(item.evaluateBindings != null) item.evaluateBindings();
		if(item.recalculateAll != null) item.recalculateAll(previous);
	}
}

Dialog.prototype.evaluatedBindings = [];

Dialog.prototype.recalculateAll = function() {
	//const start = Date.now();
	this.evaluatedBindings = [this.sizer];
	this.evaluateBindings();
	this.sizer.recalculateAll(this.evaluatedBindings);
	processEvents();
	//const end = Date.now() - start;
	//Console.writeln("BindingCalc took " + end + "ms");
}

Sizer.prototype.items = [];

Sizer.prototype.clearMargin = function(previous) {
	previous.push(this);
	this.scaledMargin = 0;
	for(let i = 0;i<this.items.length;i++) {
		let item = this.items[i];
		let alreadyProcessed = false;
		for(let j = 0;j<previous.length;j++) {
			if(previous[j] === item) {
				alreadyProcessed = true;
				break;
			}
		}
		if(alreadyProcessed) continue;
		previous.push(item);

		if(item.constructor.name === "Sizer" && this.parentControl != null && this.parentControl.constructor.name !== "Dialog") {
			item.scaledMargin = 0;
			item.clearMargin(previous);
		}
	}
}

Sizer.prototype.addItem = function(item, stretchFactor = 0) {
	//Console.warningln("Adding " + item.constructor.name + " to " + this.constructor.name);
	if(item.constructor.name === "Sizer" && this.parentControl != null && this.parentControl.constructor.name !== "Dialog") {
		item.clearMargin([]);
	}
	this.items.push(item); 
	if(stretchFactor > 0) {
		this.add(item, stretchFactor);
	} else {
		this.add(item);
	}
}

Sizer.prototype.insertItem = function(index, item) {
	this.items.push(item);
	this.insert(index, item);
}

Sizer.prototype.removeItem = function(item) {
	this.remove(item);
	let tempArray = [];
	for(let i = 0;i<this.items.length;i++) {
		if(this.items[i] !== item) tempArray.push(this.items[i]);
	}
	this.items = tempArray;
}

function SpacedVerticalSizer() {
	this.__base__ = VerticalSizer;
	this.__base__();
	this.scaledSpacing = 5;
	this.scaledMargin = 5;
}

function SpacedHorizontalSizer() {
	this.__base__ = HorizontalSizer;
	this.__base__();
	this.scaledSpacing = 5;
	this.scaledMargin = 5;
}

function SpacedRichLabel(parent) {
	this.__base__ = Label;
	this.__base__(parent);
	this.margin = 5;
	this.useRichText = true;
	this.wordWrapping = true;
}
SpacedRichLabel.prototype = new Label;

TabBox.prototype.findControl = function (title) {
	for (let i = 0; i < this.numberOfPages; i++) {
		let foundTitle = this.pageLabel(i);
		if (foundTitle === title) {
			return this.pageControlByIndex(i);
		}
	}

	return null;
}

TabBox.prototype.findControlIndex = function (control) {
	for (let i = 0; i < this.numberOfPages; i++) {
		if (this.pageControlByIndex(i) === control) {
			return i;
		}
	}

	return -1;
}

function EzDialog(fullname, author) {
	this.__base__ = Dialog
	this.__base__();

	this.windowTitle = fullname + " © 2020 " + author + " [EZ Common Runtime v" + CommonVersion + "]";

	this.scaledMinWidth = 450;

	this.starMaskControlIndex = 1;
	this.psfControlIndex = 2;
	this._allowPreviews = false;

	this.allowPreviews = function () {
		this.mainViewSelector.getAll();
		this._allowPreviews = true;
	}

	this.onExit = function () {
		Console.warningln("calling empty onExit() function from GlobalDialog. Override to suppress this warning.");
	}

	this.onEmptyMainView = function () {
		Console.warningln("calling empty onEmptyMainView() function from GlobalDialog. Override to suppress this warning.");
	}

	this.onSelectedMainView = function () {
		Console.warningln("calling empty onSelectedMainView() function from GlobalDialog. Override to suppress this warning.");
	}

	this.onEvaluate = function () {
		Console.warningln("calling empty onEvaluate() function from GlobalDialog. Override to suppress this warning.")
	}

	this.canEvaluate = function () {
		Console.warningln("calling empty canEvaluate() function from GlobalDialog. Override to suppress this warning. Assuming value 'true'");
		return true;
	}

	this.canRun = function () {
		Console.warningln("calling empty canRun() function from GlobalDialog. Override to suppress this warning. Assuming value 'true'");
		return true;
	}

	this.bindings = function() {
		this.enabled = !JobStack.isProcessing();
		if(this.customBindings != null) this.customBindings();
	}
	
	this.openImageFileDialog = function() {
		let fileDialog = new OpenFileDialog();
		fileDialog.multipleSelections = false;
		fileDialog.loadImageFilters();
		if (fileDialog.execute()) {
			return fileDialog.fileName;
		} else {
			return null;
		}
	}

	this.tutorialPrerequisites = ["Empty Prerequisites", "Set GlobalDialog.tutorialPrerequisites"];
	this.tutorialSteps = ["Empty steps", "Set GlobalDialog.tutorialSteps"];

	this.findControlInTabBox = function (title) {
		for (let i = 0; i < GlobalDialog.tabBox.numberOfPages; i++) {
			let foundTitle = GlobalDialog.tabBox.pageLabel(i);
			if (foundTitle === title) {
				return GlobalDialog.tabBox.pageControlByIndex(i);
			}
		}

		return null;
	}

	this.findControlIndexInTabBox = function (control) {
		for (let i = 0; i < GlobalDialog.tabBox.numberOfPages; i++) {
			if (GlobalDialog.tabBox.pageControlByIndex(i) === control) {
				return i;
			}
		}

		return -1;
	}

	this.infoBox = new SpacedRichLabel(this);
	this.infoBox.frameStyle = FrameStyle_Box;
	this.infoBox.text = "Empty Placeholder Text, set GlobalDialog.infoBox.text to replace this text";

	this.showWarningDialog = function (text, title = "Error", okText = "Understood", canCancel = false) {
		let warningDialog = new Dialog(this);
		warningDialog.windowTitle = title;
		warningDialog.setScaledFixedWidth(400);

		let errorLabel = new SpacedRichLabel(warningDialog);
		errorLabel.text = text;
		errorLabel.wordWrapping = true;
		warningDialog.sizer = new SpacedVerticalSizer(warningDialog);
		warningDialog.sizer.addItem(errorLabel);

		let understoodButton = new PushButton(warningDialog);
		understoodButton.text = okText;
		understoodButton.onClick = function () {
			warningDialog.ok();
		}
		understoodButton.icon = warningDialog.scaledResource(":/icons/warning.png");
		let buttonSizer = new SpacedHorizontalSizer(warningDialog);
		buttonSizer.addItem(understoodButton);

		if (canCancel) {
			let cancelButton = new PushButton(warningDialog);
			cancelButton.text = "Cancel";
			cancelButton.onClick = function () {
				warningDialog.cancel();
			}
			cancelButton.icon = warningDialog.scaledResource(":/icons/delete.png");
			buttonSizer.addItem(cancelButton);
		}

		warningDialog.sizer.addItem(buttonSizer);
		warningDialog.execute();

		return warningDialog.result;
	}

	this.showQuestionDialog = function(text, title, okText, cancelText) {
		let questionDialog = new Dialog(this);
		questionDialog.windowTitle = title;
		questionDialog.setScaledFixedWidth(400);
		let questionLabel = new SpacedRichLabel(questionDialog);
		questionLabel.text = text;
		questionDialog.sizer = new SpacedVerticalSizer(questionDialog);
		questionDialog.sizer.addItem(questionLabel);
		let okButton = new PushButton(questionDialog);
		okButton.text = okText;
		okButton.onClick = function() {
			questionDialog.ok();
		}
		okButton.icon = questionDialog.scaledResource(":/icons/check.png");

		let cancelButton = new PushButton(questionDialog);
		cancelButton.text = cancelText;
		cancelButton.onClick = function() {
			questionDialog.cancel();
		}
		cancelButton.icon = questionDialog.scaledResource(":/icons/delete.png");

		let buttonSizer = new SpacedHorizontalSizer(questionDialog);
		buttonSizer.addItem(okButton);
		buttonSizer.addItem(cancelButton);

		questionDialog.sizer.addItem(buttonSizer);
		questionDialog.execute();

		return questionDialog.result;
	}

	this.showHelpDialog = function () {
		let helpDialog = new Dialog(this);
		helpDialog.windowTitle = NAME + " How To";
		helpDialog.setScaledFixedWidth(600);
		let errorLabel = new Label(helpDialog);
		errorLabel.text = "<b>Prerequisites:</b><ul>"
		for (let i = 0; i < GlobalDialog.tutorialPrerequisites.length; i++) {
			errorLabel.text += "<li>" + GlobalDialog.tutorialPrerequisites[i] + "</li>";
		}
		errorLabel.text += "</ul><b>Steps:</b><ul>"
		for (let i = 0; i < GlobalDialog.tutorialSteps.length; i++) {
			errorLabel.text += "<li>" + GlobalDialog.tutorialSteps[i] + "</li>";
		}
		errorLabel.text += "</ul>";
		errorLabel.useRichText = true;
		errorLabel.wordWrapping = true;
		helpDialog.sizer = new SpacedVerticalSizer(helpDialog);
		helpDialog.sizer.addItem(errorLabel);
		let understoodButton = new PushButton(helpDialog);
		understoodButton.text = "OK";
		understoodButton.onClick = function () {
			helpDialog.ok();
		}
		understoodButton.icon = helpDialog.scaledResource(":/icons/info.png");
		helpDialog.sizer.addItem(understoodButton);
		helpDialog.adjustToContents();
		helpDialog.execute();
	}

	this.mainViewSelector = new ViewList(this);
	this.mainViewSelector.toolTip = "Select the image to process";
	this.mainViewSelector.onViewSelected = function (value) {
		JobStack.startProcessing();
		let prevMainViewId = CurrentProcessingInfo.mainViewId;
		if (value.isNull) {
			GlobalDialog.onEmptyMainView.call(GlobalDialog);
			CurrentProcessingInfo.mainViewId = null;
			JobStack.stopProcessing();
			return;
		}

		CurrentProcessingInfo.mainViewId = value.isPreview ? value.window.mainView.id : value.id;
		CurrentProcessingInfo.workingViewId = value.isPreview ? value.fullId : value.id;
		ConsoleWriter.writeMessageBlock("Selected image '" + CurrentProcessingInfo.workingViewId + "'");
		GlobalDialog.onSelectedMainView.call(GlobalDialog, value, prevMainViewId);
		JobStack.stopProcessing();
	}
	this.mainViewSelector.excludeIdentifiersPattern = "_ez_";
	if (this.mainViewSelector.dialog._allowPreviews) this.mainViewSelector.getAll();
	else this.mainViewSelector.getMainViews();

	this.mainControl = new GroupBox(this);
	this.mainControl.sizer = new SpacedVerticalSizer;
	this.mainControl.title = "Options";
	this.mainControl.enabled = false;
	this.mainControl.sizer.addStretch();

	this.runEverythingButton = new PushButton(this);
	this.runEverythingButton.text = "Run " + NAME;
	this.runEverythingButton.toolTip = "Will apply " + NAME + " on image";
	this.runEverythingButton.icon = this.scaledResource(":/icons/ok.png");
	this.runEverythingButton.bindings = function() {
		this.enabled = GlobalDialog.canRun();
	}
	this.runEverythingButton.enabled = true;
	this.runEverythingButton.onClick = function () {
		GlobalDialog.ok();
	}

	this.runAndCloseGroupBox = new GroupBox(this);
	this.runAndCloseGroupBox.title = "Execute and Exit";
	this.runAndCloseGroupBox.sizer = new SpacedVerticalSizer;
	this.runAndCloseGroupBox.enabled = false;
	this.runAndCloseGroupBox.bindings = function() {
		this.enabled = CurrentProcessingInfo.mainViewId != null;
	}
	this.runAndCloseGroupBox.sizer.addItem(this.runEverythingButton);

	this.onEvaluateButton = new PushButton(this);
	this.onEvaluateButton.text = "Evaluate " + NAME + " Run";
	this.onEvaluateButton.icon = this.scaledResource(":/icons/process-ok.png");
	this.onEvaluateButton.bindings = function() {
		this.enabled = GlobalDialog.canEvaluate();
	}
	this.onEvaluateButton.onClick = function () {
		JobStack.startProcessing();
		GlobalDialog.onEvaluate.call(this);
		JobStack.stopProcessing();
	}
	this.onEvaluateButton.hide();

	this.tutorialButton = new PushButton(this);
	this.tutorialButton.text = "How to use " + NAME;
	this.tutorialButton.icon = this.scaledResource(":/icons/help.png");
	this.tutorialButton.onClick = function () {
		GlobalDialog.showHelpDialog();
	}

	this.controlSizer = new SpacedVerticalSizer(this);
	this.controlSizer.addItem(this.infoBox);
	this.controlSizer.addItem(this.tutorialButton);
	this.controlSizer.addItem(this.mainViewSelector);
	this.controlSizer.addItem(this.mainControl);
	this.controlSizer.addItem(this.onEvaluateButton);
	this.controlSizer.addStretch();
	this.controlSizer.addItem(this.runAndCloseGroupBox);

	this.control = new Frame(this);
	this.control.setScaledMaxWidth(450);
	this.control.setScaledMinWidth(450);
	this.control.sizer = this.controlSizer;

	this.tabBox = new TabBox(this);
	this.tabBox.hide();

	this.sizer = new HorizontalSizer;
	this.sizer.addItem(this.control);
	this.sizer.addItem(this.tabBox);

	this.adjustToContents();

	this.updateTimer = new Timer();
	this.updateTimer.onTimeout = function() {
		GlobalDialog.recalculateAll();
	}
	this.updateTimer.interval = 0.5;
	this.updateTimer.periodic = true;

	this.loadInitialView = function() {
		GlobalDialog.mainViewSelector.currentView = ImageWindow.activeWindow.currentView;
		GlobalDialog.mainViewSelector.onViewSelected(ImageWindow.activeWindow.currentView);
	}

	this.replaceMainControl = function (uiElement) {
		Console.writeln("replacing");
		let index = this.controlSizer.indexOf(this.mainControl);
		this.controlSizer.removeItem(this.mainControl);
		this.mainControl.hide();
		this.mainControl = uiElement;
		this.controlSizer.insertItem(index, uiElement);
		this.mainControl.bindings = function() {
			Console.writeln('bla');
			this.enabled = CurrentProcessingInfo.mainViewId != null;
		}
	}

}
EzDialog.prototype = new Dialog;

// #endregion "Dialog"

// #region PreviewControl
function metaData(view) {
	this.width = view.image.width;
	this.height = view.image.height;
}

function PreviewControl(parent, cloneImage, syncView) {
	this.__base__ = Frame;
	this.__base__(parent);

	this.originalParent = parent;
	var self = this;
	this.cloned = cloneImage;
	this.syncView = syncView;
	this.toComputeAltImage = false;

	this.SetImage = function (view) {
		this.image = view.image.render();
		this.metadata = new metaData(view);
		this.scaledImage = null;
		this.SetZoomOutLimit();
		this.UpdateZoom(-100);
	}

	this.SetProcessingInfo = function (processingInfo, title) {
		self.processingInfo = JSON.parse(JSON.stringify(processingInfo));

		let infoGroupBox = new GroupBox(this);

		infoGroupBox.title = title + " settings";
		infoGroupBox.sizer = new VerticalSizer;
		infoGroupBox.sizer.spacing = 5;
		infoGroupBox.sizer.margin = 5;
		infoGroupBox.setScaledFixedWidth(240);

		for (let propName in self.processingInfo) {
			let propValue = self.processingInfo[propName]

			let label = new Label(self);
			label.useRichText = true;
			label.text = propName + " = " + propValue;
			label.wordWrapping = true;
			infoGroupBox.sizer.addItem(label);
		}

		infoGroupBox.adjustToContents();

		self.applyGroupBox = new GroupBox(this);
		self.applyGroupBox.title = "Apply This " + NAME + " Run";
		self.applyGroupBox.sizer = new VerticalSizer;
		self.applyGroupBox.sizer.spacing = 5;
		self.applyGroupBox.sizer.margin = 5;

		let fullButton = new PushButton(this);
		fullButton.text = "Run with these settings";
		fullButton.icon = this.scaledResource(":/icons/ok.png");
		fullButton.onClick = function () {
			CurrentProcessingInfo = self.processingInfo;
			CurrentProcessingInfo.runOnFullImage = true;
			GlobalDialog.ok();
		}

		self.applyGroupBox.sizer.addItem(fullButton);

		self.infoFrame.sizer.insertItem(self.infoFrame.sizer.numberOfItems - 1, infoGroupBox);
		self.infoFrame.sizer.addItem(self.applyGroupBox);
	}

	this.dispose = function () {
		if (self.cloned) {
			if (self.previewFrameWindow != null && !self.previewFrameWindow.isNull) {
				self.previewFrameWindow.forceClose();
			}
		}
		if (self.previewFrameAltWindow != null && !self.previewFrameAltWindow.isNull) {
			self.previewFrameAltWindow.forceClose();
		}
	}

	this.computeOrgImage = function (view, forced = false) {
		if (self.previewFrameWindow != null && !forced) {
			return;
		}

		if (self.STF == null) {
			if(view.window.mainView.stf.toString() != DEFAULT_STF.toString()) {
				self.STF = view.window.mainView.stf;
			}
		}

		let viewToExecuteOn = self.originalView.isPreview ? self.originalView.window.mainView : self.originalView;
		if (self.cloned) {
			self.previewFrameWindow = cloneView(viewToExecuteOn, "_ez_temp_" + viewToExecuteOn.id, true).window;
			if(self.STF == null) self.STF = convertToViewStf(doSTF(self.previewFrameWindow.mainView));
		} else {
			self.previewFrameWindow = viewToExecuteOn.window;
		}
	}

	this.computeAltImage = function () {
		if (self.previewFrameAltWindow == null) {
			self.previewFrameAltWindow = cloneView(self.previewFrameWindow.currentView, self.previewFrameWindow.currentView.id + "Alt", true).window;
		}
		self.previewFrameAltWindow.mainView.stf = self.STF;
		doHistogramTransformation(this.previewFrameAltWindow.mainView);
	}

	this.SetView = function (view, computeAltImage = true) {
		if(CurrentProcessingInfo != null) {
			this.syncedViewName = CurrentProcessingInfo.workingViewId;
		}
		this.toComputeAltImage = computeAltImage;

		self.originalView = view;
		self.computeOrgImage.call(this, view, true);

		if (computeAltImage) {
			self.computeAltImage.call(this);
		}

		if (view.isPreview) {
			self.previewFrameWindow.currentView = self.previewFrameWindow.createPreview(view.window.previewRect(view));
			self.previewFrameAltWindow.currentView = self.previewFrameAltWindow.createPreview(view.window.previewRect(view));
		}

		self.SetImage(self.previewFrameWindow.currentView);
		if (!this.toComputeAltImage) {
			self.alt_checkBox.checked = false;
			self.alt_checkBox.hide();
			self.onImageChange(false);
		} else {
			self.alt_checkBox.checked = true;
			self.onImageChange(true);
		}
	}

	this.onImageChange = function (showAltImage) {
		let horizontalScrollPosition = self.scrollbox.horizontalScrollPosition;
		let verticalScrollPosition = self.scrollbox.verticalScrollPosition;
		let zoom = self.zoom;
		if (showAltImage) {
			self.SetImage(self.previewFrameAltWindow.currentView);
		} else {
			self.SetImage(self.previewFrameWindow.currentView);
		}
		self.UpdateZoom(zoom);
		self.scrollbox.horizontalScrollPosition = horizontalScrollPosition;
		self.scrollbox.verticalScrollPosition = verticalScrollPosition;
	}

	this.alt_checkBox = new CheckBox(this);
	this.alt_checkBox.foregroundColor = 0xffffffff;
	this.alt_checkBox.text = "Alternative Version of image";
	this.alt_checkBox.toolTip = 'Alternative image';
	this.alt_checkBox.onCheck = function (checked) {
		self.onImageChange.call(this, checked);
	}

	this.forceRerender = function () {
		self.computeOrgImage();
		if (this.toComputeAltImage) {
			self.computeAltImage();
		}
		self.onImageChange(self.alt_checkBox.checked);
	}

	this.syncedCall = function (funcCall) {
		if(!self.syncView) return;
		self.isSyncing = true;
		for (let i = 0; i < GlobalDialog.tabBox.numberOfPages; i++) {
			let control = GlobalDialog.tabBox.pageControlByIndex(i);
			if (control === self || control == null) continue;
			if (control.isSyncing != null && control.isSyncing) continue;
			if (control.syncedViewName !== self.syncedViewName) continue;
			if (control.syncView) {
				control.syncView = false;
				funcCall(control);
				control.syncView = true;
			}
		}
		self.isSyncing = false;
	}

	// #region "Fixed"
	this.UpdateZoom = function (newZoom, refPoint) {
		self.syncedCall(function (control) { control.UpdateZoom.call(control, newZoom, refPoint); });
		newZoom = Math.max(this.zoomOutLimit, Math.min(8, newZoom));
		if (newZoom === this.zoom && this.scaledImage)
			return;

		if (refPoint == null)
			refPoint = new Point(this.scrollbox.viewport.width / 2, this.scrollbox.viewport.height / 2);
		var imgx = null;
		if (this.scrollbox.maxHorizontalScrollPosition > 0)
			imgx = (refPoint.x + this.scrollbox.horizontalScrollPosition) / this.scale;
		var imgy = null;
		if (this.scrollbox.maxVerticalScrollPosition > 0)
			imgy = (refPoint.y + this.scrollbox.verticalScrollPosition) / this.scale;

		this.zoom = newZoom;
		this.scaledImage = null;
		this.refPoint = refPoint;
		gc(true);
		if (this.zoom > 0) {
			this.scale = this.zoom;
			this.zoomVal_Label.text = format("%d:1", this.zoom);
		}
		else {
			this.scale = 1 / (-this.zoom + 2);
			this.zoomVal_Label.text = format("1:%d", -this.zoom + 2);
		}
		if (this.image)
			this.scaledImage = this.image.scaled(this.scale);
		else
			this.scaledImage = { width: this.metadata.width * this.scale, height: this.metadata.height * this.scale };
		this.scrollbox.maxHorizontalScrollPosition = Math.max(0, this.scaledImage.width - this.scrollbox.viewport.width);
		this.scrollbox.maxVerticalScrollPosition = Math.max(0, this.scaledImage.height - this.scrollbox.viewport.height);

		if (this.scrollbox.maxHorizontalScrollPosition > 0 && imgx != null)
			this.scrollbox.horizontalScrollPosition = (imgx * this.scale) - refPoint.x;
		if (this.scrollbox.maxVerticalScrollPosition > 0 && imgy != null)
			this.scrollbox.verticalScrollPosition = (imgy * this.scale) - refPoint.y;

		this.scrollbox.viewport.update();
	}

	this.zoomIn_Button = new ToolButton(this);
	this.zoomIn_Button.icon = this.scaledResource(":/icons/zoom-in.png");
	this.zoomIn_Button.setScaledFixedSize(20, 20);
	this.zoomIn_Button.toolTip = "Zoom in";
	this.zoomIn_Button.onMousePress = function () {
		this.parent.parent.UpdateZoom(this.parent.parent.zoom + 1);
	};

	this.zoomOut_Button = new ToolButton(this);
	this.zoomOut_Button.icon = this.scaledResource(":/icons/zoom-out.png");
	this.zoomOut_Button.setScaledFixedSize(20, 20);
	this.zoomOut_Button.toolTip = "Zoom out";
	this.zoomOut_Button.onMousePress = function () {
		this.parent.parent.UpdateZoom(this.parent.parent.zoom - 1);
	};

	this.zoom11_Button = new ToolButton(this);
	this.zoom11_Button.icon = this.scaledResource(":/icons/zoom-1-1.png");
	this.zoom11_Button.setScaledFixedSize(20, 20);
	this.zoom11_Button.toolTip = "Zoom 1:1";
	this.zoom11_Button.onMousePress = function () {
		this.parent.parent.UpdateZoom(1);
	};

	this.zoomOutMax_Button = new ToolButton(this);
	this.zoomOutMax_Button.icon = this.scaledResource(":/icons/zoom.png");
	this.zoomOutMax_Button.setScaledFixedSize(20, 20);
	this.zoomOutMax_Button.toolTip = "Zoom Out Max";
	this.zoomOutMax_Button.onMousePress = function () {
		this.parent.parent.UpdateZoom(-100);
	};

	this.buttons_Box = new Frame(this);
	this.buttons_Box.backgroundColor = 0xff0078d7;
	this.buttons_Box.sizer = new HorizontalSizer;
	this.buttons_Box.sizer.margin = 4;
	this.buttons_Box.sizer.spacing = 4;
	this.buttons_Box.sizer.addItem(this.zoomIn_Button);
	this.buttons_Box.sizer.addItem(this.zoomOut_Button);
	this.buttons_Box.sizer.addItem(this.zoom11_Button);
	this.buttons_Box.sizer.addItem(this.zoomOutMax_Button);
	this.buttons_Box.sizer.addStretch();
	this.buttons_Box.sizer.addItem(this.alt_checkBox);

	this.setScaledMinSize(450, 450);
	this.zoom = 1;
	this.scale = 1;
	this.zoomOutLimit = -5;
	this.scrollbox = new ScrollBox(this);
	this.scrollbox.autoScroll = true;
	this.scrollbox.tracking = true;
	this.scrollbox.cursor = new Cursor(StdCursor_Arrow);

	this.scroll_Sizer = new HorizontalSizer;
	this.scroll_Sizer.addItem(this.scrollbox);

	this.SetZoomOutLimit = function () {
		self.syncedCall(function (control) { control.SetZoomOutLimit.call(control); });
		let scaleX = Math.ceil(this.metadata.width / this.scrollbox.viewport.width);
		let scaleY = Math.ceil(this.metadata.height / this.scrollbox.viewport.height);
		let scale = Math.max(scaleX, scaleY);
		this.zoomOutLimit = -scale + 2;
	}

	this.scrollbox.onHorizontalScrollPosUpdated = function (newPos) {
		self.syncedCall(function (control) {
			control.scrollbox.horizontalScrollPosition = newPos;
		});
		this.viewport.update();
	}
	this.scrollbox.onVerticalScrollPosUpdated = function (newPos) {
		self.syncedCall(function (control) {
			control.scrollbox.verticalScrollPosition = newPos;
		});
		this.viewport.update();
	}

	this.forceRedraw = function () {
		this.scrollbox.viewport.update();
	};

	this.scrollbox.viewport.onMouseWheel = function (x, y, delta, buttonState, modifiers) {
		let preview = this.parent.parent;
		preview.UpdateZoom(preview.zoom + (delta > 0 ? -1 : 1), new Point(x, y));
	}

	this.scrollbox.viewport.onMousePress = function (x, y, button, buttonState, modifiers) {
		let preview = this.parent.parent;
		let p = preview.transform(x, y, preview);
		if (preview.onCustomMouseDown) {
			preview.onCustomMouseDown.call(preview, p.x, p.y, button, buttonState, modifiers)
		}
	}

	this.scrollbox.viewport.onMouseMove = function (x, y, buttonState, modifiers) {
		let preview = this.parent.parent;
		let p = preview.transform(x, y, preview);
		preview.Xval_Label.text = p.x.toString();
		preview.Yval_Label.text = p.y.toString();

		if (preview.onCustomMouseMove) {
			preview.onCustomMouseMove.call(preview, p.x, p.y, buttonState, modifiers)
		}
	}

	this.scrollbox.viewport.onMouseRelease = function (x, y, button, buttonState, modifiers) {
		let preview = this.parent.parent;

		let p = preview.transform(x, y, preview);
		if (preview.onCustomMouseUp) {
			preview.onCustomMouseUp.call(preview, p.x, p.y, button, buttonState, modifiers)
		}
	}

	this.scrollbox.viewport.onResize = function (wNew, hNew, wOld, hOld) {
		let preview = this.parent.parent;
		if (preview.metadata && preview.scaledImage) {
			this.parent.maxHorizontalScrollPosition = Math.max(0, preview.scaledImage.width - wNew);
			this.parent.maxVerticalScrollPosition = Math.max(0, preview.scaledImage.height - hNew);
			preview.SetZoomOutLimit();
			preview.UpdateZoom(preview.zoom);
		}
		this.update();
	}

	this.scrollbox.viewport.onPaint = function (x0, y0, x1, y1) {
		let preview = this.parent.parent;
		let graphics = new VectorGraphics(this);

		graphics.fillRect(x0, y0, x1, y1, new Brush(0xff202020));
		let offsetX = this.parent.maxHorizontalScrollPosition > 0 ? -this.parent.horizontalScrollPosition : (this.width - preview.scaledImage.width) / 2;
		let offsetY = this.parent.maxVerticalScrollPosition > 0 ? -this.parent.verticalScrollPosition : (this.height - preview.scaledImage.height) / 2;
		graphics.translateTransformation(offsetX, offsetY);
		if (preview.image)
			graphics.drawBitmap(0, 0, preview.scaledImage);
		else
			graphics.fillRect(0, 0, preview.scaledImage.width, preview.scaledImage.height, new Brush(0xff000000));

		graphics.pen = new Pen(0xffffffff, 0);
		graphics.drawRect(-1, -1, preview.scaledImage.width + 1, preview.scaledImage.height + 1);

		if (preview.onCustomPaint) {
			graphics.antialiasing = true;
			graphics.scaleTransformation(preview.scale, preview.scale);
			preview.onCustomPaint.call(preview, graphics, x0, y0, x1, y1);
		}
		graphics.end();
	}

	this.transform = function (x, y, preview) {
		let scrollbox = preview.scrollbox;
		let ox = 0;
		let oy = 0;
		ox = scrollbox.maxHorizontalScrollPosition > 0 ? -scrollbox.horizontalScrollPosition : (scrollbox.viewport.width - preview.scaledImage.width) / 2;
		oy = scrollbox.maxVerticalScrollPosition > 0 ? -scrollbox.verticalScrollPosition : (scrollbox.viewport.height - preview.scaledImage.height) / 2;
		let coordPx = new Point((x - ox) / preview.scale, (y - oy) / preview.scale);
		return new Point(coordPx.x, coordPx.y);
	}

	this.center = function () {
		let preview = this;
		let scrollbox = preview.scrollbox;
		let x = scrollbox.viewport.width / 2;
		let y = scrollbox.viewport.height / 2;
		let p = this.transform(x, y, preview);
		return p;
	}

	this.zoomLabel_Label = new Label(this);
	this.zoomLabel_Label.text = "Zoom:";
	this.zoomVal_Label = new Label(this);
	this.zoomVal_Label.text = "1:1";

	this.Xlabel_Label = new Label(this);
	this.Xlabel_Label.text = "X:";
	this.Xval_Label = new Label(this);
	this.Xval_Label.text = "---";
	this.Ylabel_Label = new Label(this);
	this.Ylabel_Label.text = "Y:";
	this.Yval_Label = new Label(this);
	this.Yval_Label.text = "---";

	this.coords_Frame = new Frame(this);
	this.coords_Frame.backgroundColor = 0xffffffff;
	this.coords_Frame.sizer = new HorizontalSizer;
	this.coords_Frame.sizer.margin = 2;
	this.coords_Frame.sizer.spacing = 4;
	this.coords_Frame.sizer.addItem(this.zoomLabel_Label);
	this.coords_Frame.sizer.addItem(this.zoomVal_Label);
	this.coords_Frame.sizer.addSpacing(6);
	this.coords_Frame.sizer.addItem(this.Xlabel_Label);
	this.coords_Frame.sizer.addItem(this.Xval_Label);
	this.coords_Frame.sizer.addSpacing(6);
	this.coords_Frame.sizer.addItem(this.Ylabel_Label);
	this.coords_Frame.sizer.addItem(this.Yval_Label);

	this.coords_Frame.sizer.addStretch();

	self.infoFrame = new Frame(self);
	self.infoFrame.setScaledFixedWidth(250);
	self.infoFrame.sizer = new VerticalSizer;
	self.infoFrame.sizer.margin = 5;
	self.infoFrame.sizer.spacing = 10;
	self.infoFrame.sizer.addStretch();
	self.scroll_Sizer.addItem(self.infoFrame);

	this.sizer = new VerticalSizer;
	this.sizer.addItem(this.buttons_Box);
	this.sizer.addItem(this.scroll_Sizer);
	this.sizer.addItem(this.coords_Frame);
	// #endregion 
}
PreviewControl.prototype = new Control;

// #endregion PreviewControl

// #region Main
function checkForOverrides() {
	if(typeof this.NAME === "undefined") Console.criticalln("NAME:string must be declared in main script.");
	if(typeof this.VERSION === "undefined") Console.criticalln("NAME:string must be declared in main script.");
	if(typeof this.AUTHOR !== "string") Console.criticalln("NAME:string must be declared in main script.");
	if(typeof this.onInit !== "function") Console.criticalln("onInit():void must be declared in main script.");
	if(typeof this.onExit !== "function") Console.criticalln("onExit():void must be declared in main script.");
	if(typeof this.generateProcessingInfo !== "function") Console.criticalln("generateProcessingInfo():ProcessingInfo must be declared in main script.");
	if(typeof this.saveSettings !== "function") Console.criticalln("saveSettings():void must be declared in main script.");
	if(typeof this.execute !== "function") Console.criticalln("execute(window):void must be declared in main script.");
	if(typeof this.customizeDialog !== "function") Console.criticalln("customizeDialog():void must be declared in main script.");
}

function main() {
	checkForOverrides();
	onInit();

	CurrentProcessingInfo = generateProcessingInfo();

	GlobalDialog = new EzDialog(FullName, AUTHOR);
	customizeDialog(GlobalDialog);
	GlobalDialog.onExecute = function() {
		GlobalDialog.recalculateAll();
		GlobalDialog.updateTimer.start();
		GlobalDialog.loadInitialView();
	}

	if(ShowWarning) {
		GlobalDialog.showWarningDialog(WarningMessage, FullName + " Disclaimer");
		ConsoleWriter.writeWarningBlock(WarningMessage);
	}

	let showTutorial = readFromSettingsOrDefault(NAME + ".ShowTutorial", 0, true);
	if (showTutorial) {
		GlobalDialog.showHelpDialog();
		Settings.write(NAME + ".ShowTutorial", 0, false);
	}

	ConsoleWriter.writeMessageStart("Reactor online, sensors online, all systems nominal.");
	ConsoleWriter.writeMessageEnd("Welcome to " + NAME + ", Commander.");

	jsAbortable = true;

	GlobalDialog.execute();
	GlobalDialog.updateTimer.stop();

	if (GlobalDialog.result === 1) {
		saveSettings();
		let mainWindow = null;
		if(CurrentProcessingInfo != null && CurrentProcessingInfo.mainViewId != null) mainWindow = View.viewById(CurrentProcessingInfo.mainViewId).window;
		execute(mainWindow, true, true);
	}

	GlobalDialog.onExit();

	for (let i = 0; i<GlobalDialog.tabBox.numberOfPages; i++) {
		GlobalDialog.tabBox.pageControlByIndex(i).dispose();
	}

	onExit();

	ConsoleWriter.writeMessageBlock("Engine powering down. Thank you for using " + NAME + ". To stay up to date with the EZ Processing Suite, feature requests and issue reports join the Discord: https://discord.gg/zw8vwZF");

	// #endregion Main
	CurrentProcessingInfo.reset();
	GlobalDialog.dispose();
	delete Array.prototype.removeItem;
	delete Object.prototype.printPropertiesDebug;
}