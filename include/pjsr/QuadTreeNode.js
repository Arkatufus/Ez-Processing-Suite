// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// QuadTreeNode.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/QuadTreeNode.jsh - Released 2023-08-28T15:24:27Z
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
 * Quadtree node structure.
 */
class QuadTreeNode extends Object
{
    constructor( rect, index ) { super(); };
   /*
    * The rectangular region represented by this node.
    */
    rect = rect ? rect : { x0: 0, y0: 0, x1: 0, y1: 0 };
   /*
    * Child nodes
    */
    nw = null; // North-West child node, representing the top-left subregion.
    ne = null; // North-East child node, representing the top-right subregion.
    sw = null; // South-West child node, representing the bottom-left subregion.
    se = null; // South-East child node, representing the bottom-right subregion.
   /*
    * The index of the objects represented by this node.
    */
    index = index ? index : [];
   /*
    * Returns true iff this is a leaf quadtree node. A leaf node does not
    * contain child nodes, that is, there is no further subdivision of the
    * domain space beyond a leaf quadtree node.
    *
    * In a healthy quadtree (as any QuadTree structure should be under normal
    * working conditions), you can expect any leaf node to contain a nonempty
    * object index.
    */
    isLeaf() { };
   /*
    * Returns true iff the rectangular region represented by this node
    * intersects the specified rectangle 'r'.
    */
    intersects( r ) { };
   /*
    * Returns true iff the rectangular region represented by this node
    * includes the specified point 'p' in the plane.
    */
    includes( p ) { };
   /*
    * Returns the Northwest (top left) splitting rectangle for this node.
    */
    nwRect() { };
   /*
    * Returns the Northeast (top right) splitting rectangle for this node.
    */
    neRect() { };
   /*
    * Returns the Southwest (bottom left) splitting rectangle for this node.
    */
    swRect() { };
   /*
    * Returns the Southeast (bottom right) splitting rectangle for this
    * node.
    */
    seRect() { };
}


// ----------------------------------------------------------------------------
// EOF pjsr/QuadTreeNode.jsh - Released 2023-08-28T15:24:27Z


