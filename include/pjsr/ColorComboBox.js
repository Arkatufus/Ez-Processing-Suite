// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// ColorComboBox.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/ColorComboBox.jsh - Released 2023-08-28T15:24:27Z
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

// Icon metrics in logical pixels
const ICONSIZE = 16;
const ICONMARGIN = 2;
/*
 * ComboColor - A collection of CSS3 color/name items sorted by hue/value.
 */
class ComboColor
{
    constructor( value, name ) { };
    value = value;
    name = name;
    icon( size, margin ) { };
    title() { };
    H = myHue( value );
    V = myValue( value );
    isEqualTo( c ) { };
    isLessThan( c ) { };
    static isInitialized() { };
    static initColors() { };
    static searchColor(rgba) { };
}


/*
 * ColorComboBox
 *
 * A utility class that provides a simple list with the full set of standard
 * CSS3 colors. This includes 143 ComboBox items that are automatically shared
 * by all existing ColorComboBox objects. Thanks to this implicit sharing
 * mechanism, a script can define a large number of ColorComboBox controls
 * without consuming too much resources on any supported platform.
 *
 * The list of items corresponding to CSS3 colors is sorted by hue value (in
 * the HSV or HSI color ordering systems). This makes it much easier the task
 * of selecting colors, since similar hues are grouped visually.
 *
 * In addition to standard CSS3 colors, a single custom color item can be
 * defined for each ColorComboBox object. The custom color item is managed
 * automatically by the object and appended after the list of standard items.
 */
class ColorComboBox extends ComboBox
{
    constructor( parent ) { super(); };
    customRGBA = null;
    onCurrentColorChanged = null;
    onColorSelected = null;
    colorForIndex( index ) { };
    currentColor() { };
    setCurrentColor( rgba ) { };
    onItemHighlighted( index ) { };
    onItemSelected( index ) { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/ColorComboBox.jsh - Released 2023-08-28T15:24:27Z


