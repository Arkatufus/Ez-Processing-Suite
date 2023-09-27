// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// ImageOp.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/ImageOp.jsh - Released 2023-08-28T15:24:27Z
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
 * Image operations supported by Image.apply()
 */
const ImageOp_Nop = 0; // No operation
const ImageOp_Mov = 1; // a = b
const ImageOp_Add = 2; // a + b
const ImageOp_Sub = 3; // a - b
const ImageOp_Mul = 4; // a * b
const ImageOp_Div = 5; // a / b
const ImageOp_Pow = 6; // Pow( a b )
const ImageOp_Dif = 7; // |a - b|
const ImageOp_Min = 8; // Min( a b )
const ImageOp_Max = 9; // Max( a b )
const ImageOp_Or = 10; // a | b
const ImageOp_And = 11; // a & b
const ImageOp_Xor = 12; // a ^ b
const ImageOp_Not = 13; // ~a
const ImageOp_Nor = 14; // ~(a | b)
const ImageOp_Nand = 15; // ~(a & b)
const ImageOp_Xnor = 16; // ~(a ^ b)
const ImageOp_ColorBurn = 17; // 1 - Min( (1 - a)/b 1 )
const ImageOp_LinearBurn = 18; // a + b - 1
const ImageOp_Screen = 19; // 1 - (1 - a)*(1 - b)
const ImageOp_ColorDodge = 20; // Min( a/(1 - b) 1 )
const ImageOp_Overlay = 21; // (a > 0.5) ? 1 - ((1 - 2*(a - 0.5)) * (1 - b)) : 2*a*b
const ImageOp_SoftLight = 22; // (b > 0.5) ? 1 - (1 - a)*(1 - b - 0.5) : a*(b + 0.5)
const ImageOp_HardLight = 23; // (b > 0.5) ? 1 - (1 - a)*(1 - 2*(b - 0.5)) : 2*a*b
const ImageOp_VividLight = 24; // (b > 0.5) ? 1 - Max( (1 - a)/(b - 0.5)/2 1.0 ) : Min( a/(1 - 2*b ) 1.0 )
const ImageOp_LinearLight = 25; // (b > 0.5) ? Max( a + 2*(b - 0.5) 1.0 ) : Max( a + 2*b - 1 1.0 )
const ImageOp_PinLight = 26; // (b > 0.5) ? Max( a 2*(b - 0.5) ) : Min( a 2*b )
const ImageOp_Exclusion = 27; // 0.5 - 2*(a - 0.5)*(b - 0.5)
// ----------------------------------------------------------------------------
// EOF pjsr/ImageOp.jsh - Released 2023-08-28T15:24:27Z


