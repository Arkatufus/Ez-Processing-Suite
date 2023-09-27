// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// Homography.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/Homography.jsh - Released 2023-08-28T15:24:27Z
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
 * Homography geometric transformation.
 *
 * A two-dimensional projective transformation, or homography, is a
 * line-preserving geometric transformation between two sets of points in the
 * plane. More formally, if P represents the set of points in the plane, a
 * homography is an invertible mapping H from P^2 to itself such that three
 * points p1, p2, p3 are collinear if and only if H(p1), H(p2), H(p3) do.
 *
 * Homographies have important practical applications in the field of computer
 * vision. On the PixInsight platform, this class is an essential component of
 * image registration and astrometry processes.
 *
 * A Homography object can be constructed in three ways:
 *
 * new Homography( Array P1, Array P2 )
 *
 *    Constructor from two 2D point lists. Each element in the P1 and P2 arrays
 *    must have x and y numeric properties. There can be undefined array
 *    elements, but at least 4 defined point pairs are required.
 *
 *    This constructor computes a homography transformation to generate a list
 *    P2 of transformed points from a list P1 of original points. In other
 *    words, the computed homography H works as follows:
 *
 *    P2 = H( P1 )
 *
 *    The transformation matrix is calculated by the Direct Linear
 *    Transformation (DLT) method (see Reference 1). Both point lists must
 *    contain at least four points. If one of the specified point lists
 *    contains less than four points, or if no homography can be estimated from
 *    the specified point lists (which leads to a singular transformation
 *    matrix), this constructor throws an Error exception.
 *
 * new Homography( Matrix H )
 *
 *    Constructs a homography with a prescribed transformation matrix H.
 *
 * new Homography()
 *
 *    Constructs an uninitialized object.
 *
 * References:
 *
 * 1. R. Hartley, In defense of the eight-point algorithm. IEEE Transactions on
 *    Pattern Analysis and Machine Intelligence, vol. 19, pp. 580–593, June
 *    1997.
 */
class Homography extends Object
{
    constructor( P1, P2 ) { super(); };
   /*
    * Coordinate transformation. Applies this homography to the specified point
    * p, which must have x and y numeric properties. Returns a new point with
    * the transformed x and y coordinates.
    */
    apply( p ) { };
   /*
    * Returns the inverse of this transformation. If this transformation has
    * been computed from two point lists P1 and P2:
    *
    * P2 = H( P1 )
    *
    * then this function returns a transformation H1 such that:
    *
    * P1 = H1( P2 )
    */
    inverse() { };
   /*
    * Returns true iff this transformation has been initialized.
    */
    isValid() { };
   /*
    * Returns true iff this is an affine homography transformation.
    *
    * An affine homography is a special type of a general homography where the
    * last row of the 3x3 transformation matrix is equal to (0, 0, 1). This
    * function verifies that this property holds for the current transformation
    * matrix (if it is valid) up to the machine epsilon for the 64-bit floating
    * point type.
    */
    isAffine() { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/Homography.jsh - Released 2023-08-28T15:24:27Z


