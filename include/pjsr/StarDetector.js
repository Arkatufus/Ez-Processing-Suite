// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// StarDetector.js - Released 9/25/2023 1:51:58 PM
// ----------------------------------------------------------------------------
// This is a stub file, to be used as a development aid in developing
// JavaScript-based PixInsight plugins.
//
// Copyright (c) 2023 Gregorius S. Soedharmo (aka Arkatufus).
// ----------------------------------------------------------------------------
//
//     ____       __ _____  ____
//    / __ \     / // ___/ / __ \
//   / /_/ /__  / / \__ \ / /_/ /
//  / ____// /_/ / ___/ // _, _/   PixInsight JavaScript Runtime
// /_/     \____/ /____//_/ |_|    PJSR Version 1.0
// ----------------------------------------------------------------------------
// pjsr/StarDetector.jsh - Released 2023-08-28T15:24:27Z
// ----------------------------------------------------------------------------
// This file is part of the PixInsight JavaScript Runtime (PJSR).
// PJSR is an ECMA-262-5 compliant framework for development of scripts on the
// PixInsight platform.
//
// Copyright (c) 2003-2023 Pleiades Astrophoto S.L. All Rights Reserved.
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
//    by Pleiades Astrophoto and its contributors (https://pixinsight.com/)."
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
// ----------------------------------------------------------------------------

const __PJSR_STAR_DETECTOR_VERSION = 2.01;
/*
 * Structure to store the parameters of a detected star.
 */
const __PJSR_STAR_OBJECT_DEFINED = 1;
class Star
{
    constructor( pos, flux, bkg, rect, size, nmax ) { };
   // Centroid position in pixels, image coordinates. This property is an
   // object with x and y Number properties.
    pos = pos;
   // Total flux, normalized intensity units.
    flux = flux;
   // Mean local background, normalized intensity units.
    bkg = bkg;
   // Detection region, image coordinates.
    rect = rect;
   // Area of detected star structure in square pixels.
    size = size;
   // Number of local maxima in the detection structure. A value greater than
   // one denotes a double/multiple star or a crowded source. A value of zero
   // signals that detection of local maxima has been disabled, either globally
   // or for this particular structure.
    nmax = nmax;
}


/*
 * Star detection engine
 */
class StarDetector extends Object
{
    constructor() { super(); };
   /*
    * Number of wavelet layers for structure detection. (default=5)
    */
    structureLayers = 5;
   /*
    * Half size in pixels of a morphological median filter, for hot pixel
    * removal. (default=1)
    */
    hotPixelFilterRadius = 1;
   /*
    * Whether the hot pixel filter removal should be applied to the image used
    * for star detection, or only to the working image used to build the
    * structure map. (default=false)
    *
    * By setting this parameter to true, the detection algorithm is completely
    * robust to hot pixels (of sizes not larger than hotPixelFilterRadius), but
    * it is also less sensitive, so less stars will in general be detected.
    * With the default value of false, some hot pixels may be wrongly detected
    * as stars but the number of true stars detected will generally be larger.
    */
    applyHotPixelFilterToDetectionImage = false;
   /*
    * Half size in pixels of a Gaussian convolution filter applied for noise
    * reduction. Useful for star detection in low-SNR images. (default=0)
    *
    * N.B. Setting the value of this parameter > 0 implies
    * applyHotPixelFilterToDetectionImage=true.
    */
    noiseReductionFilterRadius = 0;
   /*
    * Sensitivity of the star detection device.
    *
    * Internally, the sensitivity of the star detection algorithm is expressed
    * in signal-to-noise ratio units with respect to the evaluated dispersion
    * of local background pixels for each detected structure. Given a source
    * with estimated brightness s, local background b and local background
    * dispersion n, sensitivity is the minimum value of (s - b)/n necessary to
    * trigger star detection.
    *
    * To isolate the public interface of this class from its internal
    * implementation, this parameter is normalized to the [0,1] range, where 0
    * and 1 represent minimum and maximum sensitivity, respectively. This
    * abstraction allows us to change the star detection engine without
    * breaking dependent tools and processes.
    *
    * Increase this value to favor detection of fainter stars. Decrease it to
    * restrict detection to brighter stars. (default=0.5).
    */
    sensitivity = 0.5;
   /*!
    * Peak sensitivity of the star detection device.
    *
    * Internally, the peak response property of the star detection algorithm is
    * expressed in kurtosis units. For each detected structure, kurtosis is
    * evaluated from all significant pixels with values greater than the
    * estimated mean local background. Peak response is the minimum value of
    * kurtosis necessary to trigger star detection.
    *
    * To isolate the public interface of this class from its internal
    * implementation, this parameter is normalized to the [0,1] range, where 0
    * and 1 represent minimum and maximum peak response, respectively. This
    * abstraction allows us to change the star detection engine without
    * breaking dependent tools and processes.
    *
    * If you decrease this parameter, stars will need to have stronger (or more
    * prominent) peaks to be detected. This is useful to prevent detection of
    * saturated stars, as well as small nonstellar features. By increasing this
    * parameter, the star detection algorithm will be more sensitive to
    * 'peakedness', and hence more tolerant with relatively flat image
    * features. (default=0.5).
    */
    peakResponse = 0.5;
   /*!
    * If this parameter is false, a local maxima map will be generated to
    * identify and prevent detection of multiple sources that are too close to
    * be separated as individual structures, such as double and multiple stars.
    * In general, barycenter positions cannot be accurately determined for
    * sources with several local maxima. If this parameter is true,
    * non-separable multiple sources will be detectable as single objects.
    * (default=false)
    */
    allowClusteredSources = false;
   /*
    * Half size in pixels of the local maxima detection filter. (default=2)
    */
    localDetectionFilterRadius = 2;
   /*!
    * This parameter is a normalized pixel value in the [0,1] range. Structures
    * with pixels above this value will be excluded for local maxima detection.
    * (default=0.75)
    */
    localMaximaDetectionLimit = 0.75;
   /*
    * Set this flag true to avoid detection of local maxima. (default=false)
    * Setting this parameter to true implies allowClusteredSources = true.
    */
    noLocalMaximaDetection = false;
   /*!
    * Maximum star distortion.
    *
    * Internally, star distortion is evaluated in units of coverage of a square
    * region circumscribed to each detected structure. The coverage of a
    * perfectly circular star is pi/4 (about 0.8). Lower values denote
    * elongated or irregular sources.
    *
    * To isolate the public interface of this class from its internal
    * implementation, this parameter is normalized to the [0,1] range, where 0
    * and 1 represent minimum and maximum distortion, respectively. This
    * abstraction allows us to change the star detection engine without
    * breaking dependent tools and processes.
    *
    * Use this parameter, if necessary, to control inclusion of elongated
    * stars, complex clusters of stars, and nonstellar image features.
    * (default=0.6)
    */
    maxDistortion = 0.6;
   /*!
    * Stars with measured SNR above this parameter in units of the minimum
    * detection level (as defined by the sensitivity parameter) will always be
    * detected, even if their profiles are too flat for the current peak
    * response. This allows us to force inclusion of bright stars. (default=3)
    */
    brightThreshold = 3;
   /*
    * Minimum signal-to-noise ratio of a detectable star.
    *
    * Given a source with estimated brightness s, local background b and local
    * background dispersion n, SNR is evaluated as (s - b)/n. Stars with
    * measured SNR below this parameter won't be detected. (default=0)
    *
    * The value of this parameter can be increased to limit star detection to a
    * subset of the brightest sources in the image adaptively, instead of
    * imposing an arbitrary limit on the number of detected stars.
    */
    minSNR = 0;
   /*!
    * Minimum size of a detectable star structure in square pixels.
    *
    * This parameter can be used to prevent detection of small and bright image
    * artifacts as stars. This can be useful to work with uncalibrated or
    * wrongly calibrated data, especially demosaiced CFA frames where hot
    * pixels have generated large bright artifacts that cannot be removed with
    * a median filter, poorly focused images, and images with poor tracking.
    * (default=1)
    */
    minStructureSize = 1;
   /*
    * Stars with peak values greater than this value won't be detected.
    * (default=1)
    */
    upperLimit = 1.0;
   /*
    * Detect dark structures over a bright background, instead of bright
    * structures over a dark background. (default=false)
    */
    invert = false;
   /*
    * Optional callback progress function with the following signature:
    *
    * Boolean progressCallback( int count, int total )
    *
    * If defined, this function will be called by the stars() method for each
    * row of its target image. The count argument is the current number of
    * processed pixel rows, and total is the height of the target image. If the
    * function returns false, the star detection task will be aborted. If the
    * function returns true, the task will continue. (default=undefined)
    */
    progressCallback = undefined;
   /*
    * Optional mask image. If defined, star detection will be restricted to
    * nonzero mask pixels. (default=undefined)
    */
    mask = undefined;
   /*
    * Stretch factor for the barycenter search algorithm, in sigma units.
    * Increase it to make the algorithm more robust to nearby structures, such
    * as multiple/crowded stars and small nebular features. However, too large
    * of a stretch factor will make the algorithm less accurate. (default=1.5)
    */
    xyStretch = 1.5;
   /*
    * Square structuring element
    */
   /*
    * Circular structuring element
    */
   /*
    * Hot pixel removal with a median filter
    */
    hotPixelFilter( image ) { };
   /*
    * Isolate star detection structures in an image. Replaces the specified map
    * image with its binary star detection map.
    */
    getStructureMap( map ) { };
   /*
    * Local maxima detection.
    */
    getLocalMaximaMap( map ) { };
   /*
    * Compute star parameters
    */
    starParameters( image, rect, starPoints, lmMap ) { };
   /*
    * Finds all the stars in an image. Returns an array of Star objects.
    */
    stars( image ) { };
   /*
    * Create a new image window with the binary star detection map for the
    * specified image (test function).
    */
    createStructureMapWindow( image ) { };
   /*
    * Create a new image window with the binary local maxima map for the
    * specified image (test function).
    */
    createLocalMaximaMapWindow( image ) { };
   /*
    * General test function, with optional star mask creation.
    */
    test( image, createStarMaskWindow, maxStars ) { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/StarDetector.jsh - Released 2023-08-28T15:24:27Z


