// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// StdCursor.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/StdCursor.jsh - Released 2023-08-28T15:24:27Z
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
 * Standard cursor shapes
 */
const StdCursor_NoCursor = 0; // no cursor is shown
const StdCursor_Arrow = 1; // standard arrow cursor (pointing left)
const StdCursor_InvArrow = 2; // inverted arrow cursor (pointing right)
const StdCursor_UpArrow = 3; // upwards arrow
const StdCursor_DownArrow = 4; // downwards arrow
const StdCursor_LeftArrow = 5; // leftwards arrow
const StdCursor_RightArrow = 6; // rightwards arrow
const StdCursor_Checkmark = 7; // checkmark (ok) cursor
const StdCursor_Crossmark = 8; // crossmark (cancel) cursor
const StdCursor_Accept = 9; // arrow + checkmark
const StdCursor_Reject = 10; // arrow + crossmark
const StdCursor_Add = 11; // arrow + plus sign
const StdCursor_Copy = 12; // arrow + square
const StdCursor_Cross = 13; // crosshair
const StdCursor_Hourglass = 14; // hourglass (native Windows wait cursor)
const StdCursor_Watch = 15; // watch (native Macintosh wait cursor)
const StdCursor_Wait = StdCursor_Watch; // wait cursor: we like the watch! :)
const StdCursor_ArrowWait = 16; // arrow + hourglass/watch
const StdCursor_ArrowQuestion = 17; // arrow + question mark
const StdCursor_IBeam = 18; // I-beam cursor (text edition)
const StdCursor_VerticalSize = 19; // vertical resize
const StdCursor_HorizontalSize = 20; // horizontal resize
const StdCursor_ForwardDiagonalSize = 21; // forward diagonal resize (/)
const StdCursor_BackwardDiagonalSize = 22; // backward diagonal resize (\)
const StdCursor_SizeAll = 23; // resize in all directions
const StdCursor_VerticalSplit = 24; // split vertical
const StdCursor_HorizontalSplit = 25; // split horizontal
const StdCursor_Hand = 26; // pointing hand cursor
const StdCursor_PointingHand = StdCursor_Hand; // pointing hand cursor (same as Hand)
const StdCursor_OpenHand = 27; // open hand cursor
const StdCursor_ClosedHand = 28; // closed hand cursor
const StdCursor_SquarePlus = 29; // plus sign into a square (used for zoom in)
const StdCursor_SquareMinus = 30; // minus sign into a square (used for zoom out)
const StdCursor_CirclePlus = 31; // plus sign into a circle (used for zoom in)
const StdCursor_CircleMinus = 32; // minus sign into a circle (used for zoom out)
const StdCursor_Forbidden = 33; // stop cursor
// ----------------------------------------------------------------------------
// EOF pjsr/StdCursor.jsh - Released 2023-08-28T15:24:27Z


