class Image {
    get bitsPerSample(): number { return 1; }
    get bounds(): Rect { return new Rect; }
    colorSpace: number;
    firstSelectedChannel: number;
    get hasAlphaChannels(): boolean { return false; }
    get height(): number { return 1; };
    highRangeClippingEnabled: boolean;
    interpolation: number;
    interpolationClamping: number;
    interpolationSmoothness: number;
    interpolationXRadius: number;
    interpolationYRadius: number;
    get isColor(): boolean { return false; }
    get isComplex(): boolean { return false; }
    get isEmpty(): boolean { return false; }
    get isGrayscale(): boolean { return false; }
    get isInteger(): boolean { return false; }
    get isReal(): boolean { return false; }
    get isStatusCompleted(): boolean { return false; }
    get isStatusInitialized(): boolean { return false; }
    lastSelectedChannel: number;
    lowRangeClippingEnabled: boolean;
    get numberOfAlphaChannels(): number { return 1; }
    get numberOfAlphaSamples(): number { return 1; }
    get numberOfChannels(): number { return 1; }
    get numberOfNominalChannels(): number { return 1; }
    get numberOfNominalSamples(): number { return 1; }
    get numberOfPixels(): number { return 1; }
    get numberOfSelectedChannels(): number { return 1; }
    get numberOfSelectedPixels(): number { return 1; }
    get numberOfSelectedSamples(): number { return 1; }
    rangeClipHigh: number;
    rangeClipLow: number;
    rangeClippingEnabled: boolean;
    get sampleType(): number { return 1; }
    selectedChannel: number;
    selectedPoint: Point;
    selectedRect: Rect;
    selectionPoint: Point;
    get statusCount(): number { return 1; }
    statusEnabled: boolean;
    statusInfo: string;
    statusInitializationEnabled: boolean;
    get statusTotal(): number { return 1; }
    get width(): number { return 1; }
}