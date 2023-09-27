// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// ResizeMode.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/ResizeMode.jsh - Released 2023-08-28T15:24:27Z
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

/*
 * Resizing modes for Image.resample()
 */
const ResizeMode_RelativeDimensions = 0; // Resize relative to current image dimensions
const ResizeMode_AbsolutePixels = 1; // Resize to absolute dimensions in pixels
const ResizeMode_AbsoluteCentimeters = 2; // Resize to absolute dimensions in centimeters
const ResizeMode_AbsoluteInches = 3; // Resize to absolute dimensions in inches
const ResizeMode_ForceArea = 4; // Force the total number of pixels and keep existing aspect ratio
const ResizeMode_Default = ResizeMode_RelativeDimensions;
/*
 * Absolute resizing modes for Image.resample()
 *
 * These modes are only applicable when the main resize mode is
 * ResizeMode_AbsolutePixels, ResizeMode_AbsoluteCentimeters or
 * ResizeMode_AbsoluteInches.
 */
const AbsoluteResizeMode_ForceWidthAndHeight = 0; // Force both dimensions
const AbsoluteResizeMode_ForceWidth = 1; // Force width, preserve aspect ratio
const AbsoluteResizeMode_ForceHeight = 2; // Force height, preserve aspect ratio
const AbsoluteResizeMode_Default = AbsoluteResizeMode_ForceWidthAndHeight; 
// ----------------------------------------------------------------------------
// EOF pjsr/ResizeMode.jsh - Released 2023-08-28T15:24:27Z


