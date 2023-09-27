// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// NumericControl.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/NumericControl.jsh - Released 2023-08-28T15:24:27Z
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
 * NumericEdit
 *
 * A label/edit compound control to edit numeric parameters.
 */
class NumericEdit extends Control
{
    constructor( parent ) { super(); };
    value = 0.0;           // current value
    lowerBound = 0.0;      // acceptable range, lower bound
    upperBound = 1.0;      // acceptable range, upper bound
    real = true;           // whether this is a real or integer parameter
    precision = 6;         // number of decimal digits in non-sci mode, [0,16]
    fixed = false;         // precision is literal instead of significant digits?
    sign = false;          // always show a sign character?
    scientific = false;    // scientific notation enabled?
    sciTriggerExp = -1;    // exponent (of ten) to trigger sci notation
    autoEditWidth = true;  // set width of edit control automatically
    useRegExp = true;      // use regular expressions to validate user input
    onValueUpdated = null; // event handler
    hasError = false;      // true while dealing with invalid input
    label = new Label( this );
    edit = new Edit( this );
    sizer = new HorizontalSizer;
    childToFocus = edit;
    backgroundColor = 0; // transparent
    setValue( value ) { };
    updateControls() { };
    valueAsString( value ) { };
    minEditWidth() { };
    adjustEditWidth() { };
    setReal( real ) { };
    setRange( lr, ur ) { };
    setPrecision( precision ) { };
    enableFixedPrecision( enable ) { };
    enableFixedSign( enable ) { };
    enableScientificNotation( enable ) { };
    setScientificNotationTriggerExponent( exp10 ) { };
    enableValidatingRegExp( enable ) { };
    precisionForValue( precision, value ) { };
    useScientific( value ) { };
    updateRegExp() { };
    evaluate() { };
}


/*
 * NumericControl
 *
 * A label/edit/slider compound control to edit numeric parameters.
 */
class NumericControl extends NumericEdit
{
    constructor( parent ) { super(); };
    exponential = false; // exponential slider response?
    slider = new HorizontalSlider( this );
    sliderValueToControl( sliderValue ) { };
    controlValueToSlider( value ) { };
   // Override NumericEdit.updateControls
    updateEditControls = updateControls;
    updateControls() { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/NumericControl.jsh - Released 2023-08-28T15:24:27Z


