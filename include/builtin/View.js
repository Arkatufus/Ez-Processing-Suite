/*
 * Property attributes
 */
const PropertyAttribute_WriteProtected  = 0x00000001;
const PropertyAttribute_ReadProtected   = 0x00000002;
const PropertyAttribute_Volatile        = 0x00000010;
const PropertyAttribute_Permanent       = 0x00000020;
const PropertyAttribute_NotSerializable = 0x00000040;
const PropertyAttribute_Storable        = 0x00000080;
const PropertyAttribute_Reserved        = 0x10000000;
const PropertyAttribute_Protected       = 0x20000000;
const PropertyAttribute_NoChange        = 0x80000000;

/*
 * Property types
 */
const  PropertyType_Invalid        = 0 // Invalid value type
const  PropertyType_Auto           = 0 // Automatic type detection
const  PropertyType_Boolean        = 1 // Native Boolean type
const  PropertyType_Int8           = 2 // 8-bit signed integer
const  PropertyType_Int16          = 3 // 16-bit signed integer
const  PropertyType_Short          = PropertyType_Int16
const  PropertyType_Int32          = 4 // 32-bit signed integer
const  PropertyType_Int            = PropertyType_Int32
const  PropertyType_Int64          = 5 // 64-bit signed integer
const  PropertyType_UInt8          = 6 // 8-bit unsigned integer
const  PropertyType_Byte           = PropertyType_UInt8
const  PropertyType_UInt16         = 7 // 16-bit unsigned integer
const  PropertyType_UShort         = PropertyType_UInt16
const  PropertyType_UInt32         = 8 // 32-bit unsigned integer
const  PropertyType_UInt           = PropertyType_UInt32
const  PropertyType_UInt64         = 9 // 64-bit unsigned integer
const  PropertyType_Float32        = 10 // 32-bit IEEE 754 floating point real (float)
const  PropertyType_Real32         = PropertyType_Float32
const  PropertyType_Float64        = 11 // 64-bit IEEE 754 floating point real (double)
const  PropertyType_Real64         = PropertyType_Float64
const  PropertyType_Complex32      = 12 // 32-bit IEEE 754 floating point complex
const  PropertyType_Complex64      = 13 // 64 bit IEEE 754 floating point complex
const  PropertyType_TimePoint      = 14
const  PropertyType_I8Vector       = 21 // Vector of 8-bit signed integers
const  PropertyType_UI8Vector      = 22 // Vector of 8-bit unsigned integers
const  PropertyType_ByteVector     = PropertyType_UI8Vector
const  PropertyType_I16Vector      = 23 // Vector of 16-bit signed integers
const  PropertyType_ShortVector    = PropertyType_I16Vector
const  PropertyType_UI16Vector     = 24 // Vector of 16-bit unsigned integers
const  PropertyType_UShortVector   = PropertyType_UI16Vector
const  PropertyType_I32Vector      = 25 // Vector of 32-bit signed integers
const  PropertyType_IVector        = PropertyType_I32Vector
const  PropertyType_UI32Vector     = 26 // Vector of 32-bit unsigned integers
const  PropertyType_UIVector       = PropertyType_UI32Vector
const  PropertyType_I64Vector      = 27 // Vector of 64-bit signed integers
const  PropertyType_UI64Vector     = 28 // Vector of 64-bit unsigned integers
const  PropertyType_F32Vector      = 29 // Vector of 32-bit floating point real values
const  PropertyType_F64Vector      = 30 // Vector of 64-bit floating point real values
const  PropertyType_C32Vector      = 31 // Vector of 32-bit floating point complex values
const  PropertyType_C64Vector      = 32 // Vector of 64-bit floating point complex values
const  PropertyType_I8Matrix       = 33 // Matrix of 8-bit signed integers
const  PropertyType_UI8Matrix      = 34 // Matrix of 8-bit unsigned integers
const  PropertyType_ByteMatrix     = PropertyType_UI8Matrix
const  PropertyType_I16Matrix      = 35 // Matrix of 16-bit signed integers
const  PropertyType_ShortMatrix    = PropertyType_I16Matrix
const  PropertyType_UI16Matrix     = 36 // Matrix of 16-bit unsigned integers
const  PropertyType_UShortMatrix   = PropertyType_UI16Matrix
const  PropertyType_I32Matrix      = 37 // Matrix of 32-bit signed integers
const  PropertyType_IMatrix        = PropertyType_I32Matrix
const  PropertyType_UI32Matrix     = 38 // Matrix of 32-bit unsigned integers
const  PropertyType_UIMatrix       = PropertyType_UI32Matrix
const  PropertyType_I64Matrix      = 39 // Matrix of 64-bit signed integers
const  PropertyType_UI64Matrix     = 40 // Matrix of 64-bit unsigned integers
const  PropertyType_F32Matrix      = 41 // Matrix of 32-bit floating point real values
const  PropertyType_F64Matrix      = 42 // Matrix of 64-bit floating point real values
const  PropertyType_C32Matrix      = 43 // Matrix of 32-bit floating point complex values
const  PropertyType_C64Matrix      = 44 // Matrix of 64-bit floating point complex values
const  PropertyType_ByteArray      = 45 // Native pcl::ByteArray type
const  PropertyType_String16       = 46 // Unicode string (16-bit characters)
const  PropertyType_String         = PropertyType_String16
const  PropertyType_UCString       = PropertyType_String16
const  PropertyType_UTF16String    = PropertyType_String16
const  PropertyType_String8        = 47 // ISO/IEC-8859-1 or UTF-8 string (8-bit characters)
const  PropertyType_IsoString      = PropertyType_String8
const  PropertyType_UTF8String     = PropertyType_String8

class View
{
    static viewById(id: string): View { return new View; }

    /*
     * Public properties
     */
    get canGoBackward(): boolean { return false; }
    get canGoForward(): boolean { return false; }
    get fullId(): string { return ""; }
    historyIndex: number;
    id: string;
    get image(): Image { return new Image; }
    get initialProcessing(): ProcessContainer { return new ProcessContainer; }
    get isMainView(): boolean { return false; }
    get isNull(): boolean { return false; }
    get isPreview(): boolean { return false; }
    get isView(): boolean { return false; }
    get isVirtual(): boolean { return false; }
    get processing(): ProcessContainer { return new ProcessContainer; }
    properties: Array;
    stf: Array;
    get uniqueId(): string { return ""; }
    get window(): ImageWindow { return new ImageWindow; }

    /*
     * Constructors
     */
    constructor() { }

    constructor(view: View) { }

    constructor(viewId: string) { }

    /*
     * Public methods
     */
    beginProcess(undoFlags: number = 0): void { }
    cancelProcess(): void { }
    computeOrFetchProperty(id: string): Object | null { return null; }
    computeProperty(id: string): Object | null { return  null; }
    deleteProperty(id: string): boolean { return false; }
    endProcess(): void { }
    exportProperties(instance: FileFormatInstance): number { return 1; }
    hasProperty(id: string): boolean { return false; }
    importProperties(instance: FileFormatInstance): string { return ""; }
    propertyAttributes(id: string): number | null { return null; }
    propertyType(id: string): number | null { return null; }
    propertyValue(id: string): Object | null { return null; }
    setPropertyAttributes(id:string, attributes:number): boolean { return false; }
    setPropertyValue(id: string, value: Object, type: number = 0, attributes: number = 0): boolean { return false; }

}