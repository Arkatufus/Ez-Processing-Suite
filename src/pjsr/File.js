// Copyright (C) 2023 Gregorius Soedharmo (aka Arkatufus)

//     ____   ______ __
//    / __ \ / ____// /
//   / /_/ // /    / /
//  / ____// /___ / /___   PixInsight Class Library
// /_/     \____//_____/   PCL 2.4.29
// ----------------------------------------------------------------------------
// pcl/ByteArray.h - Released 2022-05-17T17:14:45Z
// ----------------------------------------------------------------------------
// This file is part of the PixInsight Class Library (PCL).
// PCL is a multiplatform C++ framework for development of PixInsight modules.
//
// Copyright (c) 2003-2022 Pleiades Astrophoto S.L. All Rights Reserved.
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
 * File mode.
 */
const FileMode_Read = 0x00000001;
const FileMode_Write = 0x00000002;
const FileMode_AccessMode = 0x0000000F;
const FileMode_ShareRead = 0x00000010;
const FileMode_ShareWrite = 0x00000020;
const FileMode_ShareMode = 0x000000F0;
const FileMode_Open = 0x00000100;
const FileMode_Create = 0x00000200;
const FileMode_OpenMode = 0x00000F00;

/*
 * Seek mode.
 */
const SeekMode_FromBegin = 0;
const SeekMode_FromCurrent = 1;
const SeekMode_FromEnd = 2;

/*
 * File type.
 */
const FileType_Block          = 0x00000001;  // Block special
const FileType_Character      = 0x00000002;  // Character special
const FileType_FIFO           = 0x00000004;  // FIFO special
const FileType_Regular        = 0x00000008;  // Regular file
const FileType_Directory      = 0x00000010;  // Directory
const FileType_SymbolicLink   = 0x00000020;  // Symbolic link
const FileType_Socket         = 0x00000040;  // Socket
const FileType_Mask           = 0x000000FF;

/*
 * File attributes.
 * These are Windows-exclusive; except ReadOnly and Hidden; which we
 * emulate on UNIX and Linux.
 */
const FileAttribute_Archive        = 0x00001000;  // File is archived
const FileAttribute_Compressed     = 0x00002000;  // File is compressed
const FileAttribute_Encrypted      = 0x00004000;  // File is encrypted
const FileAttribute_Hidden         = 0x00008000;  // File is hidden
const FileAttribute_ReadOnly       = 0x00010000;  // File is read-only
const FileAttribute_System         = 0x00020000;  // File is a system file
const FileAttribute_Temporary      = 0x00040000;  // File is a temporary file
const FileAttribute_Mask           = 0x000FF000;

/*
 * File permissions.
 */
const FilePermissions_Read           = 0x00100000;  // Owner can read
const FilePermissions_Write          = 0x00200000;  // Owner can write
const FilePermissions_Execute        = 0x00400000;  // Owner can execute/search
const FilePermissions_ReadGroup      = 0x01000000;  // Group can read
const FilePermissions_WriteGroup     = 0x02000000;  // Group can write
const FilePermissions_ExecuteGroup   = 0x04000000;  // Group can execute/search
const FilePermissions_ReadOthers     = 0x10000000;  // Others can read
const FilePermissions_WriteOthers    = 0x20000000;  // Others can write
const FilePermissions_ExecuteOthers  = 0x40000000;  // Others can execute/search
const FilePermissions_Mask           = 0xFFF00000;

/*
 * Read text option
 */
const ReadTextOption_RemoveEmptyLines   = 0x0001;
const ReadTextOption_TrimTrailingSpaces = 0x0002;
const ReadTextOption_TrimLeadingSpaces  = 0x0004;

class File
{
    // TODO: Incomplete

    static appendToName(filePath: string, postFix: string): string { return ""; }
    static changeExtension(filePath: string, newExt: string): string { return ""; }
    static changeSuffix(filePath: string, newExt: string): string { return ""; }

}
