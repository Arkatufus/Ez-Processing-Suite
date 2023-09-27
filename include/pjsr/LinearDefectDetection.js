// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// LinearDefectDetection.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/LinearDefectDetection.jsh - Released 2023-08-28T15:24:27Z
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

const LDD_DEFAULT_DETECT_COLUMNS = true;
const LDD_DEFAULT_DETECT_PARTIAL_LINES = true;
const LDD_DEFAULT_CLOSE_FORMER_WORKING_IMAGES = true;
const LDD_DEFAULT_LAYERS_TO_REMOVE = 9;
const LDD_DEFAULT_REJECTION_LIMIT = 3;
const LDD_DEFAULT_DETECTION_THRESHOLD = 5;
const LDD_DEFAULT_PARTIAL_LINE_DETECTION_THRESHOLD = 5;
const LDD_DEFAULT_IMAGE_SHIFT = 50;
const LDD_DEFAULT_OUTPUT_DIR = "";
/*
 * LinearDefectDetection
 *
 * Implements the procedure to detect defective columns or rows in a reference
 * image.
 */
class LDDEngine
{
    constructor() { };
   // set the default values
    detectColumns = LDD_DEFAULT_DETECT_COLUMNS;
    detectPartialLines = LDD_DEFAULT_DETECT_PARTIAL_LINES;
    closeFormerWorkingImages = LDD_DEFAULT_CLOSE_FORMER_WORKING_IMAGES;
    layersToRemove = LDD_DEFAULT_LAYERS_TO_REMOVE;
    rejectionLimit = LDD_DEFAULT_REJECTION_LIMIT;
    detectionThreshold = LDD_DEFAULT_DETECTION_THRESHOLD;
    partialLineDetectionThreshold = LDD_DEFAULT_PARTIAL_LINE_DETECTION_THRESHOLD;
    imageShift = LDD_DEFAULT_IMAGE_SHIFT;
    outputDir = LDD_DEFAULT_OUTPUT_DIR;
   // results
    detectedColumnOrRow = new Array;
    detectedStartPixel = new Array;
    detectedEndPixel = new Array;
}


// ----------------------------------------------------------------------------
// EOF pjsr/LinearDefectDetection.jsh - Released 2023-08-28T15:24:27Z


