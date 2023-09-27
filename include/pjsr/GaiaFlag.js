// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// GaiaFlag.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/GaiaFlag.jsh - Released 2023-08-28T15:24:27Z
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

const GaiaFlag_NoPM = 0x00000001;
const GaiaFlag_NoGBPMag = 0x00000002;
const GaiaFlag_NoGRPMag = 0x00000004;
const GaiaFlag_LackingData = 0x00000007;
const GaiaFlag_GoldRA = 0x00000010;
const GaiaFlag_GoldDec = 0x00000020;
const GaiaFlag_GoldPMRA = 0x00000040;
const GaiaFlag_GoldPMDec = 0x00000080;
const GaiaFlag_SilverRA = 0x00000100;
const GaiaFlag_SilverDec = 0x00000200;
const GaiaFlag_SilverPMRA = 0x00000400;
const GaiaFlag_SilverPMDec = 0x00000800;
const GaiaFlag_BronzeRA = 0x00001000;
const GaiaFlag_BronzeDec = 0x00002000;
const GaiaFlag_BronzePMRA = 0x00004000;
const GaiaFlag_BronzePMDec = 0x00008000;
const GaiaFlag_GoldGMag = 0x00010000;
const GaiaFlag_GoldGBPMag = 0x00020000;
const GaiaFlag_GoldGRPMag = 0x00040000;
const GaiaFlag_GoldParx = 0x00080000;
const GaiaFlag_SilverGMag = 0x00100000;
const GaiaFlag_SilverGBPMag = 0x00200000;
const GaiaFlag_SilverGRPMag = 0x00400000;
const GaiaFlag_SilverParx = 0x00800000;
const GaiaFlag_BronzeGMag = 0x01000000;
const GaiaFlag_BronzeGBPMag = 0x02000000;
const GaiaFlag_BronzeGRPMag = 0x04000000;
const GaiaFlag_BronzeParx = 0x08000000;
const GaiaFlag_BPRPExcess = 0x10000008;
const GaiaFlag_BPRPExcessHigh = 0x20000000;
const GaiaFlag_GoldAstrometry = 0x000800F0;
const GaiaFlag_SilverAstrometry = 0x00800F00;
const GaiaFlag_BronzeAstrometry = 0x0800F000;
const GaiaFlag_GoodAstrometry = 0x0888FFF0;
const GaiaFlag_GoldPhotometry = 0x00070000;
const GaiaFlag_SilverPhotometry = 0x00700000;
const GaiaFlag_BronzePhotometry = 0x07000000;
const GaiaFlag_GoodPhotometry = 0x07770000;
// ----------------------------------------------------------------------------
// EOF pjsr/GaiaFlag.jsh - Released 2023-08-28T15:24:27Z


