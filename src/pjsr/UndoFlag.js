/*
 * Undo flags recognized by View.beginProcess()
 *
 * ### N.B.: These values must be coherent with the constants defined in the
 *           pcl::UndoFlag namespace, with the only exception of
 *           UndoFlag_NoSwapFile, which is private to PJSR.
 */

const UndoFlag_DefaultMode          = 0x00000000 // Save pixel data, astrometric solution and previews.
const UndoFlag_PixelData            = 0x00000001 // Save pixel data.
const UndoFlag_RGBWS                = 0x00000002 // RGB Working Space data.
const UndoFlag_ICCProfile           = 0x00000004 // ICC profile.
const UndoFlag_Keywords             = 0x00000008 // FITS keywords.
//const UndoFlag_Metadata           = 0x00000010 // *deprecated* - Keep unused for now, for compatibility with existing projects.
const UndoFlag_FormatData           = 0x00000020 // Format-specific data.
const UndoFlag_ImageId              = 0x00000040 // Image identifier.
const UndoFlag_Resolution           = 0x00000080 // Image resolution.
const UndoFlag_AstrometricSolution  = 0x00000100 // Save the current astrometric solution.
const UndoFlag_All                  = 0x000FFFFF // Save all data items.
const UndoFlag_ExcludePreviews      = 0x80000000 // Don't save state of previews.
const UndoFlag_ExcludeMaskRelations = 0x40000000 // Don't save masking dependencies.
const UndoFlag_NoSwapFile           = 0xFFFFFFFF // Don't create a swap file.