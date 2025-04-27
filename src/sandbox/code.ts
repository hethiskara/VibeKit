import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
import { BrandKitData, DocumentSandboxApi } from "../models/DocumentSandboxApi";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// OpenAI API key
const OPENAI_API_KEY = "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";

// Mock data for GPT suggestions since we can't make API calls from the sandbox
async function getGptSuggestions(prompt: string): Promise<BrandKitData> {
    try {
        console.log(`Getting suggestions from prompt: ${prompt}`);
        
        // In a production environment, we would make an API call to OpenAI
        // For this demo, we'll return mock data based on the prompt
        
        // Simulate different responses based on prompt keywords
        let colorPalette = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];
        let quote = "Innovation distinguishes between a leader and a follower.";
        let logoIdea = "A minimalist design that represents growth and innovation";
        let fontSuggestion = "Roboto";
        let focusKeywords = ["creative", "professional", "unique"];
        
        // Simple keyword matching for demo purposes
        if (prompt.toLowerCase().includes("tech") || prompt.toLowerCase().includes("technology")) {
            colorPalette = ["#0984e3", "#00b894", "#dfe6e9", "#2d3436", "#74b9ff"];
            quote = "Technology is best when it brings people together.";
            logoIdea = "A sleek, modern logo with circuit-like patterns";
            fontSuggestion = "Poppins";
            focusKeywords = ["innovative", "digital", "future-focused"];
        } else if (prompt.toLowerCase().includes("food") || prompt.toLowerCase().includes("restaurant")) {
            colorPalette = ["#d63031", "#fdcb6e", "#00b894", "#6c5ce7", "#e17055"];
            quote = "Good food is the foundation of genuine happiness.";
            logoIdea = "A warm, inviting logo with subtle food iconography";
            fontSuggestion = "Playfair Display";
            focusKeywords = ["delicious", "authentic", "culinary"];
        } else if (prompt.toLowerCase().includes("health") || prompt.toLowerCase().includes("wellness")) {
            colorPalette = ["#55efc4", "#81ecec", "#74b9ff", "#a29bfe", "#dfe6e9"];
            quote = "Health is a state of complete harmony of the body, mind, and spirit.";
            logoIdea = "A balanced, calming logo with natural elements";
            fontSuggestion = "Quicksand";
            focusKeywords = ["wellness", "balance", "vitality"];
        }
        
        return {
            colorPalette,
            quote,
            logoIdea,
            fontSuggestion,
            focusKeywords
        };
    } catch (error) {
        console.error("Error getting suggestions:", error);
        // Return fallback data if there's an error
        return {
            colorPalette: ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"],
            quote: "Innovation distinguishes between a leader and a follower.",
            logoIdea: "A minimalist design that represents growth and innovation",
            fontSuggestion: "Roboto",
            focusKeywords: ["creative", "professional", "unique"]
        };
    }
}

function createColorBox(color: string, x: number, y: number, width: number, height: number) {
    const rectangle = editor.createRectangle();
    rectangle.width = width;
    rectangle.height = height;
    rectangle.translation = { x, y };
    
    // Parse hex color to RGB with validation
    try {
        let hex = color.replace('#', '');
        
        // Handle shorthand hex (e.g., #FFF)
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Ensure we have a valid hex color
        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
            // Use a default color if invalid
            hex = "808080"; // Gray fallback
        }
        
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        const colorFill = editor.makeColorFill({ red: r, green: g, blue: b, alpha: 1 });
        rectangle.fill = colorFill;
    } catch (error) {
        // Fallback to a default color if parsing fails
        console.error("Error parsing color:", color, error);
        const colorFill = editor.makeColorFill({ red: 0.5, green: 0.5, blue: 0.5, alpha: 1 });
        rectangle.fill = colorFill;
    }
    
    const insertionParent = editor.context.insertionParent;
    insertionParent.children.append(rectangle);
    
    return rectangle;
}

function createText(text: string, x: number, y: number, size: number = 24) {
    const textElement = editor.createText();
    textElement.text = text;
    textElement.translation = { x, y };
    
    // We can't directly set font size, but we can add it as a note for the user
    // In a real implementation, we would use the proper API for text styling
    
    const insertionParent = editor.context.insertionParent;
    insertionParent.children.append(textElement);
    
    return textElement;
}

function start(): void {
    // APIs to be exposed to the UI runtime
    // i.e., to the `App.tsx` file of this add-on.
    const sandboxApi: DocumentSandboxApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;

            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };

            // Define rectangle color.
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },
        
        fetchFromUrl: async (url: string) => {
            // This is now handled in the UI component
            // Return a placeholder response
            return {
                colorPalette: ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"],
                quote: `Inspired by ${url}`,
                logoIdea: "A modern, sleek design with geometric elements",
                fontSuggestion: "Montserrat",
                focusKeywords: ["professional", "innovative", "modern"]
            };
        },
        
        suggestFromPrompt: async (prompt: string) => {
            return await getGptSuggestions(prompt);
        },
        
        createColorPalette: (colors: string[]) => {
            const paletteWidth = 500;
            const colorBoxWidth = paletteWidth / colors.length;
            const colorBoxHeight = 100;
            const startY = 10;
            
            // Create color boxes
            colors.forEach((color, index) => {
                const startX = index * colorBoxWidth;
                createColorBox(color, startX, startY, colorBoxWidth, colorBoxHeight);
            });
            
            // Add color values as text
            colors.forEach((color, index) => {
                const startX = index * colorBoxWidth + (colorBoxWidth / 2) - 30;
                createText(color, startX, startY + colorBoxHeight + 20, 14);
            });
            
            // Add title
            createText("Color Palette", 10, startY - 30, 24);
        },
        
        createQuote: (quote: string) => {
            // Create a background rectangle
            const rectangle = editor.createRectangle();
            rectangle.width = 500;
            rectangle.height = 200;
            rectangle.translation = { x: 10, y: 10 };
            
            const color = { red: 0.95, green: 0.95, blue: 0.95, alpha: 1 };
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
            
            // Add quote text
            createText(`"${quote}"`, 30, 80, 20);
            
            // Add title
            createText("Brand Quote", 10, 10, 24);
        },
        
        createLogoIdea: (logoIdea: string) => {
            // Create a background rectangle
            const rectangle = editor.createRectangle();
            rectangle.width = 500;
            rectangle.height = 200;
            rectangle.translation = { x: 10, y: 10 };
            
            const color = { red: 0.9, green: 0.9, blue: 0.98, alpha: 1 };
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
            
            // Add logo idea text
            createText(logoIdea, 30, 80, 18);
            
            // Add title
            createText("Logo Idea", 10, 10, 24);
        },
        
        createFocusKeywords: (keywords: string[]) => {
            // Create a background rectangle
            const rectangle = editor.createRectangle();
            rectangle.width = 500;
            rectangle.height = 200;
            rectangle.translation = { x: 10, y: 10 };
            
            const color = { red: 0.98, green: 0.9, blue: 0.9, alpha: 1 };
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
            
            // Add keywords text
            keywords.forEach((keyword, index) => {
                createText(`• ${keyword}`, 30, 60 + (index * 30), 18);
            });
            
            // Add title
            createText("Focus Keywords", 10, 10, 24);
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
