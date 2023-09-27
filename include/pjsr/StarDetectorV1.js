// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// StarDetectorV1.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/StarDetectorV1.jsh - Released 2023-08-28T15:24:27Z
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

const __PJSR_STAR_DETECTOR_VERSION = 1.25;
/*
 * Structure to store the parameters of a detected star.
 */
const __PJSR_STAR_OBJECT_DEFINED = 1;
class Star
{
    constructor( pos, flux, size ) { };
   // Centroid position in pixels, image coordinates.
    pos = new Point( pos.x, pos.y );
   // Total flux, normalized intensity units.
    flux = flux;
   // Area of detected star structure in square pixels.
    size = size;
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
    * ### DEPRECATED
    * Number of small-scale wavelet layers for noise suppression. (default=0)
    */
    noiseLayers = 0;
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
    * Setting the value of this parameter > 0 implies
    * applyHotPixelFilterToDetectionImage=true.
    */
    noiseReductionFilterRadius = 0;
   /*
    * Sensitivity of the star detector device - smaller values mean more
    * sensitivity. (default=0.1)
    */
    sensitivity = 0.1;
   /*
    * Peak response of the star detector device - larger values are more
    * tolerant with relatively flat structures. (default=0.8)
    */
    peakResponse = 0.8;
   /*
    * Maximum distortion allowed, relative to a perfect square. The distortion
    * of a perfect circle is pi/4. (default=0.5)
    */
    maxDistortion = 0.5;
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
    * Local background is evaluated for each star on an inflated rectangular
    * region around the star detection structure. bkgDelta is the inflation
    * distance in pixels. (default=3)
    */
    bkgDelta = 3;
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
    * Compute star parameters
    */
    starParameters( image, rect, starPoints ) { };
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
    * General test function, with optional star mask creation.
    */
    test( image, createStarMaskWindow, maxStars ) { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/StarDetectorV1.jsh - Released 2023-08-28T15:24:27Z


