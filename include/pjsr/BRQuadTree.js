// PixInsight JavaScript Runtime stub
// ----------------------------------------------------------------------------
// BRQuadTree.js - Released 9/25/2023 1:51:58 PM
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
// pjsr/BRQuadTree.jsh - Released 2023-08-28T15:24:27Z
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
 * Bucket rectangle quadtree.
 *
 * A quadtree (Ref. 1) is a specialized binary search tree for partitioning of
 * a set of two-dimensional objects in two dimensions. Quadtrees have important
 * applications in computational geometry problems requiring efficient
 * rectangular range searching and nearest neighbor queries. This object
 * implements a bucket rectangle quadtree structure (Ref. 2).
 *
 * Let o be any object stored in a BRQuadTree structure. There must exist an
 * o.rect property which stores the coordinates of the rectangular region
 * associated with o. The following numeric properties must be defined:
 *
 * o.rect.x0    Left coordinate.
 * o.rect.y0    Top coordinate.
 * o.rect.x1    Right coordinate.
 * o.rect.y1    Bottom coordinate.
 *
 * where the following constraints must be observed by every object stored in
 * a BRQuadTree structure:
 *
 * o.rect.x0 <= o.rect.x1
 * o.rect.y0 <= o.rect.y1
 *
 * References:
 *
 * 1. Mark de Berg et al, Computational Geometry: Algorithms and Applications
 *    Third Edition, Springer, 2010, Chapter 14.
 *
 * 2. Hanan Samet, Foundations of Multidimensional and Metric Data Structures,
 *    Morgan Kaufmann, 2006, Section 3.4.
 */
class BRQuadTree extends Object
{
    constructor( objects, bucketCapacity, epsilon ) { super(); };
    buildTree( rect, index ) { };
    insertTree( x, node ) { };
    removeTree( x, node ) { };
    removeTreeAtPoint( p, node ) { };
    removeTreeAtRect( rect, node ) { };
    searchTree( found, rect, node ) { };
    minDistTree( r, rect, includeRect, excludeRect, node ) { };
    sumDistTree( r, rect, includeRect, excludeRect, node ) { };
    searchTreeWithCallback( rect, callback, data, node ) { };
   /*
    * Builds a new quadtree for the specified list of objects.
    *
    * objects           Array of objects that will be stored in this quadtree.
    *
    * bucketCapacity    The maximum number of objects allowed in a leaf
    *                   quadtree node. If specified and not undefined, must
    *                   be >= 1. The default value is 16.
    *
    * rect              If specified and not undefined, this is the prescribed
    *                   rectangular search region. Otherwise the search region
    *                   will be computed automatically.
    *
    * If the tree already stores objects before calling this function, they are
    * removed before building a new tree.
    *
    * If the specified list of objects is empty, this method yields an empty
    * quadtree.
    */
    build( objects, bucketCapacity, rect ) { };
   /*
    * Inserts a reference to the specified object in this quadtree.
    */
    insert( object ) { };
   /*
    * Removes all existing references to the specified object in this quadtree.
    */
    remove( object ) { };
   /*
    * Removes all objects whose associated rectangular regions include the
    * specified point.
    */
    removeAtPoint( point ) { };
   /*
    * Removes all objects whose associated rectangular regions intersect the
    * specified region.
    */
    removeAtRect( rect ) { };
   /*
    * Regenerates the quadtree structure without null object references.
    *
    * Calling this function is useful to optimize the quadtree after a
    * significant amount of object deletions.
    */
    regenerate( bucketCapacity, rect ) { };
   /*
    * Removes all stored objects, as well as the tree structure, yielding an
    * empty quadtree.
    */
    clear() { };
   /*
    * Performs a rectangular range search in this quadtree.
    *
    * rect     The rectangular search region.
    *
    * Returns a (possibly empty) array with the index of all objects found in
    * this tree within the specified search region.
    *
    * Let A be the array returned by this function. Then the set of objects
    * found within the specified rectangular region is given by:
    *
    * this.objects[A[0]], this.objects[A[1]], ..., this.objects[A.length-1]
    */
    search( rect ) { };
   /*
    * Performs a rectangular range search in this quadtree, enumerating all
    * objects found with a callback function.
    *
    * rect       The rectangular search region.
    *
    * callback   Callback function.
    *
    * data       Callback data (optional, undefined by default).
    *
    * The callback function prototype should be:
    *
    * void callback( object, data )
    *
    * The callback function will be called once for each object found in the
    * tree within the specified search region.
    */
    searchWithCallback( rect, callback, data ) { };
   /*
    * Performs a recursive tree traversal.
    *
    * The specified function should be of the form:
    *
    * void func( node )
    *
    * The function will be called for each leaf node in this quadtree.
    */
    traverse( func ) { };
   /*
    * Returns the tree node (either leaf or structural) intersecting the
    * specified point, or null if no such node exists in this quadtree.
    */
    nodeAt( point ) { };
   /*
    * Returns the leaf node intersecting the specified point, or null if no
    * such leaf node exists in this quadtree.
    */
    leafNodeAt( point ) { };
   /*
    * Returns the minimum distance between the specified rectangle and the
    * rectangles associated with all objects found at a prescribed maximum
    * distance.
    *
    * This function computes the minimum distance exclusively for all objects
    * in this quadtree intersecting the search rectangle:
    *
    * { x0: rect.x0 - dx, y0: rect.y0 - dy,
    *   x1: rect.x1 + dx, y1: rect.y1 + dy }
    *
    * If excludeRect is specified and not undefined, any object intersecting it
    * will also be ignored.
    *
    * If there are no objects intersecting the search rectangle, or if at least
    * one object intersects the search rectangle, the return value is zero.
    */
    minDist( rect, dx, dy, excludeRect ) { };
   /*
    * Returns the average distance between the specified rectangle and and the
    * rectangles associated with all objects found at a prescribed maximum
    * distance.
    *
    * This function computes the average distance exclusively for all objects
    * in this quadtree intersecting the search rectangle:
    *
    * { x0: rect.x0 - dx, y0: rect.y0 - dy,
    *   x1: rect.x1 + dx, y1: rect.y1 + dy }
    *
    * If excludeRect is specified and not undefined, any object intersecting it
    * will also be ignored.
    *
    * If there are no objects intersecting the search rectangle, the return
    * value is zero.
    */
    avgDist( rect, dx, dy, excludeRect ) { };
   /*
    * Returns true iff this object represents a valid quadtree structure. The
    * returned value is true if the quadtree has at least a non-null root node.
    */
    isTree() { };
   /*
    * Returns true iff this quadtree does not reference any objects.
    */
    isEmpty() { };
   /*
    * Returns the total number of leaf nodes in this quadtree.
    */
    numberOfLeafNodes() { };
   /*
    * Returns the total number of nodes in this quadtree.
    */
    numberOfNodes() { };
   /*
    * Returns the height of this quadtree, or the maximum distance in nodes
    * from the root node to a leaf node.
    */
    height() { };
   /*
    * The root node of this quadtree.
    */
    root = null;
   /*
    * The current bucket capacity. This is the maximum number of objects
    * allowed in a leaf quadtree node.
    */
    bucketCapacity = (bucketCapacity > 0) ? bucketCapacity : 40;
   /*
    * The minimum allowed dimension of a node region.
    */
    epsilon = epsilon ? Math.max( 2*Math.EPSILON, epsilon ) : 1.0e-8;
   /*
    * The array of object references stored in this quadtree.
    */
    objects = [];
}


// ----------------------------------------------------------------------------
// EOF pjsr/BRQuadTree.jsh - Released 2023-08-28T15:24:27Z


