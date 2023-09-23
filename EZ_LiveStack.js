/*
 * ------------------- Version 2020-06-03 --------------------
 * tested on PixInsight 1.8.8-5 Ripley
 *
 * This script allows live stacking.
 * It is possible to use calibration frames and resume stacks overnight.
 * It is possible to save calibrated frames
 *
 * Copyright information
 * 
 * 		Made by S. Dimant (aka darkarchon#4313)
 * 		Original EZ Live Stack idea by S. Dimant
 * 
*/

#feature-id EZ Processing Suite > EZ Live Stack

#define StackProperty "EZLiveStack:ProcessedFiles"
#define ExtensionProperty "EZLiveStack:Extension"
#define PathProperty "EZLiveStack:WatchPath"
#define DarkProperty "EZLiveStack:DarkPath"
#define DarkOptimizeProperty "EZLiveStack:DarkOptimize"
#define DarkExposureProperty "EZLiveStack:DarkExposure"
#define BiasProperty "EZLiveStack:BiasPath"
#define FlatProperty "EZLiveStack:FlatPath"
#define ColorProperty "EZLiveStack:IsCFA"
#define RunSCNRProperty "EZLiveStack:RunSCNR"
#define SCNRAmountProperty "EZLiveStack:RunSCNR:Amount"
#define ABEProperty "EZLiveStack:RunABE"
#define ABEDegreeProperty "EZLiveStack:RunABE:Degree"
#define BayerPatternProperty "EZLiveStack:BayerPat"
#define IgnoreFilterProperty "EZLiveStack:IgnoreFilter"
#define DownscaleProperty "EZLiveStack:DownscaleImages"
#define DownscaleAmountProperty "EZLiveStack:DownscaleImages:Amount"
#define SaveCalibratedFileProperty "EZLiveStack:SaveCalibratedFile"
#define SaveCompressedProperty "EZLiveStack:SaveCalibratedFile:Compressed"
#define SaveInt16Property "EZLiveStack:SaveCalibratedFile:Int16"
#define SaveDebayeredProperty "EZLiveStack:SaveCalibratedFile:Debayered"
#define RunNoiseEvalProperty "EZLiveStack:NoiseEvaluation"
#define NoiseEvalProperty "EZLiveStack:NoiseEvaluation:Values"
#define PedestalProperty "EZLiveStack:Pedestal"
#define CalibratedFilesPrefix "ezc_"
#define DebayeredFilesPrefix "ezd_"
#define FlatStackPrefix "ezflat_"

var NAME = "EZ Live Stack";
var VERSION = "0.14HF5";
var AUTHOR = "S. Dimant";

#include "EZ_Common.js"

var stacks = [];

var fileFilterDict = {};

function onInit() {
    showWarning = false;
    stacks = [];
}


function onExit() { }

function saveSettings() { }

function generateProcessingInfo() {
    return null; // not used
}

// #region Stack
Stack.prototype = new Object;

Stack.prototype.toString = function () {
    for (var propName in this) {
        propValue = this[propName]
        console.writeln(this.constructor.name + "." + propName + " = " + propValue);
    }
}

Stack.prototype.viewExists = function() {
    return this.mainViewId != null;
}

Stack.prototype.getStackView = function() {
    if(this.mainViewId == null) return null;
    return View.viewById(this.mainViewId);
}

Stack.prototype.saveSettings = function() {
    Settings.write("EZLiveStack.BiasPath", 13, this.biasPath == null ? "" : this.biasPath);
    Settings.write("EZLiveStack.DarkPath", 13, this.darkPath == null ? "" : this.darkPath);
    Settings.write("EZLiveStack.FlatPath", 13, this.flatPath == null ? "" : this.flatPath);
    Settings.write("EZLiveStack.ImageIsColor", 0, this.isCFA);
    Settings.write("EZLiveStack.BayerMatrix", 1, this.cfaPattern);
    Settings.write("EZLiveStack.Downscale", 0, this.downscaleImages);
    Settings.write("EZLiveStack.Downscale.Amount", 1, this.downscaleImagesAmount);
    Settings.write("EZLiveStack.RunABE", 0, this.runABE);
    Settings.write("EZLiveStack.RunABE.Degree", 1, this.ABEdegree);
    Settings.write("EZLiveStack.SaveCalibratedFiles", 0, this.saveCalibratedFile);
    Settings.write("EZLiveStack.SaveCalibratedFiles.Compress", 0, this.saveCompressed);
    Settings.write("EZLiveStack.SaveCalibratedFiles.Int16", 0, this.saveAs16BitInt);
    Settings.write("EZLiveStack.SaveCalibratedFiles.Debayered", 0, this.saveDebayered);
    Settings.write("EZLiveStack.OptimizeDark", 0, this.optimizeDark);
    Settings.write("EZLiveStack.OptimizeDark.DarkExpTime", 1, this.darkExposureTime);
    Settings.write("EZLiveStack.IgnoreFilter", 0, this.ignoreFilter);
    Settings.write("EZLiveStack.RunSCNR", 0, this.scnr);
    Settings.write("EZLiveStack.RunSCNR.Amount", 10, this.scnrAmount);
    Settings.write("EZLiveStack.RunNoiseEvaluation", 0, this.runNoiseEval);
    Settings.write("EZLiveStack.Pedestal", 0, 1, this.pedestal);
}

Stack.prototype.storeProperty = function(property, value) {
    if(!this.viewExists()) return;
    this.getStackView().storeProperty(property, value);
}

Stack.prototype.getProperty = function(property) {
    if(!this.viewExists()) return null;
    return this.getStackView().propertyValue(property);
}

Stack.prototype.setDarkPath = function(path) {
    if(!this.viewExists()) return;
    if (path == null || path == "") {
        this.darkPath = null;
        this.storeProperty(DarkProperty, "");
        return;
    }

    let fileInfo = new FileInfo(path);
    if(!fileInfo.isFile) {
        writeWarningBlock("Could not load DARK on " + path + ", file does not exist");
        return;
    }

    writeMessageBlock("Loading DARK " + path);
    this.darkPath = path;
    this.storeProperty(DarkProperty, this.darkPath);
}

Stack.prototype.setBiasPath = function(path) {
    if(!this.viewExists()) return;
    if (path == null || path == "") {
        this.biasPath = null;
        this.storeProperty(BiasProperty, "");
        return;
    }

    let fileInfo = new FileInfo(path);
    if(!fileInfo.isFile) {
        writeWarningBlock("Could not load BIAS on " + path + ", file does not exist");
        return;
    }

    writeMessageBlock("Loading BIAS " + path);
    this.biasPath = path;
    this.storeProperty(BiasProperty, this.biasPath);
}

Stack.prototype.setFlatPath = function(path) {
    if(!this.viewExists()) return;
    if (path == null || path == "") {
        this.flatPath = null;
        this.storeProperty(FlatProperty, "");
        return;
    }

    let fileInfo = new FileInfo(path);
    if(!fileInfo.isFile) {
        writeWarningBlock("Could not load FLAT on " + path + ", file does not exist");
        return;
    }

    writeMessageBlock("Loading FLAT " + path);
    this.flatPath = path;
    this.storeProperty(FlatProperty, this.flatPath);
}

Stack.prototype.setDownscaleImages = function(value) {
    this.storeProperty(DownscaleProperty, value);
    this.downscaleImages = value;
}

Stack.prototype.setDownscaleAmount = function(value) {
    this.storeProperty(DownscaleAmountProperty, value);
    this.downscaleImagesAmount = value;
}

Stack.prototype.setPathToWatch = function(value) {
    this.storeProperty(PathProperty, value);
    this.pathToWatch = value;
}

Stack.prototype.setOptimizeDark = function(value) {
    this.storeProperty(DarkOptimizeProperty, value);
    this.optimizeDark = value;
}

Stack.prototype.setDarkExposureTime = function(value) {
    this.storeProperty(DarkExposureProperty, value);
    this.darkExposureTime = value;
}

Stack.prototype.setCFA = function(value) {
    this.storeProperty(ColorProperty, value);
    this.isCFA = value;
}

Stack.prototype.setCFAPattern = function(value) {
    this.storeProperty(BayerPatternProperty, value);
    this.cfaPattern = value;
}

Stack.prototype.setIgnoreFilter = function(value) {
    this.storeProperty(IgnoreFilterProperty, value);
    this.ignoreFilter = value;
}

Stack.prototype.setSaveCalibratedFile = function(value) {
    this.storeProperty(SaveCalibratedFileProperty, value);
    this.saveCalibratedFile = value;
}

Stack.prototype.setSaveCompressed = function(value) {
    this.storeProperty(SaveCompressedProperty, value);
    this.saveCompressed = value;
}

Stack.prototype.setSaveAs16bit = function(value) {
    this.storeProperty(SaveInt16Property, value);
    this.saveAs16BitInt = value;
}

Stack.prototype.setSaveDebayered = function(value) {
    this.storeProperty(SaveDebayeredProperty, value);
    this.saveDebayered = value;
}

Stack.prototype.setRunABE = function(value) {
    this.storeProperty(ABEProperty, value);
    this.runABE = value;
}

Stack.prototype.setABEDegree = function(value) {
    this.storeProperty(ABEDegreeProperty, value);
    this.ABEdegree = value;
}

Stack.prototype.setRunSCNR = function(value) {
    this.storeProperty(RunSCNRProperty, value);
    this.scnr = value;
}

Stack.prototype.setSCNRAmount = function(value) {
    this.storeProperty(SCNRAmountProperty, value);
    this.scnrAmount = value;
}

Stack.prototype.setRunNoiseEval = function(value) {
    this.storeProperty(RunNoiseEvalProperty, value);
    this.runNoiseEval = value;
}

Stack.prototype.setPedestal = function(value) {
    this.storeProperty(PedestalProperty, value);
    this.pedestal = value;
}

Stack.prototype.getPropertyOrSettingOrDefault = function(property, setting, settingType, defValue) {
    return getValueOrDefault(this.getProperty(property), readFromSettingsOrDefault(setting, settingType, defValue));
}

function Stack(parent, viewId = null) {
    this.__base__ = Object;
    this.mainViewId = viewId;
    this.parent = parent;
    this.processedFiles = [];
    this.ignoredFiles = [];
    this.newFiles = [];
    this.fileName = null;
    this.status = "Waiting for Image Selection";
    this.calibrated = false;
    this.watchingFolder = false;
    this.filter = null;
    this.export = false;

    this.setPathToWatch(getValueOrDefault(this.getProperty(PathProperty), ""));
    this.setBiasPath(this.getPropertyOrSettingOrDefault(BiasProperty, "EZLiveStack.BiasPath", 13, null));
    this.setFlatPath(this.getPropertyOrSettingOrDefault(FlatProperty, "EZLiveStack.FlatPath", 13, null));
    this.setDarkPath(this.getPropertyOrSettingOrDefault(DarkProperty, "EZLiveStack.DarkPath", 13, null));
    this.setDownscaleImages(this.getPropertyOrSettingOrDefault(DownscaleProperty, "EZLiveStack.Downscale", 0, false));
    this.setDownscaleAmount(this.getPropertyOrSettingOrDefault(DownscaleAmountProperty, "EZLiveStack.Downscale.Amount", 1, 2));
    this.setOptimizeDark(this.getPropertyOrSettingOrDefault(DarkOptimizeProperty, "EZLiveStack.OptimizeDark", 0, false));
    this.setDarkExposureTime(this.getPropertyOrSettingOrDefault(DarkExposureProperty, "EZLiveStack.OptimizeDark.DarkExpTime", 1, 1));
    this.setCFA(this.getPropertyOrSettingOrDefault(ColorProperty, "EZLiveStack.ImageIsColor", 0, false));
    this.setCFAPattern(this.getPropertyOrSettingOrDefault(BayerPatternProperty, "EZLiveStack.BayerMatrix", 1, 1));
    this.setIgnoreFilter(this.getPropertyOrSettingOrDefault(IgnoreFilterProperty, "EZLiveStack.IgnoreFilter", 0, false));
    this.setSaveCalibratedFile(this.getPropertyOrSettingOrDefault(SaveCalibratedFileProperty, "EZLiveStack.SaveCalibratedFiles", 0, false));
    this.setSaveCompressed(this.getPropertyOrSettingOrDefault(SaveCompressedProperty, "EZLiveStack.SaveCalibratedFiles.Compress", 0, true));
    this.setSaveAs16bit(this.getPropertyOrSettingOrDefault(SaveInt16Property, "EZLiveStack.SaveCalibratedFiles.Int16", 0, false));
    this.setSaveDebayered(this.getPropertyOrSettingOrDefault(SaveDebayeredProperty, "EZLiveStack.SaveCalibratedFiles.Debayered", 0, true));
    this.setRunABE(this.getPropertyOrSettingOrDefault(ABEProperty, "EZLiveStack.RunABE", 0, false));
    this.setABEDegree(this.getPropertyOrSettingOrDefault(ABEDegreeProperty, "EZLiveStack.RunABE.Degree", 1, 2));
    this.setRunSCNR(this.getPropertyOrSettingOrDefault(RunSCNRProperty, "EZLiveStack.RunSCNR", 0, false));
    this.setSCNRAmount(this.getPropertyOrSettingOrDefault(SCNRAmountProperty, "EZLiveStack.RunSCNR.Amount", 10, 0.7));
    this.setRunNoiseEval(this.getPropertyOrSettingOrDefault(RunNoiseEvalProperty, "EZLiveStack.RunNoiseEvaluation", 0, false));
    this.setPedestal(this.getPropertyOrSettingOrDefault(PedestalProperty, "EZLiveStack.Pedestal", 1, 0));
}

// #endregion Stack

function execute() {
    writeMessageBlock("Exporting Live Stack Image");
    for (let i = 0; i < dialog.tabBox.numberOfPages; i++) {
        dialog.tabBox.pageControlByIndex(i).stack.export = true;
    }
}

function doStarAlign(view, newView) {
    var sa = new StarAlignment;
    sa.referenceImage = view.id;
    return sa.executeOn(newView);
}

function doCalibrate(view, stack) {
    if(stack.biasPath == null && stack.darkPath == null && stack.flatPath == null) {
        return view.window;
    }

    startProcessing();
    let expTime = view.propertyValue("Instrument:ExposureTime");
    writeMessageStart("Calibrating " + view.id);
    let biasImage = null;
    let darkImage = null;
    let flatImage = null;
    let bias = 0;
    let dark = 0;
    let darkScaling = 1;
    let flat = 1;

    if (stack.biasPath != null) {
        biasImage = readImage(stack.biasPath, true);
        bias = biasImage.mainView.id;
        writeMessageBlock("Calibrating with BIAS " + bias, false, true);
    }

    if (stack.darkPath != null) {
        darkImage = readImage(stack.darkPath);
        dark = darkImage.mainView.id;
        writeMessageBlock("Calibrating with DARK " + dark, false, true);
        // calculate scaling
        if (stack.optimizeDark && stack.darkExposureTime != 0) {
            darkScaling = expTime / stack.darkExposureTime;
        }
    }

    if (stack.flatPath != null) {
        flatImage = readImage(stack.flatPath);
        flat = flatImage.mainView.id;
        writeMessageBlock("Calibrating with FLAT " + flat, false, true);
    }

    //console.writeln("(({0}-{1})-({2}*{3}))/{4}".format(view.id, bias, dark, darkScaling, flat));
    doPixelMath(view, "((({0}-{1})-({2}*{3}))/{4})*{5}".format(view.id, bias, dark, darkScaling, flat, (flat == 1 ? "1" : "mean(" + flat + ")")))
    
    if(biasImage != null) {
        biasImage.forceClose();
    }
    if(darkImage != null) {
        darkImage.forceClose();
    }
    if(flatImage != null) {
        flatImage.forceClose();
    }

    writeMessageEnd("Done calibration");
    stopProcessing();
    return view.window;
}

function doImageCalibrate(stack, newFiles) {
    if((stack.biasPath == null && stack.darkPath == null && stack.flatPath == null) || newFiles.length == 0) {
        return [];
    }

    let outputFrames = [];
    let targetFrames = [];
    for(var i = 0;i<newFiles.length;i++) {
        let files = new FileFind();
        let fileName = (newFiles[i].indexOf(".xisf") <= -1 
            ? newFiles[i].replace(stack.fileExtension, ".xisf")
            : newFiles[i]);
        files.begin(stack.pathToWatch + "/" + (fileName.indexOf(CalibratedFilesPrefix) >= 0 ? fileName : CalibratedFilesPrefix + fileName));
        if(files.isFile) {
            targetFrames.push([false, stack.pathToWatch + "/" + newFiles[i]]);
        } else {
            targetFrames.push([true, stack.pathToWatch + "/" + newFiles[i]]);
        }
        files.end();
    }
    gc();

    let hasFiles = false;
    for (var i = 0;i<targetFrames.length;i++) {
        if(targetFrames[i][0] == true) {
            hasFiles = true;
            break;
        }
    }

    if (!hasFiles) {
        return [];
    }

    let compression = "no-compress-data";
    if(stack.saveCompressed) {
        compression = "compress-data compression-codec lz4+sh";
    }

    var calib = new ImageCalibration;
    calib.targetFrames = targetFrames;
    calib.enableCFA = true;
    calib.cfaPattern = ImageCalibration.prototype.Auto;
    calib.inputHints = "fits-keywords normalize raw cfa signed-is-physical";
    calib.outputHints = "properties fits-keywords no-embedded-data no-resolution " + compression;
    calib.pedestal = stack.pedestal;
    calib.pedestalMode = ImageCalibration.prototype.Keyword;
    calib.pedestalKeyword = "";
    calib.overscanEnabled = false;
    calib.overscanImageX0 = 0;
    calib.overscanImageY0 = 0;
    calib.overscanImageX1 = 0;
    calib.overscanImageY1 = 0;
    calib.overscanRegions = [ // enabled, sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1
    [false, 0, 0, 0, 0, 0, 0, 0, 0],
    [false, 0, 0, 0, 0, 0, 0, 0, 0],
    [false, 0, 0, 0, 0, 0, 0, 0, 0],
    [false, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    calib.masterBiasEnabled = stack.biasPath == null ? false : true;
    calib.masterBiasPath = getValueOrDefault(stack.biasPath, "");
    calib.masterDarkEnabled = stack.darkPath == null ? false : true;
    calib.masterDarkPath = getValueOrDefault(stack.darkPath, "");
    calib.masterFlatEnabled = stack.flatPath == null ? false : true;
    calib.masterFlatPath = getValueOrDefault(stack.flatPath, "");
    calib.calibrateBias = false;
    calib.calibrateDark = false;
    calib.calibrateFlat = false;
    calib.optimizeDarks = stack.optimizeDark;
    calib.darkOptimizationThreshold = 0.00000;
    calib.darkOptimizationLow = 3.0000;
    calib.darkOptimizationWindow = 1024;
    calib.darkCFADetectionMode = ImageCalibration.prototype.DetectCFA;
    calib.separateCFAFlatScalingFactors = true;
    calib.flatScaleClippingFactor = 0.05;
    calib.evaluateNoise = true;
    calib.noiseEvaluationAlgorithm = ImageCalibration.prototype.NoiseEvaluation_MRS;
    calib.outputDirectory = "";
    calib.outputExtension = ".xisf";
    calib.outputPrefix = "ezc_";
    calib.outputPostfix = "";
    calib.outputSampleFormat = stack.saveAs16BitInt ? ImageCalibration.prototype.i16 : ImageCalibration.prototype.f32;
    calib.outputPedestal = 0;
    calib.overwriteExistingFiles = true;
    calib.onError = ImageCalibration.prototype.Continue;
    calib.noGUIMessages = true;
    calib.executeGlobal();

    return outputFrames;
}

function evalNoiseOnStack(stack) {
    startProcessing();
    writeMessageStart("Evaluating noise");
    processEvents();
    let stackMainView = stack.getStackView();

    let currentNoiseEval = stackMainView.propertyValue(NoiseEvalProperty);
    if(currentNoiseEval == null) {
        currentNoiseEval = "";
    }

    if(stack.isCFA) {
        stackMainView = extractLightness(stackMainView);
    }

    let noiseEval = new EZ_ScaledNoiseEvaluation(stackMainView.image);

    if(stack.isCFA) {
        stackMainView.window.forceClose();
    }

    processEvents();

    if(currentNoiseEval == "") {
        currentNoiseEval = noiseEval.sigma;
    } else {
        currentNoiseEval = currentNoiseEval + ";" + noiseEval.sigma;
    }

    stack.storeProperty(NoiseEvalProperty, currentNoiseEval);
    writeMessageEnd();
    stopProcessing();
}

function doDebayerAndDownsample(view, stack, fullFile) {
    if(!stack.isCFA && !stack.downscaleImages) {
        return view;
    }

    startProcessing();
    writeMessageStart("Processing image");
    if (stack.isCFA) {
        doImageDebayer(view, stack, fullFile);
        if(stack.saveDebayered && stack.saveCalibratedFile) {
            let newWindow = readImage(fullFile.replace(CalibratedFilesPrefix, DebayeredFilesPrefix + CalibratedFilesPrefix));
            cloneProperties(view, newWindow.currentView);
            view.window.forceClose();
            view = newWindow.currentView;
        } else {
            cloneProperties(view, ImageWindow.activeWindow.mainView);
            view.window.forceClose();
            view = ImageWindow.activeWindow.currentView;
        }
    }

    if(stack.downscaleImages) {
        writeMessageBlock("Downscaling image");
        var downSample = new IntegerResample;
		downSample.zoomFactor = stack.downscaleImagesAmount * -1;
		downSample.downsamplingMode = IntegerResample.prototype.Average;
		downSample.xResolution = 72.000;
		downSample.yResolution = 72.000;
		downSample.metric = false;
		downSample.forceResolution = false;
        downSample.noGUIMessages = false;
        view.storeProperty(DownscaleProperty, true);
        downSample.executeOn(view);
    }
    writeMessageEnd("Done processing");
    stopProcessing();
    return view;
}

function doImageDebayer(view, stack, fullFile) {
    let d = new Debayer();
    d.evaluateNoise = false;
    d.BayerPattern = stack.cfaPattern;

    if (stack.saveDebayered && stack.saveCalibratedFile) {
        let debayeredFile = fullFile.replace(CalibratedFilesPrefix, DebayeredFilesPrefix + CalibratedFilesPrefix);
        let files = new FileFind();
        files.begin(debayeredFile);

        if(files.isFile) {
            writeMessageBlock("Loading previously debayered image");
            return;
        }

        d.evaluateNoise = true;
        d.targetItems = [[true, fullFile]];
        d.outputPrefix = "ezd_";
        d.outputPostfix = "";
        writeMessageBlock("Debayering and saving image");
        d.executeGlobal();
    } else {
        writeMessageBlock("Debayering image");
        d.executeOn(view);
    }
}

var fileWatcher = new FileWatcher();
fileWatcher.onDirectoryChanged = function (dir, initial = false) {
    // just wait for 1s unconditionally
    waitForS(1);
    // find all fitting stacks for the directory
    let allFittingStacks = [];
    for (let i = 0; i < dialog.tabBox.numberOfPages; i++) {
        let tempStack = dialog.tabBox.pageControlByIndex(i).stack;
        if (tempStack.pathToWatch == dir && tempStack.watchingFolder) {
            allFittingStacks.push(tempStack);
        }
    }

    // get all ignored or processed files to not process them again
    let allProcessedFiles = [];
    let allIgnoredFiles = [];

    for(let i = 0;i<allFittingStacks.length;i++) {
        for(let j = 0;j<allFittingStacks[i].processedFiles.length;j++) {
            allProcessedFiles.push(allFittingStacks[i].processedFiles[j]);
        }
        for(let j = 0;j<allFittingStacks[i].ignoredFiles.length;j++) {
            allIgnoredFiles.push(allFittingStacks[i].ignoredFiles[j]);
        }
    }

    // find all new files in the directory
    let files = new FileFind();
    let newFiles = [];
    files.begin(dir + "/*");
    do {
        if (files.isDirectory) { continue; }

        let alreadyProcessed = allProcessedFiles.indexOf(files.name) > -1 || allIgnoredFiles.indexOf(files.name) > -1;
        // ignore ezc_ and ezd_ files
        if (!alreadyProcessed 
                && files.name.indexOf(CalibratedFilesPrefix) <= -1
                && files.name.indexOf(DebayeredFilesPrefix) <= -1
                && files.name.indexOf('.') != 0) {
                    newFiles.push(files.name);
        }
    } while (files.next());

    // fall out if there are no new files
    if(newFiles.length == 0) return;

    // check if any stacks are currently processing
    for (let i = 0; i < dialog.tabBox.numberOfPages; i++) {
        let tempStack = dialog.tabBox.pageControlByIndex(i).stack;
        if(tempStack.isProcessingFiles) {
            writeWarningBlock("Detected a new file but another stack is currently integrating, aborting");
            return;
        }
    }

    // set all related stacks to processing, they potentially are
    for(let i = 0;i<allFittingStacks.length;i++) {
        allFittingStacks[i].isProcessingFiles = true;
    }

    if(!initial) {
        // wait for settletime as defined
        let settleTime = readFromSettingsOrDefault("EZLiveStack.SettleTime", 1, 10);
        writeMessageStart("Detected file changes in " + dir + ", settling " + settleTime + "s");
        waitForS(settleTime);
    }

    newFiles = [];
    // let's just search again and assign after the settletime...
    writeMessageBlock("Determining stacks for new files + filter");
    files.begin(dir + "/*");
    do {
        if (files.isDirectory) { continue; }
        
        let alreadyProcessed = allProcessedFiles.indexOf(files.name) > -1 || allIgnoredFiles.indexOf(files.name) > -1;
        // ignore ezc_ and ezd_ files
        if (!alreadyProcessed 
                && files.name.indexOf(CalibratedFilesPrefix) <= -1
                && files.name.indexOf(DebayeredFilesPrefix) <= -1
                && files.name.indexOf('.') != 0) {
            let fullFile = dir + "/" + files.name;
            let newFilter = getFilterFromFile(fullFile);
            for(let j = 0;j<allFittingStacks.length;j++) {
                let stack = allFittingStacks[j];
                
                if (newFilter == stack.filter || stack.ignoreFilter) {
                    stack.processedFiles.push(files.name);
                    stack.newFiles.push(files.name);
                }
            }
        }
    } while (files.next());

    processEvents();

    // stack all new files into their respective stacks
    for(let i = 0;i<allFittingStacks.length;i++) {
        if(allFittingStacks[i].newFiles.length > 0) {
            allFittingStacks[i].isProcessingFiles = true;
            processEvents();
            integrateFiles(allFittingStacks[i], false);
            processEvents();
            allFittingStacks[i].isProcessingFiles = false;
        } else {
            allFittingStacks[i].isProcessingFiles = false;
        }
    }

    writeMessageEnd();
}

function getFilterFromFile(path) {
    if(!(path in fileFilterDict)) {
        console.noteln(path);
        let newWindow = readImage(path);
        let newFilter = newWindow.mainView.readPropertyOrKeyword("Instruments:Filter:Name", "FILTER");
        fileFilterDict[path] = newFilter;
        newWindow.forceClose();
        return newFilter;
    } else {
        return fileFilterDict[path];
    }
}

function stopWatchingFolder(stack) {
    if (stack.watchingFolder && stack.pathToWatch != "") {
        fileWatcher.removePath(stack.pathToWatch);
        stack.watchingFolder = false;
        writeMessageBlock("File watcher stopped monitoring " + stack.pathToWatch);
    }
}

function startWatchingFolder(stack) {
    stack.watchingFolder = true;
    writeMessageStart("Initializing File Watcher on " + stack.pathToWatch);

    if (!stack.calibrated) {
        startProcessing();
        let newView = null;
        let fullFile = stack.pathToWatch + "/" + CalibratedFilesPrefix + stack.processedFiles[0].replace(stack.fileExtension, ".xisf");
        // handle calibrated and non calibrated files
        if(!stack.saveCalibratedFile) {
            newView = doCalibrate(stack.getStackView(), stack).mainView;
        } else {
            doImageCalibrate(stack, [stack.processedFiles[0]]);
            newView = readImage(fullFile).mainView;
            cloneProperties(stack.getStackView(), newView);
            stack.getStackView().window.forceClose();
            newView.id = stack.mainViewId;
            stack.parent.SetView(newView);
        }

        newView = doDebayerAndDownsample(newView, stack, fullFile);

        stack.calibrated = true;
        if (newView.id != stack.mainViewId) {
            newView.window.hide();
            newView.id = stack.mainViewId;
            stack.parent.SetView(newView);
        }

        if(stack.runNoiseEval && stack.getProperty(NoiseEvalProperty) == null) {
            evalNoiseOnStack(stack);
        }

        stopProcessing();
    }

    fileWatcher.addPath(stack.pathToWatch);
    fileWatcher.onDirectoryChanged(stack.pathToWatch, true);
    writeMessageEnd("File Watcher watching " + stack.pathToWatch);
    stack.status = "Monitoring";
    stack.isProcessingFiles = false;
}

function integrateFiles(stack) {
    startProcessing();
    stack.status = "Integrating";
    writeMessageStart("Integrating files");

    // calibrate when saving
    if(stack.saveCalibratedFile) {
        writeMessageBlock("Calibrating all files");
        stack.status = "Calibrating and saving";
        processEvents();
        doImageCalibrate(stack, stack.newFiles);
    }

    writeMessageBlock("Integrating into stack");

    let i = 0;
    while (stack.newFiles.length > 0) {
        let stackMainView = stack.getStackView();

        i++;
        let newFile = stack.newFiles.shift();
        let fullFile = stack.pathToWatch + "/" + (stack.saveCalibratedFile 
            ? CalibratedFilesPrefix + 
                (newFile.indexOf(".xisf") <= -1 
                    ? newFile.replace(stack.fileExtension, ".xisf")
                    : newFile) 
            : newFile);
        fullFile = fullFile.replace(CalibratedFilesPrefix + CalibratedFilesPrefix, CalibratedFilesPrefix);

        let prefix = "({0}/{1})".format(i, stack.newFiles.length + i);

        let newWindow = null;
        try {
            newWindow = readImage(fullFile);
        } catch (e) {
            stack.processedFiles.removeItem(newFile);
            stack.newFiles.removeItem(newFile);
            stack.ignoredFiles.push(newFile);
            writeWarningBlock("Failed to parse file into image. Ignoring file.");
            continue;
        }

        processEvents();

        if (!stack.saveCalibratedFile) {
            stack.status = prefix + " Calibrating";
            processEvents();
            newWindow = doCalibrate(newWindow.mainView, stack);
        }

        stack.status = prefix + " Processing";
        processEvents();

        newWindow = doDebayerAndDownsample(newWindow.mainView, stack, fullFile).window;

        stack.status = prefix + " Aligning";
        processEvents();


        // star align
        if (!doStarAlign(stackMainView, newWindow.mainView)) {
            newWindow.forceClose();
            stack.processedFiles.removeItem(newFile);
            stack.ignoredFiles.push(newFile);
            writeWarningBlock("Could not align image, continuing...");
            continue;
        }

        newWindow.forceClose();
        newWindow = ImageWindow.activeWindow;
        newWindow.mainView.id = "AlignedImage";

        // integrate
        stack.status = prefix + " Integrating";
        processEvents();
        doPixelMath(stackMainView,
            "iif({0}>({1}*2), {1}, iif({0}==0, {1}, (({1}*{2})+{0})/{3}))".format(newWindow.mainView.id,
                stackMainView.id,
                (stack.processedFiles.length - stack.newFiles.length) - 1,
                (stack.processedFiles.length - stack.newFiles.length)),
                !stack.isCFA);
        newWindow.forceClose();

        let stackPropertyValue = stackMainView.propertyValue(StackProperty);
        stackMainView.storeProperty(StackProperty,
            (stackPropertyValue == null ? "" : (stackPropertyValue + ","))
            + newFile);

        if(stack.runNoiseEval) {
            evalNoiseOnStack(stack);
        }
    }

    writeMessageEnd("Integration complete.");
    stack.isProcessingFiles = false;
    stack.newFiles = [];
    stack.status = "Monitoring";
    gc();
    stopProcessing();
}

function colorStack(stack, viewR, viewG, viewB, doScnr = true) {
    startProcessing();
    // star align everything to R
    if (!doStarAlign(viewR, viewG)) {
        writeWarningBlock("Could not align G image, aborting");
        stack.isProcessingFiles = false;
        stopProcessing();
        throw new Error("Could not align G channel");
    }

    let viewGAligned = ImageWindow.activeWindow.mainView;

    if (!doStarAlign(viewR, viewB)) {
        writeWarningBlock("Could not align B image, aborting");
        viewGAligned.window.forceClose();
        stack.isProcessingFiles = false;
        stopProcessing();
        throw new Error("Could not align B channel");
    }

    let viewBAligned = ImageWindow.activeWindow.mainView;

    let channelCombo = new ChannelCombination();
    channelCombo.channels = [
        [true, viewR.id],
        [true, viewGAligned.id],
        [true, viewBAligned.id]
    ]
    channelCombo.executeGlobal();
    viewGAligned.window.forceClose();
    viewBAligned.window.forceClose();
    let combinedView = ImageWindow.activeWindow.mainView;
    combinedView.id = "_ez_temp_LiveStack_color";
    doSTF(combinedView, null, true);
    if(doScnr) {
        let scnr = new SCNR();
        scnr.executeOn(combinedView);
    }
    stopProcessing();
    return combinedView;
}

function setFilter(view, stack) {
    let filter = view.readPropertyOrKeyword("Instrument:Filter:Name", "FILTER");
    stack.filter = filter;
}

function customizeDialog() {
    //#region Init Stuff
    dialog.infoBox.text = "<b>EZ Live Stack:</b> Select a file in a folder as reference. All remaining files in the folder will be stacked. The folder will be watched for new files and stack them.";

    dialog.onExit = function () {
        for (let i = 0; i < dialog.tabBox.numberOfPages; i++) {
            let stack = dialog.tabBox.pageControlByIndex(i).stack;
            if (stack == null) continue;
            stopWatchingFolder(stack);
            if (stack.viewExists()) {
                if (stack.export == false
                    && stack.previousStackName == null) {
                    stack.getStackView().window.forceClose();
                } else {
                    let view = stack.getStackView();
                    if (stack.previousStackName == null)
                        view.id = sanitizeViewId("_ez_LS_Filter_" + (stack.filter == null ? "None" : stack.filter) + "_" + new Date().toISOString());
                    else
                        view.id = stack.previousStackName;
                    view.window.show();
                }
            }
        }
    }

    dialog.onEmptyMainView = function () { }

    dialog.onSelectedMainView = function () { }

    dialog.onEvaluate = function () { }

    dialog.canEvaluate = function () {
        return false;
    }

    dialog.canRun = function () {
        return false;
    }

    dialog.bindings = function () {

    }

    dialog.isColorStacking = false;
    dialog.doScnr = true;

    dialog.mainViewSelector.hide();
    //#endregion Init Stuff

    dialog.tutorialPrerequisites = ["Readable folder with images"];
    dialog.tutorialSteps = [
        "Select a reference image with 'Start new live stack', images from that folder with the same filter (if able to read from metadata) will be stacked",
        "Select calibration frames and debayer options",
        "Press 'Start Watching Folder' to monitor the folder of the reference file for new files",
        "Once a new image is detected, EZ Live Stack will align and integrate it into the current image",
        "If you have multiple mono stacks running at the same time, assign the tabs to the R/G/B channels in '4. Live RGB Stack' and press 'Start RGB stacking'",
        "If you want to continue with a stack later, select 'Export Current Live Stack'.",
        "Selecting a view from the dropdown of a previous live stack will load in all previously used calibration files and settings.",
        "<b>When loading in a previous live stack with calibration frames: make sure that calibration frames are still present on the same paths as you had them when you made a live stack or remove them</b>",
        "Icon explanation; Square: idle, Circle: monitoring, Triangle: stacking "
    ];

    dialog.selectMainReferenceButton = new PushButton(dialog);
    with (dialog.selectMainReferenceButton) {
        text = "Start new Live Stack";
        toolTip = "Selects Main Reference File";
        icon = dialog.scaledResource(":/icons/window-new.png");
        bindings = function () {
            this.enabled = true; //!getValueOrDefault(dialog.CurrentStack().watchingFolder, false);
        }
        onClick = function () {
            let fileDialog = new OpenFileDialog();
            fileDialog.multipleSelections = false;
            fileDialog.loadImageFilters();
            if (fileDialog.execute()) {
                if(fileDialog.fileName.indexOf(DebayeredFilesPrefix) >= 0) {
                    dialog.showWarningDialog("Please select a non-debayered, non-calibrated file as reference, if calibrated or debayered frames are present the calibration and debayering will not happen again but use those files instead",
                    "Cannot use debayered or calibrated files as reference",
                    "Fine");
                    return;
                }
                if(fileDialog.fileName.indexOf(CalibratedFilesPrefix) >= 0) {
                    dialog.showWarningDialog("Please select a non-calibrated file as reference, if calibrated are present the calibration will not happen again but use those files instead",
                    "Cannot use calibrated files as reference",
                    "Fine");
                    return;
                }
                dialog.setMainReference(fileDialog.fileName);
            }
            this.hasFocus = false;
        }
    }

    dialog.selectMonitoringDirectoryButton = new PushButton(dialog);
    with (dialog.selectMonitoringDirectoryButton) {
        text = "Change Monitoring Folder";
        toolTip = "Adjusts the folder to monitor";
        icon = dialog.scaledResource(":/icons/folder.png");
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1;
        }
        onClick = function () {
            let directoryDialog = new GetDirectoryDialog();
            if (directoryDialog.execute()) {
                dialog.CurrentStack().setPathToWatch(directoryDialog.directory);
            }
            this.hasFocus = false;
        }
    }

    dialog.CurrentStack = function () {
        return dialog.tabBox.currentPageIndex < 0 ? new Stack() : dialog.tabBox.pageControlByIndex(dialog.tabBox.currentPageIndex).stack;
    }

    dialog.setWatchingFolder = function (path, stack) {
        stack.getStackView().storeProperty(PathProperty, path);
        stack.pathToWatch = path;
    }

    dialog.selectMonitoringLabel = new Label(dialog);
    with (dialog.selectMonitoringLabel) {
        bindings = function () {
            this.text = "Directory: " + getValueOrDefault(dialog.CurrentStack().pathToWatch, "-");
        }
        wordWrapping = true;
        useRichText = true;
    }

    dialog.setMainReference = function (path) {
        let fileInfo = new FileInfo(path);
        dialog.addMainView(null, fileInfo);
    }

    dialog.addMainView = function (view, fileInfo, stack) {
        let integrationControl = new PreviewControl(dialog, false, false);

        integrationControl.computeAltImage = function () {
            startProcessing();
            writeMessageStart("Rendering new image");
            if (this.previewFrameAltWindow != null) {
                this.previewFrameAltWindow.forceClose();
            }
            this.previewFrameAltWindow = cloneView(this.previewFrameWindow.currentView, this.previewFrameWindow.currentView.id + "Alt", true).window;
            if(this.stack.runABE && !this.firstCompute) {
                var abe = new AutomaticBackgroundExtractor;
                abe.tolerance = 1.000;
                abe.deviation = 0.800;
                abe.unbalance = 1.800;
                abe.minBoxFraction = 0.050;
                abe.maxBackground = 1.0000;
                abe.minBackground = 0.0000;
                abe.useBrightnessLimits = false;
                abe.polyDegree = this.stack.ABEdegree;
                abe.boxSize = 5;
                abe.boxSeparation = 5;
                abe.modelImageSampleFormat = AutomaticBackgroundExtractor.prototype.f32;
                abe.abeDownsample = 2.00;
                abe.writeSampleBoxes = false;
                abe.justTrySamples = false;
                abe.targetCorrection = AutomaticBackgroundExtractor.prototype.Subtract;
                abe.normalize = false;
                abe.discardModel = true;
                abe.replaceTarget = true;
                abe.correctedImageId = "";
                abe.correctedImageSampleFormat = AutomaticBackgroundExtractor.prototype.SameAsTarget;
                abe.verboseCoefficients = false;
                abe.compareModel = false;
                abe.compareFactor = 10.00;
                abe.executeOn(this.previewFrameAltWindow.mainView);
            }
            this.STF = doSTF(this.previewFrameAltWindow.mainView, null, true);
            doHistogramTransformation(this.previewFrameAltWindow.mainView);
            if(this.stack.scnr && this.stack.isCFA && !this.firstCompute) {
                var scnr = new SCNR;
                scnr.amount = this.stack.scnrAmount;
                scnr.protectionMethod = SCNR.prototype.AverageNeutral;
                scnr.colorToRemove = SCNR.prototype.Green;
                scnr.preserveLightness = true;
                scnr.executeOn(this.previewFrameAltWindow.mainView);
            }
            this.stack.bitmap = generateHistogramImage(this.previewFrameAltWindow.mainView);
            this.stack.noiseEval = generateNoiseEvalImage(this.stack.getStackView().propertyValue(NoiseEvalProperty));
            if(this.firstCompute) this.firstCompute = false;
            writeMessageEnd();
            stopProcessing();
        }

        var newWindow = null;
        if (view == null) {
            // this is a fresh stack
            newWindow = readImage(fileInfo.path);
        } else {
            integrationControl.stack = stack;
            newWindow = view.window;
            dialog.previousStackSelector.remove(view);
            stack.parent = integrationControl;
        }

        integrationControl.infoFrame.hide();

        let filter = newWindow.mainView.readPropertyOrKeyword("Instrument:Filter:Name", "FILTER");
        newWindow.mainView.id = sanitizeViewId("_ez_temp_Live_Stack_" + filter);

        if(view == null) {
            integrationControl.stack = new Stack(integrationControl, newWindow.mainView.id);
        } else {
            stack.mainViewId = newWindow.mainView.id;
            integrationControl.stack = stack;
        }

        setFilter(newWindow.mainView, integrationControl.stack);
        dialog.tabBox.addPage(integrationControl, "Live Stack [Filter:" + integrationControl.stack.filter + "]");
        integrationControl.firstCompute = (view == null);

        // fresh stack, load stuff from settings
        if(view == null) {

            integrationControl.stack.initialFile = fileInfo.path;
            integrationControl.stack.fileName = fileInfo.name;
            integrationControl.stack.fileExtension = fileInfo.extension;
            integrationControl.stack.processedFiles = [integrationControl.stack.fileName + integrationControl.stack.fileExtension];
            newWindow.mainView.storeProperty(StackProperty, integrationControl.stack.fileName + integrationControl.stack.fileExtension);
            newWindow.mainView.storeProperty(ExtensionProperty, integrationControl.stack.fileExtension);
        }

        if (integrationControl.stack.pathToWatch == "") {
            integrationControl.stack.setPathToWatch(fileInfo.drive + fileInfo.directory);
        }

        integrationControl.historyIndex = integrationControl.stack.getStackView().historyIndex;
        integrationControl.SetView(integrationControl.stack.getStackView(), true);

        integrationControl.bindings = function () {
            if (isProcessing()) return;
            if (this.historyIndex != this.previewFrameWindow.mainView.historyIndex) {
                this.historyIndex = this.previewFrameWindow.mainView.historyIndex;
                this.forceRerender();
            }
        }

        integrationControl.stack.status = "Ready, press 'Start watching folder' to enable live stacking";

        if (dialog.tabBox.numberOfPages == 1) {
            dialog.tabBox.show();
            dialog.adjustToContents();
        }

        dialog.tabBox.currentPageIndex = dialog.tabBox.numberOfPages - 1;
    }

    dialog.addColorStack = function () {
        startProcessing();
        writeMessageStart("Starting RGB Stacking");
        let integrationControl = dialog.findControlInTabBox("Live RGB Stack");
        let wasNull = integrationControl == null;
        if (wasNull) {
            integrationControl = new PreviewControl(dialog, false, false);
            integrationControl.infoFrame.hide();
            integrationControl.stack = new Stack();
        } else {
            integrationControl.bindings = null;
            if (!integrationControl.previewFrameWindow.isNull)
                integrationControl.previewFrameWindow.forceClose();
            integrationControl.previewFrameWindow = null;
            if (!integrationControl.previewFrameAltWindow.isNull)
                integrationControl.previewFrameAltWindow.forceClose();
            integrationControl.previewFrameAltWindow = null;
        }

        let add = wasNull ? 1 : 0;
        integrationControl.channelR = dialog.channel1ComboBox.currentItem + 1;
        integrationControl.channelG = dialog.channel2ComboBox.currentItem + 1;
        integrationControl.channelB = dialog.channel3ComboBox.currentItem + 1;
        integrationControl.historyRIndex = dialog.tabBox.pageControlByIndex(integrationControl.channelR - add).previewFrameWindow.mainView.historyIndex;
        integrationControl.historyGIndex = dialog.tabBox.pageControlByIndex(integrationControl.channelG - add).previewFrameWindow.mainView.historyIndex;
        integrationControl.historyBIndex = dialog.tabBox.pageControlByIndex(integrationControl.channelB - add).previewFrameWindow.mainView.historyIndex;

        let newView = null;
        try {
            newView = colorStack(integrationControl.stack, dialog.tabBox.pageControlByIndex(integrationControl.channelR - add).previewFrameWindow.mainView,
                dialog.tabBox.pageControlByIndex(integrationControl.channelG - add).previewFrameWindow.mainView,
                dialog.tabBox.pageControlByIndex(integrationControl.channelB - add).previewFrameWindow.mainView);
        } catch (e) {
            dialog.showWarningDialog("Error during alignment of images: {0}".format(e), "Error", "Fine", false);
            dialog.isColorStacking = false;
            return;
        }

        integrationControl.computeOrgImage = function (view) {
            writeMessageBlock("Combining RGB image");
            if (this.firstRun) {
                this.firstRun = false;
                this.previewFrameWindow = view.window;
                this.STF = convertToViewStf(doSTF(this.previewFrameWindow.mainView, null, true));
                return;
            }

            let newView = colorStack(this.stack, dialog.tabBox.pageControlByIndex(this.channelR).previewFrameWindow.mainView,
                dialog.tabBox.pageControlByIndex(this.channelG).previewFrameWindow.mainView,
                dialog.tabBox.pageControlByIndex(this.channelB).previewFrameWindow.mainView);

            newView.id = "_ez_temp_LiveView_ColorStack"
            newView.window.hide();
            this.STF = convertToViewStf(doSTF(newView, null, true));
            if (!this.previewFrameWindow.isNull)
                this.previewFrameWindow.forceClose();
            this.previewFrameWindow = newView.window;
        }

        integrationControl.computeAltImage = function () {
            if (this.previewFrameAltWindow != null) {
                this.previewFrameAltWindow.forceClose();
            }

            this.previewFrameAltWindow = cloneView(this.previewFrameWindow.mainView, this.previewFrameWindow.mainView.id + "Alt", true).window;
            this.previewFrameAltWindow.mainView.stf = this.STF;
            doHistogramTransformation(this.previewFrameAltWindow.mainView);
            this.stack.bitmap = generateHistogramImage(this.previewFrameAltWindow.mainView);
        }

        integrationControl.firstRun = true;
        stopProcessing();
        integrationControl.SetView(newView, true);
        newView.window.forceClose();

        if (wasNull) {
            dialog.tabBox.insertPage(0, integrationControl, "Live RGB Stack");
            dialog.tabBox.currentPageIndex = 0;
        }

        integrationControl.bindings = function () {
            if (isProcessing()) return;
            this.stack.watchingFolder = dialog.isColorStacking;
            if (!dialog.isColorStacking) return;
            if (this.historyRIndex != dialog.tabBox.pageControlByIndex(this.channelR).previewFrameWindow.mainView.historyIndex
                || this.channelR != dialog.channel1ComboBox.currentItem + 1) {
                writeMessageStart("RGB Stack detected change in R");
                this.channelR = dialog.channel1ComboBox.currentItem + 1;
                this.historyRIndex = dialog.tabBox.pageControlByIndex(this.channelR).previewFrameWindow.mainView.historyIndex;
                this.stack.isProcessingFiles = true;
                this.forceRerender();
                this.stack.isProcessingFiles = false;
                writeMessageEnd();
            } else if (this.historyGIndex != dialog.tabBox.pageControlByIndex(this.channelG).previewFrameWindow.mainView.historyIndex
                || this.channelG != dialog.channel2ComboBox.currentItem + 1) {
                writeMessageStart("RGB Stack detected change in G");
                this.channelG = dialog.channel2ComboBox.currentItem + 1;
                this.historyGIndex = dialog.tabBox.pageControlByIndex(this.channelG).previewFrameWindow.mainView.historyIndex;
                this.stack.isProcessingFiles = true;
                this.forceRerender();
                this.stack.isProcessingFiles = false;
                writeMessageEnd();
            } else if (this.historyBIndex != dialog.tabBox.pageControlByIndex(this.channelB).previewFrameWindow.mainView.historyIndex
                || this.channelB != dialog.channel3ComboBox.currentItem + 1) {
                writeMessageStart("RGB Stack detected change in B");
                this.channelB = dialog.channel3ComboBox.currentItem + 1;
                this.historyBIndex = dialog.tabBox.pageControlByIndex(this.channelB).previewFrameWindow.mainView.historyIndex;
                this.stack.isProcessingFiles = true;
                this.forceRerender();
                this.stack.isProcessingFiles = false;
                writeMessageEnd();
            }
        }
        writeMessageEnd("Initial RGB Stack complete");
    }

    dialog.watchButton = new PushButton(dialog);
    with (dialog.watchButton) {
        bindings = function () {
            this.enabled = dialog.CurrentStack().pathToWatch != "";
            this.text = getValueOrDefault(dialog.CurrentStack().watchingFolder, false) ? "Stop watching folder" : "Start watching folder";
            this.icon = getValueOrDefault(dialog.CurrentStack().watchingFolder, false) ? dialog.scaledResource(":/icons/delete.png") : dialog.scaledResource(":/icons/ok.png");
        }
        onClick = function () {
            if (dialog.CurrentStack().watchingFolder) {
                stopWatchingFolder(dialog.CurrentStack());
                dialog.CurrentStack().status = "Ready, press 'Start watching folder' to enable live stacking";
            } else {
                dialog.CurrentStack().status = "Initializing";
                startWatchingFolder(dialog.CurrentStack());
            }
            this.hasFocus = false;
        }
    }

    dialog.histogramFrame = new Frame(dialog);
    with (dialog.histogramFrame) {
        scaledMinWidth = 220;
        scaledMinHeight = 80;
        dialog.histogramFrame.previousStack = null;
        bindings = function () {
            if (dialog.tabBox.currentPageControl == null) return;
            if (dialog.tabBox.currentPageControl.stack != this.previousStack) {
                this.previousStack = dialog.tabBox.currentPageControl.stack;
                this.repaint();
            }
        }
    }

    dialog.histogramFrame.onPaint = function (x0, y0, x1, y1) {
        var graphics = new VectorGraphics(this);
        graphics.antialiasing = true;
        graphics.fillRect(x0, y0, x1, y1, new Brush(0xff202020));
        if (dialog.tabBox.currentPageControl != null && dialog.tabBox.currentPageControl.stack != null && dialog.tabBox.currentPageControl.stack.bitmap != null) {
            graphics.drawScaledBitmap(x0 + 5, y0 + 5, x1 - 5, y1 - 5, dialog.tabBox.currentPageControl.stack.bitmap);
        }
        graphics.end();
    }

    dialog.noiseEvalFrame = new Frame(dialog);
    with (dialog.noiseEvalFrame) {
        scaledMinWidth = 220;
        scaledMinHeight = 140;
        dialog.noiseEvalFrame.previousStack = null;
        bindings = function () {
            if (dialog.tabBox.currentPageControl == null) return;
            if (dialog.tabBox.currentPageControl.stack != this.previousStack) {
                this.previousStack = dialog.tabBox.currentPageControl.stack;
                this.repaint();
            }
        }
    }

    dialog.noiseEvalFrame.onPaint = function (x0, y0, x1, y1) {
        var graphics = new VectorGraphics(this);
        graphics.antialiasing = true;
        graphics.fillRect(x0, y0, x1, y1, new Brush(0xff202020));
        if (dialog.tabBox.currentPageControl != null && dialog.tabBox.currentPageControl.stack != null && dialog.tabBox.currentPageControl.stack.noiseEval != null) {
            graphics.drawScaledBitmap(x0 + 5, y0 + 5, x1 - 5, y1 - 5, dialog.tabBox.currentPageControl.stack.noiseEval);
        }
        graphics.end();
    }

    dialog.selectBiasButton = new PushButton(dialog);
    with (dialog.selectBiasButton) {
        bindings = function () {
            this.enabled = !dialog.CurrentStack().watchingFolder && dialog.CurrentStack().viewExists();
            if (dialog.CurrentStack().biasPath == null) {
                this.text = "Bias";
                this.icon = dialog.scaledResource(":/image-container/add-files.png");
                this.toolTip = "Selects Bias Reference File";
                this.onClick = function () {
                    dialog.CurrentStack().setBiasPath(dialog.openImageFileDialog());
                    this.hasFocus = false;
                }
            } else {
                this.text = "Bias";
                this.icon = dialog.scaledResource(":/icons/delete.png");
                this.toolTip = dialog.CurrentStack().biasPath;
                this.onClick = function () {
                    dialog.CurrentStack().setBiasPath(null);
                    this.hasFocus = false;
                }
            }
        }
    }

    //#region MasterFlat
    dialog.generateMasterFlatButton = new PushButton(dialog);
    with(dialog.generateMasterFlatButton) {
        text = "Generate Master Flat";
        icon = dialog.scaledResource(":/icons/picture-new.png");
        bindings = function() {
            this.enabled = !dialog.CurrentStack().watchingFolder && dialog.CurrentStack().viewExists() && dialog.CurrentStack().flatPath == null;
        }
        onClick = function() {
            startProcessing();
            dialog.CurrentStack().isProcessingFiles = true;
            // if master bias is present ask user if they want to calibrate with present bias
            let useExistingBias = false;
            let biasPath = null;
            let singleFlatFilePath = null;
            if(dialog.CurrentStack().biasPath != null) {
                useExistingBias = dialog.showQuestionDialog("You currently have a master bias loaded at <br/><i>" + dialog.CurrentStack().biasPath + "</i>"
                + "<br/>Do you want to use that bias for flat calibration?"
                + "<br/><br/><i>If you use this bias you will not be asked for dark flats.</i>", 
                "Use selected bias for flat calibration?", "Use current bias", "Select new master bias/dark flat");
                if(useExistingBias) {
                    biasPath = dialog.CurrentStack().biasPath;
                }
            }
            // else show dialog selecting master bias or flat dark
            if(!useExistingBias) {
                if(dialog.showWarningDialog("Select the master bias or dark flat that you want to use to calibrate the flats with"
                    + " or press Cancel to not use any calibration (not recommended)",
                    "Select master bias / dark flat", "OK", true)) {
                    while(biasPath == null) {
                        biasPath = dialog.openImageFileDialog();
                        if(biasPath == null && !dialog.showWarningDialog("No bias/dark flat has been selected, do you want to cancel the operation completely?", "Cancel operation?",
                        "Select again", true)) {
                            stopProcessing();
                            dialog.CurrentStack().isProcessingFiles = false;
                            return;
                        }
                    }
                }
            }

            // show dialog "select single flat, it will load and integrate all fitting flat files from the folder"
            while(singleFlatFilePath == null) {
                dialog.showWarningDialog("Select a single flat file to generate the master flat from."
                +"<br/><br/><i>The script will load in <b>all files of the same filter</b> in that folder and integrate them!</i>",
                "Select flat file to integrate", "OK", false);
                singleFlatFilePath = dialog.openImageFileDialog();
                if(singleFlatFilePath == null && !dialog.showWarningDialog("No flat has been selected, do you want to cancel the operation completely?", "Cancel operation?",
                "Select again", true)) {
                    stopProcessing();
                    dialog.CurrentStack().isProcessingFiles = false;
                    return;
                }
            }

            let flatFileInfo = new FileInfo(singleFlatFilePath);
            let flatFilePath = flatFileInfo.drive + flatFileInfo.directory;
            let flatFileExtension = flatFileInfo.extension;

            let fullFile = singleFlatFilePath;
            let newWindow = readImage(fullFile);
            let originalFilter = newWindow.mainView.readPropertyOrKeyword("Instruments:Filter:Name", "FILTER");
            newWindow.forceClose();

            if(!dialog.showWarningDialog("The script will now integrate the master flat with following settings:"
            +"<br/>"
            +"<br/>Bias/DarkFlat: " + (biasPath == null ? "No bias" : biasPath)
            +"<br/>Flat folder: " + flatFilePath
            +"<br/>Flat filter: " + (originalFilter == null ? "None" : originalFilter)
            +"<br/><br/>Do you want to continue stacking the master flat?",
            "Continue with following settings?", "Continue", true)) {
                stopProcessing();
                dialog.CurrentStack().isProcessing = false;
                return;
            }

            writeMessageStart("Starting master flat generation");
            let files = new FileFind();
            let flatFiles = [];
            files.begin(flatFilePath + "/*");
            do {
                if (!files.isDirectory) {
                    // ignore calibrated files and ezflat
                    if (files.name.indexOf(CalibratedFilesPrefix) <= -1
                            && files.name.indexOf(DebayeredFilesPrefix) <= -1
                            && files.name.indexOf(FlatStackPrefix) <= -1
                            && files.name.indexOf('.') != 0) {
                        flatFiles.push(files.name);
                    }
                }
            } while (files.next());

            writeMessageBlock("Checking filters in files");
            // load in all flat files and check all flat files for filter
            let flatFilesCopy = JSON.parse(JSON.stringify(flatFiles));
            for(let fileC = 0;fileC<flatFilesCopy.length;fileC++) {
                let newFile = flatFilesCopy[fileC];
                let fullFile = flatFilePath + "/" + flatFilesCopy[fileC];

                let newWindow = null;
                try {
                    newWindow = readImage(fullFile);
                } catch (e) {
                    flatFiles.removeItem(newFile);
                    writeWarningBlock("Failed to parse file into image. Ignoring file.");
                    continue;
                }
        
                let newFilter = newWindow.mainView.readPropertyOrKeyword("Instruments:Filter:Name", "FILTER");
                if (newFilter != originalFilter) {
                    flatFiles.removeItem(newFile);
                    writeWarningBlock("Image had wrong filter, expected was {0} new image is {1}. Ignoring file.".format(originalFilter, newFilter));
                }
                newWindow.forceClose();
            }

            // calibrate if bias/dark flat is set
            if(biasPath != null) {
                writeMessageBlock("Calibrating flat files with master bias/dark flat");
                let flatFilesToIntegrate = [];
                for(let i = 0;i<flatFiles.length;i++) {
                    flatFilesToIntegrate.push([true, flatFilePath + "/"+ flatFiles[i]]);
                }

                var flatcal = new ImageCalibration;
                flatcal.targetFrames = flatFilesToIntegrate;
                flatcal.enableCFA = true;
                flatcal.cfaPattern = ImageCalibration.prototype.Auto;
                flatcal.inputHints = "";
                flatcal.outputHints = "";
                flatcal.pedestal = 0;
                flatcal.pedestalMode = ImageCalibration.prototype.Keyword;
                flatcal.pedestalKeyword = "";
                flatcal.overscanEnabled = false;
                flatcal.overscanImageX0 = 0;
                flatcal.overscanImageY0 = 0;
                flatcal.overscanImageX1 = 0;
                flatcal.overscanImageY1 = 0;
                flatcal.overscanRegions = [ // enabled, sourceX0, sourceY0, sourceX1, sourceY1, targetX0, targetY0, targetX1, targetY1
                [false, 0, 0, 0, 0, 0, 0, 0, 0],
                [false, 0, 0, 0, 0, 0, 0, 0, 0],
                [false, 0, 0, 0, 0, 0, 0, 0, 0],
                [false, 0, 0, 0, 0, 0, 0, 0, 0]
                ];
                flatcal.masterBiasEnabled = true;
                flatcal.masterBiasPath = biasPath;
                flatcal.masterDarkEnabled = false;
                flatcal.masterDarkPath = "";
                flatcal.masterFlatEnabled = false;
                flatcal.masterFlatPath = "";
                flatcal.calibrateBias = false;
                flatcal.calibrateDark = false;
                flatcal.calibrateFlat = false;
                flatcal.optimizeDarks = true;
                flatcal.darkOptimizationThreshold = 0.00000;
                flatcal.darkOptimizationLow = 3.0000;
                flatcal.darkOptimizationWindow = 1024;
                flatcal.darkCFADetectionMode = ImageCalibration.prototype.DetectCFA;
                flatcal.separateCFAFlatScalingFactors = true;
                flatcal.flatScaleClippingFactor = 0.05;
                flatcal.evaluateNoise = false;
                flatcal.noiseEvaluationAlgorithm = ImageCalibration.prototype.NoiseEvaluation_MRS;
                flatcal.outputDirectory = "";
                flatcal.outputExtension = ".xisf";
                flatcal.outputPrefix = "ezc_";
                flatcal.outputPostfix = "";
                flatcal.outputSampleFormat = ImageCalibration.prototype.f32;
                flatcal.outputPedestal = 0;
                flatcal.overwriteExistingFiles = true;
                flatcal.onError = ImageCalibration.prototype.Continue;
                flatcal.noGUIMessages = true;

                flatcal.executeGlobal();
            }

            // shove to integrate and save master flat

            let flatFilesToIntegrate = [];
            for(let i = 0;i<flatFiles.length;i++) {
                flatFilesToIntegrate.push([true, flatFilePath + "/" + (biasPath == null ? flatFiles[i] : "ezc_" + flatFiles[i].replace(flatFileExtension, ".xisf")), "", ""]);
            }

            writeMessageBlock("Integrating Master Flat");
            var flatint = new ImageIntegration;
            flatint.images = flatFilesToIntegrate;
            flatint.inputHints = "";
            flatint.combination = ImageIntegration.prototype.Average;
            flatint.weightMode = ImageIntegration.prototype.DontCare;
            flatint.weightKeyword = "";
            flatint.weightScale = ImageIntegration.prototype.WeightScale_BWMV;
            flatint.adaptiveGridSize = 16;
            flatint.adaptiveNoScale = false;
            flatint.ignoreNoiseKeywords = false;
            flatint.normalization = ImageIntegration.prototype.Multiplicative;
            flatint.rejection = ImageIntegration.prototype.PercentileClip;
            flatint.rejectionNormalization = ImageIntegration.prototype.EqualizeFluxes;
            flatint.minMaxLow = 1;
            flatint.minMaxHigh = 1;
            flatint.pcClipLow = 0.200;
            flatint.pcClipHigh = 0.100;
            flatint.sigmaLow = 4.000;
            flatint.sigmaHigh = 3.000;
            flatint.winsorizationCutoff = 5.000;
            flatint.linearFitLow = 5.000;
            flatint.linearFitHigh = 2.500;
            flatint.esdOutliersFraction = 0.30;
            flatint.esdAlpha = 0.05;
            flatint.esdLowRelaxation = 1.50;
            flatint.ccdGain = 1.00;
            flatint.ccdReadNoise = 10.00;
            flatint.ccdScaleNoise = 0.00;
            flatint.clipLow = true;
            flatint.clipHigh = true;
            flatint.rangeClipLow = false;
            flatint.rangeLow = 0.000000;
            flatint.rangeClipHigh = false;
            flatint.rangeHigh = 0.980000;
            flatint.mapRangeRejection = true;
            flatint.reportRangeRejection = false;
            flatint.largeScaleClipLow = false;
            flatint.largeScaleClipLowProtectedLayers = 2;
            flatint.largeScaleClipLowGrowth = 2;
            flatint.largeScaleClipHigh = false;
            flatint.largeScaleClipHighProtectedLayers = 2;
            flatint.largeScaleClipHighGrowth = 2;
            flatint.generate64BitResult = false;
            flatint.generateRejectionMaps = false;
            flatint.generateIntegratedImage = true;
            flatint.generateDrizzleData = false;
            flatint.closePreviousImages = false;
            flatint.bufferSizeMB = 128;
            flatint.stackSizeMB = 8192;
            flatint.autoMemorySize = true;
            flatint.autoMemoryLimit = 0.75;
            flatint.useROI = false;
            flatint.roiX0 = 0;
            flatint.roiY0 = 0;
            flatint.roiX1 = 0;
            flatint.roiY1 = 0;
            flatint.useCache = true;
            flatint.evaluateNoise = false;
            flatint.mrsMinDataFraction = 0.010;
            flatint.subtractPedestals = true;
            flatint.truncateOnOutOfRange = false;
            flatint.noGUIMessages = true;
            flatint.showImages = true;
            flatint.useFileThreads = true;
            flatint.fileThreadOverload = 1.00;
            flatint.useBufferThreads = true;
            flatint.maxBufferThreads = 8;

            flatint.executeGlobal();

            // save flat
            let newFlatWindow = ImageWindow.activeWindow;
            let masterFlatPath = flatFilePath + "/" + FlatStackPrefix + "MASTER" + (originalFilter == null ? "" : "_" + originalFilter) + ".xisf";
            
            newFlatWindow.saveAs(masterFlatPath, false, false, false, false);
            newFlatWindow.forceClose();

            writeMessageEnd("Master flat saved to " + masterFlatPath);

            // load flat
            dialog.CurrentStack().setFlatPath(masterFlatPath);

            dialog.showWarningDialog("Master flat was created and saved to" 
            +"<br/><br/>"+masterFlatPath
            +"<br/><br/>It was also automatically applied to this live stack.", "Flat done", "Oh the time savings!", false);

            dialog.CurrentStack().isProcessingFiles = false;
            stopProcessing();
        }
    }

    //#endregion MasterFlat

    dialog.selectFlatButton = new PushButton(dialog);
    with (dialog.selectFlatButton) {
        bindings = function () {
            this.enabled = !dialog.CurrentStack().watchingFolder && dialog.CurrentStack().viewExists();
            if (dialog.CurrentStack().flatPath == null) {
                this.text = "Flat";
                this.toolTip = "Selects Flat Reference File";
                this.icon = dialog.scaledResource(":/image-container/add-files.png");
                this.onClick = function () {
                    dialog.CurrentStack().setFlatPath(dialog.openImageFileDialog());
                    this.hasFocus = false;
                }
            } else {
                this.text = "Flat";
                this.toolTip = dialog.CurrentStack().flatPath;
                this.icon = dialog.scaledResource(":/icons/delete.png");
                this.onClick = function () {
                    dialog.CurrentStack().setFlatPath(null);
                    this.hasFocus = false;
                }
            }
        }
    }


    dialog.selectDarkButton = new PushButton(dialog);
    with (dialog.selectDarkButton) {
        bindings = function () {
            this.enabled = !dialog.CurrentStack().watchingFolder && dialog.CurrentStack().viewExists();
            if (dialog.CurrentStack().darkPath == null) {
                this.text = "Dark";
                this.toolTip = "Selects Dark Reference File";
                this.icon = dialog.scaledResource(":/image-container/add-files.png");
                this.onClick = function () {
                    dialog.CurrentStack().setDarkPath(dialog.openImageFileDialog());
                    this.hasFocus = false;
                }
            } else {
                this.text = "Dark";
                this.toolTip = dialog.CurrentStack().darkPath;
                this.icon = dialog.scaledResource(":/icons/delete.png");
                this.onClick = function () {
                    dialog.CurrentStack().setDarkPath(null);
                    this.hasFocus = false;
                }
            }
        }
    }

    dialog.darkExpLabel = new Label(dialog);
    dialog.darkExpLabel.text = "Dark Exposure Time";
    dialog.darkExpLabel.textAlignment = 2;

    dialog.darkExpSpinBox = new SpinBox(dialog);
    with (dialog.darkExpSpinBox) {
        setRange(1, 99999);
        bindings = function () {
            this.enabled = dialog.CurrentStack().optimizeDark;
            this.value = dialog.CurrentStack().darkExposureTime;
        }
        onValueUpdated = function (value) {
            dialog.CurrentStack().setDarkExposureTime(value);
        }
    }

    dialog.darkExpSizer = new SpacedHorizontalSizer(dialog);
    dialog.darkExpSizer.addItem(dialog.darkExpLabel);
    dialog.darkExpSizer.addItem(dialog.darkExpSpinBox);

    dialog.darkOptimizeGroupBox = new GroupBox(dialog);
    with (dialog.darkOptimizeGroupBox) {
        title = "Optimize Dark";
        titleCheckBox = true;
        sizer = new HorizontalSizer;
        sizer.add(dialog.darkExpSizer);
        bindings = function () {
            this.checked = dialog.CurrentStack().optimizeDark;
            this.enabled = dialog.CurrentStack().darkPath != null;
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setOptimizeDark(value);
        }
    }

    dialog.abeDegreeSpinBox = new SpinBox(dialog);
    with(dialog.abeDegreeSpinBox) {
        setRange(1,4);
        bindings = function() {
            this.enabled = dialog.CurrentStack().runABE;
            this.value = dialog.CurrentStack().ABEdegree;
        }
        onValueUpdated = function(value) {
            dialog.CurrentStack().setABEDegree(value);
        }
    }

    dialog.abeDegreeLabel = new Label(dialog);
    dialog.abeDegreeLabel.text = "Function degree";
    dialog.abeDegreeLabel.textAlignment = 2;

    dialog.abeDegreeSizer = new SpacedHorizontalSizer(dialog);
    dialog.abeDegreeSizer.addItem(dialog.abeDegreeLabel);
    dialog.abeDegreeSizer.addItem(dialog.abeDegreeSpinBox);

    dialog.runABEGroupBox = new GroupBox(dialog);
    with(dialog.runABEGroupBox) {
        title = "Run ABE";
        titleCheckBox = true;
        sizer = new HorizontalSizer;
        sizer.add(dialog.abeDegreeSizer);
        bindings = function() {
            this.checked = dialog.CurrentStack().runABE;
            this.enabled = dialog.CurrentStack().pathToWatch != "";
        }
        onCheck = function(value) {
            this.hasFocus = false;
            dialog.CurrentStack().setRunABE(value);
        }
    }

    dialog.downscaleAmountSpinBox = new SpinBox(dialog);
    with(dialog.downscaleAmountSpinBox) {
        setRange(1,4);
        bindings = function() {
            this.enabled = dialog.CurrentStack().downscaleImages;
            this.value = dialog.CurrentStack().downscaleImagesAmount;
        }
        onValueUpdated = function(value) {
            dialog.CurrentStack().setDownscaleAmount(value);
        }
    }

    dialog.downscaleAmountLabel = new Label(dialog);
    dialog.downscaleAmountLabel.text = "Amount";
    dialog.downscaleAmountLabel.textAlignment = 2;

    dialog.downscaleAmountSizer = new SpacedHorizontalSizer(dialog);
    dialog.downscaleAmountSizer.addItem(dialog.downscaleAmountLabel);
    dialog.downscaleAmountSizer.addItem(dialog.downscaleAmountSpinBox);

    dialog.downscaleGroupBox = new GroupBox(dialog);
    with(dialog.downscaleGroupBox) {
        title = "Downscale images";
        titleCheckBox = true;
        sizer = new HorizontalSizer;
        sizer.add(dialog.downscaleAmountSizer);
        bindings = function() {
            this.checked = dialog.CurrentStack().downscaleImages;
            this.enabled = dialog.CurrentStack().pathToWatch != "";
        }
        onCheck = function(value) {
            this.hasFocus = false;
            dialog.CurrentStack().setDownscaleImages(value);
        }
    }

    dialog.scnrAmountSlider = new NumericControl(dialog);
	with (dialog.scnrAmountSlider) {
		label.text = "Amount";
		setRange(0.1, 1);
		slider.setRange(0, 10);
		setPrecision(1);
        setValue(dialog.CurrentStack().scnrAmount);
		bindings = function() {
			this.setValue(dialog.CurrentStack().scnrAmount);
		}
		onValueUpdated = function (value) {
			dialog.CurrentStack().setSCNRAmount(value);
		}
	}

    dialog.scnrGroupBox = new GroupBox(dialog);
    with(dialog.scnrGroupBox) {
        title = "Run SCNR Green ";
        titleCheckBox = true;
        sizer = new HorizontalSizer;
        sizer.add(dialog.scnrAmountSlider);
        sizer.margin = 5;
        bindings = function() {
            this.checked = dialog.CurrentStack().scnr;
            this.enabled = dialog.CurrentStack().pathToWatch != "" && dialog.CurrentStack().isCFA;
        }
        onCheck = function(value) {
            this.hasFocus = false;
            dialog.CurrentStack().setRunSCNR(value);
        }
    }

    dialog.extrasControl = new Control(dialog);
    with(dialog.extrasControl) {
        sizer = new VerticalSizer();
        sizer.addItem(dialog.downscaleGroupBox);
        sizer.addItem(dialog.runABEGroupBox);
        sizer.addItem(dialog.scnrGroupBox);
        sizer.addStretch();
    }

    dialog.settleTimeSpinBox = new SpinBox(dialog);
    with(dialog.settleTimeSpinBox) {
        setRange(1,120);
        bindings = function() {
            this.enabled = dialog.CurrentStack().pathToWatch != "";
            this.value = readFromSettingsOrDefault("EZLiveStack.SettleTime", 1, 10);
        }
        onValueUpdated = function(value) {
            Settings.write("EZLiveStack.SettleTime", 1, value);
            this.hasFocus = false;
        }
    }

    dialog.settleTimeLabel = new SpacedRichLabel(dialog);
    dialog.settleTimeLabel.text = "Time to wait after<br/>image detection (s)";
    dialog.settleTimeLabel.textAlignment = 2;

    dialog.settleTimeSizer = new SpacedHorizontalSizer(dialog);
    dialog.settleTimeSizer.addItem(dialog.settleTimeLabel);
    dialog.settleTimeSizer.addItem(dialog.settleTimeSpinBox);

    dialog.ignoreFilterCheckBox = new CheckBox(dialog);
    with (dialog.ignoreFilterCheckBox) {
        text = "Ignore Filter Metadata";
        toolTip = "If checked will stack all files regardless of filter metadata";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, "") != ""
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1;
            this.checked = getValueOrDefault(dialog.CurrentStack().ignoreFilter, false);
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setIgnoreFilter(value);
        }
    }

    dialog.runNoiseEvalCheckBox = new CheckBox(dialog);
    with (dialog.runNoiseEvalCheckBox) {
        text = "Run Noise Evaluation";
        toolTip = "If checked will run noise evaluation and graph it. For precise readings, enable noise evaluation before starting the stack!";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, "") != ""
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1;
            this.checked = getValueOrDefault(dialog.CurrentStack().runNoiseEval, false);

            let noiseEvalIndex = dialog.monitoringInfoTabBox.findControlIndex(dialog.monitoringInfoTabBox.findControl("NoiseEval"));
            if(!this.checked && dialog.monitoringInfoTabBox.pageIcon(noiseEvalIndex) == null) {
                dialog.monitoringInfoTabBox.setPageIcon(noiseEvalIndex, new Bitmap(dialog.scaledResource(":/icons/delete.png")));
                dialog.monitoringInfoTabBox.enablePage(noiseEvalIndex, this.checked);
                if(dialog.monitoringInfoTabBox.currentPageIndex == noiseEvalIndex) {
                    dialog.monitoringInfoTabBox.currentPageIndex = 0;
                }
            }
            if(this.checked && dialog.monitoringInfoTabBox.pageIcon(noiseEvalIndex) != null)
            {
                dialog.monitoringInfoTabBox.clearPageIcon(noiseEvalIndex);
                dialog.monitoringInfoTabBox.enablePage(noiseEvalIndex, this.checked);
            }
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setRunNoiseEval(value);
        }
    }

    dialog.miscControl = new Control(dialog);
    with(dialog.miscControl) {
        sizer = new SpacedVerticalSizer();
        sizer.addItem(dialog.ignoreFilterCheckBox);
        sizer.addItem(dialog.runNoiseEvalCheckBox);
        sizer.addItem(dialog.settleTimeSizer);
        sizer.addStretch();
    }

    // #region "Saving"
    dialog.saveCompressedCheckBox = new CheckBox(dialog);
    with (dialog.saveCompressedCheckBox) {
        text = "Compress saved files";
        toolTip = "Compresses files as LZ4+HC (lossless, adds minimal time)";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1
                && dialog.CurrentStack().saveCalibratedFile;
            this.checked = getValueOrDefault(dialog.CurrentStack().saveCompressed, false);
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setSaveCompressed(value);
        }
    }

    dialog.saveAs16BitIntCheckBox = new CheckBox(dialog);
    with (dialog.saveAs16BitIntCheckBox) {
        text = "Calibrate to 16bit integer";
        toolTip = "Calibrates files to 16bit integer instead of 32bit float, saves a lot of space, can introduce minor imprecision, averages out through stacking. Personally found no downsides. PI Standard is 32bit float.";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1
                && dialog.CurrentStack().saveCalibratedFile;
            this.checked = getValueOrDefault(dialog.CurrentStack().saveAs16BitInt, false);
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setSaveAs16bit(value);
        }
    }

    dialog.saveDebayeredCheckBox = new CheckBox(dialog);
    with (dialog.saveDebayeredCheckBox) {
        text = "Save debayered image";
        toolTip = "Will additionally save the debayered image";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1
                && dialog.CurrentStack().saveCalibratedFile
                && dialog.CurrentStack().isCFA;
            this.checked = getValueOrDefault(dialog.CurrentStack().saveDebayered, false);
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setSaveDebayered(value);
        }
    }

    dialog.pedestalNumericBox = new SpinBox(dialog);
    with(dialog.pedestalNumericBox) {
        setRange(0,65535);
        bindings = function() {
            this.value = dialog.CurrentStack().pedestal;
        }
        onValueUpdated = function(value) {
            dialog.CurrentStack().setPedestal(value);
        }
    }

    dialog.pedestalLabel = new Label(dialog);
    dialog.pedestalLabel.text = "Pedestal (DN)";
    dialog.pedestalLabel.textAlignment = 1;

    dialog.pedestalAmountSizer = new SpacedHorizontalSizer(dialog);
    dialog.pedestalAmountSizer.addItem(dialog.pedestalLabel);
    dialog.pedestalAmountSizer.addItem(dialog.pedestalNumericBox);

    dialog.saveCalibratedImagesGroupBox = new GroupBox(dialog);
    with(dialog.saveCalibratedImagesGroupBox) {
        titleCheckBox = true;
        title = "Save calibrated files";
        toolTip = "Saves the originally calibrated files";
        bindings = function() {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1
                && (dialog.CurrentStack().flatPath != null || dialog.CurrentStack().biasPath != null || dialog.CurrentStack().darkPath != null);
            this.checked = getValueOrDefault(dialog.CurrentStack().saveCalibratedFile, false);
        }
        onCheck = function(value) {
            this.hasFocus = false;
            dialog.CurrentStack().setSaveCalibratedFile(value);
        }
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.saveCompressedCheckBox);
        sizer.addItem(dialog.saveAs16BitIntCheckBox);
        sizer.addItem(dialog.saveDebayeredCheckBox);
        sizer.addItem(dialog.pedestalAmountSizer);
    }
    // #endregion "Saving"

    dialog.cfaComboBox = new ComboBox(dialog);
    with (dialog.cfaComboBox) {
        editEnabled = false;
        addItem("RGGB");
        addItem("BGGR");
        addItem("GBRG");
        addItem("GRBG");
        addItem("GRGB");
        addItem("GBGR");
        addItem("RGBG");
        addItem("BGRG");
        bindings = function () {
            this.currentItem = getValueOrDefault(dialog.CurrentStack().cfaPattern, 1) - 1;
        }
        onItemSelected = function (itemIndex) {
            dialog.CurrentStack().setCFAPattern(itemIndex + 1);
        };
    }

    dialog.cfaGroupBox = new GroupBox(dialog);
    with (dialog.cfaGroupBox) {
        titleCheckBox = true;
        title = "Image is Color";
        sizer = new SpacedHorizontalSizer;
        sizer.addItem(dialog.cfaComboBox);
        bindings = function () {
            this.enabled = dialog.CurrentStack().viewExists();
            this.checked = dialog.CurrentStack().isCFA;
        }
        onCheck = function (value) {
            this.hasFocus = false;
            dialog.CurrentStack().setCFA(value);
        }
    }

    dialog.previousStackSelector = new ViewList(dialog);
    with (dialog.previousStackSelector) {
        toolTip = "Select Previous Stack";
        onViewSelected = function (value) {
            if (value.isNull) {
                return;
            }
            let view = value;

            if(view.propertyValue(PathProperty) == null) {
                dialog.showWarningDialog("Selected view is not an EZ Live Stack View.", "Failed to load");
                dialog.previousStackSelector.remove(value);
                return;
            }

            startProcessing();
            writeMessageStart("Loading in " + value.id);

            view.window.hide();

            let stack = new Stack(null, view.id);

            stack.previousStackName = view.id;
            stack.pathToWatch = view.propertyValue(PathProperty);
            stack.fileExtension = view.propertyValue(ExtensionProperty);
            stack.processedFiles = view.propertyValue(StackProperty).split(",");
            stack.calibrated = true;

            dialog.addMainView(view, null, stack);

            writeMessageEnd();
            stopProcessing();
        }
        excludeIdentifiersPattern = "_ez_temp";
        getMainViews();
    }

    dialog.statusLabel = new Label(dialog);
    dialog.statusLabel.bindings = function () {
        this.text = "Status: " + dialog.CurrentStack().status;
    }
    dialog.statusLabel.useRichText = true;
    dialog.statusLabel.wordWrapping = true;

    dialog.filterLabel = new Label(dialog);
    dialog.filterLabel.bindings = function () {
        this.text = "Filter: " + getValueOrDefault(dialog.CurrentStack().filter, "-");
    }
    dialog.filterLabel.useRichText = true;
    dialog.filterLabel.wordWrapping = true;

    dialog.processedFilesLabel = new Label(dialog);
    dialog.processedFilesLabel.bindings = function () {
        dialog.processedFilesLabel.text = "Files in Stack: " + (getValueOrDefault(dialog.CurrentStack().processedFiles.length, 0) - getValueOrDefault(dialog.CurrentStack().newFiles.length, 0));
    }

    dialog.addStackGroupBox = new GroupBox(dialog);
    with (dialog.addStackGroupBox) {
        title = "1. Stack";
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.previousStackSelector);
        sizer.addItem(dialog.selectMainReferenceButton);
    }

    dialog.saveCurrentCalibrationButton = new PushButton(dialog);
    with(dialog.saveCurrentCalibrationButton) {
        icon = dialog.scaledResource(":/icons/save.png");
        text = "Save all calibration options as default";
        toolTip = "Saves all calibration options as default for future stacks, this includes the calibration frames!";
        bindings = function () {
            this.enabled = getValueOrDefault(dialog.CurrentStack().pathToWatch, null) != null
                && fileWatcher.directories.indexOf(getValueOrDefault(dialog.CurrentStack().pathToWatch, "default")) == -1;
        }
        onClick = function() {
            dialog.CurrentStack().saveSettings();
        }
    }

    dialog.calibFramesControl = new Control(dialog);
    with(dialog.calibFramesControl) {
        sizer = new HorizontalSizer();
        sizer.spacing = 5;
        sizer.addItem(dialog.selectBiasButton);
        sizer.addItem(dialog.selectFlatButton);
        sizer.addItem(dialog.selectDarkButton);
    }

    dialog.integrationOptionsControl = new Control(dialog);
    with (dialog.integrationOptionsControl) {
        sizer = new SpacedVerticalSizer();
        sizer.addItem(dialog.calibFramesControl);
        sizer.addItem(dialog.generateMasterFlatButton);
        sizer.addItem(dialog.darkOptimizeGroupBox);
        sizer.addItem(dialog.cfaGroupBox);
        sizer.addStretch();
    }

    dialog.integrationSettingsControl = new Control(dialog);
    with(dialog.integrationSettingsControl) {
        sizer = new SpacedVerticalSizer();
        sizer.addItem(dialog.saveCalibratedImagesGroupBox);
        sizer.addStretch();
    }

    dialog.processingSettingsControl = new Control(dialog);
    with(dialog.processingSettingsControl) {
        sizer = new SpacedVerticalSizer();
        sizer.addItem(dialog.extrasControl);
        sizer.addStretch();
    }

    dialog.calibrationTabBox = new TabBox(dialog);
    with(dialog.calibrationTabBox) {
        addPage(dialog.integrationOptionsControl, "Masters");
        addPage(dialog.integrationSettingsControl, "Saving");
        addPage(dialog.processingSettingsControl, "Processing");
        addPage(dialog.miscControl, "Misc");
    }

    dialog.fullCalibrationControl = new Control(dialog);
    with(dialog.fullCalibrationControl) {
        setScaledMinHeight(240);
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.calibrationTabBox);
        sizer.addItem(dialog.saveCurrentCalibrationButton);
    }

    dialog.integrationOptionsSectionBar = new SectionBar(dialog);
    with (dialog.integrationOptionsSectionBar) {
        bindings = function () {
            this.enabled = dialog.CurrentStack().viewExists() && !dialog.CurrentStack().watchingFolder;
            if (dialog.CurrentStack().watchingFolder && this.isExpanded()) {
                this.toggleSection();
            }
        }
        setTitle("2. Calibration Options");
        setSection(dialog.fullCalibrationControl);
    }

    dialog.filterFilesSizer = new SpacedHorizontalSizer();
    dialog.filterFilesSizer.addItem(dialog.filterLabel);
    dialog.filterFilesSizer.addItem(dialog.processedFilesLabel);

    dialog.monitoringStatusControl = new Control(dialog);
    with(dialog.monitoringStatusControl) {
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.watchButton);
        sizer.addItem(dialog.selectMonitoringDirectoryButton);
        sizer.addItem(dialog.selectMonitoringLabel);
        sizer.addItem(dialog.integrationOptionsSectionBar);
        sizer.addItem(dialog.filterFilesSizer);
        sizer.addStretch();
    }

    dialog.monitoringHistogramControl = new Control(dialog);
    with(dialog.monitoringHistogramControl) {
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.histogramFrame);
    }

    dialog.noiseEvalLabel = new SpacedRichLabel(dialog);
    dialog.noiseEvalLabel.bindings = function() {
        let stackView = dialog.CurrentStack().getStackView();
        if(stackView == null || stackView.isNull) return;
        let noiseEvalProp = getValueOrDefault(stackView.propertyValue(NoiseEvalProperty), "1;1").toString();
        let vals = [];
        if(noiseEvalProp != null && noiseEvalProp.indexOf(";") >= 0) {
            vals = noiseEvalProp.split(";");
        }
        if(noiseEvalProp != null && noiseEvalProp.indexOf(";") < 0) {
            vals = [noiseEvalProp, noiseEvalProp];
        }
        if(vals.length >= 2) {
            this.text = "σ(0) = {0}<br/>σ(Σ(Stack)) = {1}<br/>Improvement {2}%".format(vals[0].toString(2), vals[vals.length-1].toString(2), -1*(100-((vals[0]/vals[vals.length-1])*100)));
        }
    }

    dialog.monitoringNoiseEvalControl = new Control(dialog);
    with(dialog.monitoringNoiseEvalControl) {
        sizer = new VerticalSizer;
        setScaledMinHeight(140);
        sizer.addItem(dialog.noiseEvalLabel);
        sizer.addItem(dialog.noiseEvalFrame);
        sizer.addStretch();
    }

    dialog.monitoringInfoTabBox = new TabBox(dialog);
    with(dialog.monitoringInfoTabBox) {
        addPage(dialog.monitoringStatusControl, "Status");
        addPage(dialog.monitoringHistogramControl, "Histogram");
        addPage(dialog.monitoringNoiseEvalControl, "NoiseEval");

        onPageSelected = function(value) {
            dialog.mainControlReplacement.adjustToContents();
        }
    }

    dialog.monitoringGroupBox = new GroupBox(dialog);
    with (dialog.monitoringGroupBox) {
        bindings = function () {
            this.enabled = dialog.CurrentStack().viewExists();
        }
        setScaledMinHeight(200);
        title = "3. Monitoring";
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.monitoringInfoTabBox);
        sizer.addItem(dialog.statusLabel);
    }

    // #region RGBStack
    dialog.channel1Sizer = new SpacedHorizontalSizer();
    dialog.channel2Sizer = new SpacedHorizontalSizer();
    dialog.channel3Sizer = new SpacedHorizontalSizer();

    dialog.channel1Label = new Label(dialog);
    dialog.channel1Label.text = "R";
    dialog.channel2Label = new Label(dialog);
    dialog.channel2Label.text = "G";
    dialog.channel3Label = new Label(dialog);
    dialog.channel3Label.text = "B";

    dialog.channel1ComboBox = new ComboBox(dialog);
    with (dialog.channel1ComboBox) {
        editEnabled = false;
        bindings = function () {
            let hasLiveRgbStack = dialog.findControlInTabBox("Live RGB Stack") != null;
            for (let i = hasLiveRgbStack ? 1 : 0; i < dialog.tabBox.numberOfPages; i++) {
                let number = hasLiveRgbStack ? i - 1 : i;
                let label = number + ":" + dialog.tabBox.pageLabel(i);
                if (dialog.tabBox.pageControlByIndex(i).stack.isCFA) continue;
                if (this.findItem(label) == -1) {
                    this.addItem(label);
                }
            }
            this.enabled = !dialog.isColorStacking;
        }
    }

    dialog.channel2ComboBox = new ComboBox(dialog);
    with (dialog.channel2ComboBox) {
        editEnabled = false;
        bindings = function () {
            let hasLiveRgbStack = dialog.findControlInTabBox("Live RGB Stack") != null;
            for (let i = hasLiveRgbStack ? 1 : 0; i < dialog.tabBox.numberOfPages; i++) {
                let number = hasLiveRgbStack ? i - 1 : i;
                let label = number + ":" + dialog.tabBox.pageLabel(i);
                if (dialog.tabBox.pageControlByIndex(i).stack.isCFA) continue;
                if (this.findItem(label) == -1) {
                    this.addItem(label);
                }
            }
            this.enabled = !dialog.isColorStacking;
        }
    }

    dialog.channel3ComboBox = new ComboBox(dialog);
    with (dialog.channel3ComboBox) {
        editEnabled = false;
        bindings = function () {
            let hasLiveRgbStack = dialog.findControlInTabBox("Live RGB Stack") != null;
            for (let i = hasLiveRgbStack ? 1 : 0; i < dialog.tabBox.numberOfPages; i++) {
                let number = hasLiveRgbStack ? i - 1 : i;
                let label = number + ":" + dialog.tabBox.pageLabel(i);
                if (dialog.tabBox.pageControlByIndex(i).stack.isCFA) continue;
                if (this.findItem(label) == -1) {
                    this.addItem(label);
                }
            }
            this.enabled = !dialog.isColorStacking;
        }
    }

    dialog.channel1Sizer.addItem(dialog.channel1Label);
    dialog.channel1Sizer.addItem(dialog.channel1ComboBox);
    dialog.channel2Sizer.addItem(dialog.channel2Label);
    dialog.channel2Sizer.addItem(dialog.channel2ComboBox);
    dialog.channel3Sizer.addItem(dialog.channel3Label);
    dialog.channel3Sizer.addItem(dialog.channel3ComboBox);

    dialog.startColorStackButton = new PushButton(dialog)
    with (dialog.startColorStackButton) {
        bindings = function () {
            this.text = getValueOrDefault(dialog.isColorStacking, false) ? "Stop RGB stacking" : "Start RGB stacking";
            this.icon = getValueOrDefault(dialog.isColorStacking, false) ? dialog.scaledResource(":/icons/delete.png") : dialog.scaledResource(":/icons/ok.png");
            this.onClick = getValueOrDefault(dialog.isColorStacking, false) ?
                function () {
                    this.hasFocus = false;
                    dialog.isColorStacking = false;
                }
                : function () {
                    this.hasFocus = false;
                    dialog.isColorStacking = true;
                    dialog.addColorStack();
                }
        }
    }

    dialog.scnrCheckBox = new CheckBox(dialog);
    with(dialog.scnrCheckBox) {
        text = "Apply SCNR Green";
        bindings = function() {
            this.checked = dialog.doScnr;
        }
        onCheck = function(value) {
            this.hasFocus = false;
            dialog.doScnr = value;
        }
    }

    dialog.colorStackControl = new Control(dialog);
    with (dialog.colorStackControl) {
        sizer = new SpacedVerticalSizer;
        sizer.addItem(dialog.channel1Sizer);
        sizer.addItem(dialog.channel2Sizer);
        sizer.addItem(dialog.channel3Sizer);
        sizer.addItem(dialog.scnrCheckBox);
        sizer.addItem(dialog.startColorStackButton);
        hide();
    }

    dialog.colorStackSectionBar = new SectionBar(dialog);
    with (dialog.colorStackSectionBar) {
        setTitle("4. Live RGB Stack");
        setSection(dialog.colorStackControl);
        bindings = function() {
            this.enabled = dialog.tabBox.numberOfPages >= 2;
        }
    }

    // #endregion RGBStack

    dialog.mainControlReplacement = new Control(dialog);
    with (dialog.mainControlReplacement) {
        sizer = new SpacedVerticalSizer();
        sizer.addItem(dialog.addStackGroupBox);
        sizer.addItem(dialog.integrationOptionsSectionBar);
        sizer.addItem(dialog.fullCalibrationControl);
        sizer.addItem(dialog.monitoringGroupBox);
        sizer.addItem(dialog.colorStackSectionBar);
        sizer.addItem(dialog.colorStackControl);
        bindings = function () {
            this.enabled = !isProcessing();
        }
    }

    dialog.controlSizer.insertItem(3, dialog.mainControlReplacement);

    dialog.controlSizer.removeItem(dialog.mainControl);
    dialog.mainControl.hide();

    dialog.runEverythingButton.text = "Export All Live Stacks";
    dialog.runEverythingButton.onClick = function () {
        if (dialog.showWarningDialog("Exporting will close the script. You can reload the stack later into the script and continue from there. Do you want to continue?", "OK to continue?", "Continue", true)) {
            dialog.ok();
        }
    }
    dialog.runEverythingButton.bindings = function () {
        this.enabled = dialog.tabBox.numberOfPages > 0 && !isProcessing();
    }
    dialog.runAndCloseGroupBox.bindings = function () {
        this.enabled = dialog.tabBox.numberOfPages > 0 && !isProcessing();
    }

    dialog.tabBox.bindings = function() {
        for(let i = 0;i<this.numberOfPages;i++) {
            let stack = this.pageControlByIndex(i).stack;
            if(stack.isProcessingFiles) {
                this.setPageIcon(i, dialog.triangleIcon);
            } else if(stack.watchingFolder) {
                this.setPageIcon(i, dialog.ballIcon);
            } else {
                this.setPageIcon(i, dialog.squareIcon);
            }
        }
    }

    dialog.squareIcon = new Bitmap(dialog.scaledResource(":/bullets/bullet-square-red.png"));
    dialog.triangleIcon = new Bitmap(dialog.scaledResource(":/bullets/bullet-triangle-green.png"));
    dialog.ballIcon = new Bitmap(dialog.scaledResource(":/bullets/bullet-ball-blue.png"));

    dialog.control.setScaledMaxWidth(300);
    dialog.control.setScaledMinWidth(300);
    dialog.setScaledMinSize(300, 300)
    dialog.adjustToContents();

    dialog.loadInitialView = function() { }
}

main();