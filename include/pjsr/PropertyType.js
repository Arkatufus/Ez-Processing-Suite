// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// PropertyType.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/PropertyType.jsh - Released 2023-08-28T15:24:27Z
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
 * Data types recognized by View.setPropertyValue(), View.propertyType(), and
 * FileFormatInstance.writeProperty().
 *
 * N.B.: The values of these macros must be the same used in pcl::Variant, as
 * defined by the pcl::VariantType namespace.
 */
const PropertyType_Invalid = 0; // Invalid value type
const PropertyType_Auto = 0; // Automatic type detection
const PropertyType_Boolean = 1; // Native Boolean type
const PropertyType_Int8 = 2; // 8-bit signed integer
const PropertyType_Int16 = 3; // 16-bit signed integer
const PropertyType_Short = PropertyType_Int16;
const PropertyType_Int32 = 4; // 32-bit signed integer
const PropertyType_Int = PropertyType_Int32;
const PropertyType_Int64 = 5; // 64-bit signed integer
const PropertyType_UInt8 = 6; // 8-bit unsigned integer
const PropertyType_Byte = PropertyType_UInt8;
const PropertyType_UInt16 = 7; // 16-bit unsigned integer
const PropertyType_UShort = PropertyType_UInt16;
const PropertyType_UInt32 = 8; // 32-bit unsigned integer
const PropertyType_UInt = PropertyType_UInt32;
const PropertyType_UInt64 = 9; // 64-bit unsigned integer
const PropertyType_Float32 = 10; // 32-bit IEEE 754 floating point real (float)
const PropertyType_Real32 = PropertyType_Float32;
const PropertyType_Float64 = 11; // 64-bit IEEE 754 floating point real (double)
const PropertyType_Real64 = PropertyType_Float64;
const PropertyType_Complex32 = 12; // 32-bit IEEE 754 floating point complex
const PropertyType_Complex64 = 13; // 64-bit IEEE 754 floating point complex
const PropertyType_TimePoint = 14;
const PropertyType_I8Vector = 21; // Vector of 8-bit signed integers
const PropertyType_UI8Vector = 22; // Vector of 8-bit unsigned integers
const PropertyType_ByteVector = PropertyType_UI8Vector;
const PropertyType_I16Vector = 23; // Vector of 16-bit signed integers
const PropertyType_ShortVector = PropertyType_I16Vector;
const PropertyType_UI16Vector = 24; // Vector of 16-bit unsigned integers
const PropertyType_UShortVector = PropertyType_UI16Vector;
const PropertyType_I32Vector = 25; // Vector of 32-bit signed integers
const PropertyType_IVector = PropertyType_I32Vector;
const PropertyType_UI32Vector = 26; // Vector of 32-bit unsigned integers
const PropertyType_UIVector = PropertyType_UI32Vector;
const PropertyType_I64Vector = 27; // Vector of 64-bit signed integers
const PropertyType_UI64Vector = 28; // Vector of 64-bit unsigned integers
const PropertyType_F32Vector = 29; // Vector of 32-bit floating point real values
const PropertyType_F64Vector = 30; // Vector of 64-bit floating point real values
const PropertyType_C32Vector = 31; // Vector of 32-bit floating point complex values
const PropertyType_C64Vector = 32; // Vector of 64-bit floating point complex values
const PropertyType_I8Matrix = 33; // Matrix of 8-bit signed integers
const PropertyType_UI8Matrix = 34; // Matrix of 8-bit unsigned integers
const PropertyType_ByteMatrix = PropertyType_UI8Matrix;
const PropertyType_I16Matrix = 35; // Matrix of 16-bit signed integers
const PropertyType_ShortMatrix = PropertyType_I16Matrix;
const PropertyType_UI16Matrix = 36; // Matrix of 16-bit unsigned integers
const PropertyType_UShortMatrix = PropertyType_UI16Matrix;
const PropertyType_I32Matrix = 37; // Matrix of 32-bit signed integers
const PropertyType_IMatrix = PropertyType_I32Matrix;
const PropertyType_UI32Matrix = 38; // Matrix of 32-bit unsigned integers
const PropertyType_UIMatrix = PropertyType_UI32Matrix;
const PropertyType_I64Matrix = 39; // Matrix of 64-bit signed integers
const PropertyType_UI64Matrix = 40; // Matrix of 64-bit unsigned integers
const PropertyType_F32Matrix = 41; // Matrix of 32-bit floating point real values
const PropertyType_F64Matrix = 42; // Matrix of 64-bit floating point real values
const PropertyType_C32Matrix = 43; // Matrix of 32-bit floating point complex values
const PropertyType_C64Matrix = 44; // Matrix of 64-bit floating point complex values
const PropertyType_ByteArray = 45; // Native pcl::ByteArray type
const PropertyType_String16 = 46; // Unicode string (16-bit characters)
const PropertyType_String = PropertyType_String16;
const PropertyType_UCString = PropertyType_String16;
const PropertyType_UTF16String = PropertyType_String16;
const PropertyType_String8 = 47; // ISO/IEC 8859-1 or UTF-8 string (8-bit characters)
const PropertyType_IsoString = PropertyType_String8;
const PropertyType_UTF8String = PropertyType_String8;
// ----------------------------------------------------------------------------
// EOF pjsr/PropertyType.jsh - Released 2023-08-28T15:24:27Z


