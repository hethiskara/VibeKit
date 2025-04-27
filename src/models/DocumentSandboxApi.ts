// This interface declares all the APIs that the document sandbox runtime ( i.e. code.ts ) exposes to the UI/iframe runtime
export interface DocumentSandboxApi {
    createRectangle(): void;
    fetchFromUrl(url: string): Promise<BrandKitData>;
    suggestFromPrompt(prompt: string): Promise<BrandKitData>;
    createColorPalette(colors: string[]): void;
    createQuote(quote: string): void;
    createLogoIdea(logoIdea: string): void;
    createFocusKeywords(keywords: string[]): void;
}

export interface BrandKitData {
    colorPalette: string[];
    quote: string;
    logoIdea: string;
    fontSuggestion: string;
    focusKeywords: string[];
}
