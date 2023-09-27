// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// KeyCodes.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/KeyCodes.jsh - Released 2023-08-28T15:24:27Z
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
 * Key codes on the PixInsight/PCL platform
 */
const Key_Backspace = 0x00000008;
const Key_Tab = 0x00000009;
const Key_Clear = 0x0000000c;
const Key_Return = 0x0000000d;
const Key_Enter = 0x0000000d;
const Key_Escape = 0x0000001b;
const Key_Shift = 0x70000001;
const Key_Control = 0x70000002;
const Key_Alt = 0x70000003;
const Key_Meta = 0x70000004;
const Key_CapsLock = 0x70000010;
const Key_NumLock = 0x70000020;
const Key_ScrollLock = 0x70000030;
const Key_Pause = 0x70000100;
const Key_Print = 0x70000200;
const Key_Help = 0x70000300;
const Key_SysReq = 0x70000400;
const Key_Left = 0x10000001;
const Key_Up = 0x10000002;
const Key_Right = 0x10000003;
const Key_Down = 0x10000004;
const Key_Insert = 0x10000010;
const Key_Delete = 0x10000020;
const Key_Home = 0x10000100;
const Key_End = 0x10000200;
const Key_PageUp = 0x10000300;
const Key_PageDown = 0x10000400;
const Key_F1 = 0x08000001;
const Key_F2 = 0x08000002;
const Key_F3 = 0x08000003;
const Key_F4 = 0x08000004;
const Key_F5 = 0x08000005;
const Key_F6 = 0x08000006;
const Key_F7 = 0x08000007;
const Key_F8 = 0x08000008;
const Key_F9 = 0x08000009;
const Key_F10 = 0x0800000a;
const Key_F11 = 0x0800000b;
const Key_F12 = 0x0800000c;
const Key_F13 = 0x0800000d;
const Key_F14 = 0x0800000e;
const Key_F15 = 0x0800000f;
const Key_F16 = 0x08000010;
const Key_F17 = 0x08000020;
const Key_F18 = 0x08000030;
const Key_F19 = 0x08000040;
const Key_F20 = 0x08000050;
const Key_F21 = 0x08000060;
const Key_F22 = 0x08000070;
const Key_F23 = 0x08000080;
const Key_F24 = 0x08000090;
const Key_Space = 0x00000020;
const Key_Exclamation = 0x00000021;
const Key_DoubleQuote = 0x00000022;
const Key_NumberSign = 0x00000023;
const Key_Dollar = 0x00000024;
const Key_Percent = 0x00000025;
const Key_Ampersand = 0x00000026;
const Key_Apostrophe = 0x00000027;
const Key_LeftParenthesis = 0x00000028;
const Key_RightParenthesis = 0x00000029;
const Key_Asterisk = 0x0000002a;
const Key_Plus = 0x0000002b;
const Key_Comma = 0x0000002c;
const Key_Minus = 0x0000002d;
const Key_Period = 0x0000002e;
const Key_Slash = 0x0000002f;
const Key_Zero = 0x00000030;
const Key_One = 0x00000031;
const Key_Two = 0x00000032;
const Key_Three = 0x00000033;
const Key_Four = 0x00000034;
const Key_Five = 0x00000035;
const Key_Six = 0x00000036;
const Key_Seven = 0x00000037;
const Key_Eight = 0x00000038;
const Key_Nine = 0x00000039;
const Key_Colon = 0x0000003a;
const Key_Semicolon = 0x0000003b;
const Key_Less = 0x0000003c;
const Key_Equal = 0x0000003d;
const Key_Greater = 0x0000003e;
const Key_Question = 0x0000003f;
const Key_At = 0x00000040;
const Key_A = 0x00000041;
const Key_B = 0x00000042;
const Key_C = 0x00000043;
const Key_D = 0x00000044;
const Key_E = 0x00000045;
const Key_F = 0x00000046;
const Key_G = 0x00000047;
const Key_H = 0x00000048;
const Key_I = 0x00000049;
const Key_J = 0x0000004a;
const Key_K = 0x0000004b;
const Key_L = 0x0000004c;
const Key_M = 0x0000004d;
const Key_N = 0x0000004e;
const Key_O = 0x0000004f;
const Key_P = 0x00000050;
const Key_Q = 0x00000051;
const Key_R = 0x00000052;
const Key_S = 0x00000053;
const Key_T = 0x00000054;
const Key_U = 0x00000055;
const Key_V = 0x00000056;
const Key_W = 0x00000057;
const Key_X = 0x00000058;
const Key_Y = 0x00000059;
const Key_Z = 0x0000005a;
const Key_LeftBracket = 0x0000005b;
const Key_Backslash = 0x0000005c;
const Key_RightBracket = 0x0000005d;
const Key_Circumflex = 0x0000005e;
const Key_Underscore = 0x0000005f;
const Key_LeftQuote = 0x00000060;
const Key_LeftBrace = 0x0000007b;
const Key_Bar = 0x0000007c;
const Key_RightBrace = 0x0000007d;
const Key_Tilde = 0x0000007e;
const Key_Unknown = 0x7fffffff;
// ----------------------------------------------------------------------------
// EOF pjsr/KeyCodes.jsh - Released 2023-08-28T15:24:27Z


