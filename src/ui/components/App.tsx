// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import { BrandKitData, DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

// Logo as base64 data URL
const logoDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIENpcmNsZSAtLT4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI1NSIgZmlsbD0iIzJDM0U1MCIgLz4KICAKICA8IS0tIENvbG9yIFBhbGV0dGUgRWxlbWVudHMgLS0+CiAgPHJlY3QgeD0iMjUiIHk9IjQwIiB3aWR0aD0iMjAiIGhlaWdodD0iNDAiIHJ4PSI0IiBmaWxsPSIjMzQ5OERCIiAvPgogIDxyZWN0IHg9IjUwIiB5PSIzMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjUwIiByeD0iNCIgZmlsbD0iIzlCNTlCNiIgLz4KICA8cmVjdCB4PSI3NSIgeT0iNDUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIzNSIgcng9IjQiIGZpbGw9IiMyRUNDNzEiIC8+CiAgCiAgPCEtLSBFeWVkcm9wcGVyIEljb24gLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjAsIDYwKSByb3RhdGUoLTQ1KSB0cmFuc2xhdGUoLTYwLCAtNjApIj4KICAgIDxwYXRoIGQ9Ik03NSAzNSBMODUgNDUgTDY1IDY1IEw1NSA1NSBaIiBmaWxsPSIjRUNGMEYxIiAvPgogICAgPHJlY3QgeD0iNTIiIHk9IjU1IiB3aWR0aD0iNiIgaGVpZ2h0PSIxNSIgcng9IjMiIGZpbGw9IiNFQ0YwRjEiIC8+CiAgICA8Y2lyY2xlIGN4PSI1NSIgY3k9IjczIiByPSI1IiBmaWxsPSIjRTc0QzNDIiAvPgogIDwvZz4KICAKICA8IS0tIFRleHQgRWxlbWVudHMgLS0+CiAgPHRleHQgeD0iNjAiIHk9Ijk1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRUNGMEYxIj5WaWJlS2l0PC90ZXh0Pgo8L3N2Zz4=";

// OpenAI API key
const OPENAI_API_KEY = "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";

// Function to validate URL
function isValidUrl(urlString: string): boolean {
    try {
        // Add protocol if missing
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'https://' + urlString;
        }
        
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

// Function to extract colors from a website
async function extractColorsFromUrl(url: string): Promise<BrandKitData> {
    try {
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Use a CORS proxy to fetch the website content
        const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        // Fetch the website content
        const response = await fetch(corsProxyUrl);
        const html = await response.text();
        
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract colors from inline styles
        const colors = new Set<string>();
        const elements = tempDiv.querySelectorAll('[style]');
        elements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const colorMatches = style.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
            if (colorMatches) {
                colorMatches.forEach(color => {
                    // Convert RGB to hex if needed
                    if (color.startsWith('rgb')) {
                        const hex = rgbToHex(color);
                        if (hex) colors.add(hex);
                    } else {
                        colors.add(color);
                    }
                });
            }
        });
        
        // Extract colors from background-color style attributes
        const allElements = tempDiv.querySelectorAll('*');
        const styleElements = tempDiv.querySelectorAll('style');
        
        // Extract colors from style tags
        styleElements.forEach(styleEl => {
            const cssText = styleEl.textContent || '';
            const colorMatches = cssText.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
            if (colorMatches) {
                colorMatches.forEach(color => {
                    if (color.startsWith('rgb')) {
                        const hex = rgbToHex(color);
                        if (hex) colors.add(hex);
                    } else {
                        colors.add(color);
                    }
                });
            }
        });
        
        // Extract the title or first heading
        let title = tempDiv.querySelector('title')?.textContent || '';
        if (!title) {
            const heading = tempDiv.querySelector('h1, h2, h3');
            if (heading) {
                title = heading.textContent || '';
            } else {
                title = `Website: ${url}`;
            }
        }
        
        // Extract meta description
        const metaDescription = tempDiv.querySelector('meta[name="description"]');
        let description = '';
        if (metaDescription && metaDescription.getAttribute('content')) {
            description = metaDescription.getAttribute('content') || '';
        }
        
        // Extract meta keywords
        const metaKeywords = tempDiv.querySelector('meta[name="keywords"]');
        let keywordsText = '';
        if (metaKeywords && metaKeywords.getAttribute('content')) {
            keywordsText = metaKeywords.getAttribute('content') || '';
        }
        
        // Extract text content for context
        const bodyText = tempDiv.textContent || '';
        
        // Extract font information - improved method
        const fontSuggestion = extractFontInformation(tempDiv);
        
        // If we couldn't extract enough colors, add some defaults
        let colorArray = Array.from(colors);
        if (colorArray.length < 5) {
            const defaultColors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];
            colorArray = [...colorArray, ...defaultColors.slice(0, 5 - colorArray.length)];
        }
        
        // Limit to 5 colors
        colorArray = colorArray.slice(0, 5);
        
        // Use OpenAI to generate quote and keywords based on the website content
        const enhancedData = await enhanceWithGPT(title, description, keywordsText, bodyText, url);
        
        return {
            colorPalette: colorArray,
            quote: enhancedData.quote,
            logoIdea: enhancedData.logoIdea,
            fontSuggestion,
            focusKeywords: enhancedData.focusKeywords
        };
    } catch (error) {
        console.error("Error extracting colors from URL:", error);
        
        // Return fallback data if there's an error
        return {
            colorPalette: ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"],
            quote: `Inspired by ${url}`,
            logoIdea: "A modern, sleek design with geometric elements",
            fontSuggestion: "Montserrat",
            focusKeywords: ["professional", "innovative", "modern"]
        };
    }
}

// Function to extract font information from DOM
function extractFontInformation(domElement: HTMLElement): string {
    try {
        // Check for CSS variables in :root or body
        const rootStyles = domElement.querySelector(':root, body');
        if (rootStyles) {
            // Look for CSS variable definitions
            const styleElements = domElement.querySelectorAll('style');
            for (let i = 0; i < styleElements.length; i++) {
                const styleContent = styleElements[i].textContent || '';
                
                // Look for CSS variable definitions for fonts
                const cssVarMatches = styleContent.match(/--[\w-]*font-family[\w-]*:\s*([^;]+)/g);
                if (cssVarMatches) {
                    for (const match of cssVarMatches) {
                        const fontValue = match.split(':')[1].trim();
                        // Clean up the font value
                        const cleanFont = fontValue.replace(/["';]/g, '').trim();
                        if (cleanFont && !isGenericFontFamily(cleanFont)) {
                            return cleanFont;
                        }
                    }
                }
            }
        }
        
        // Check for WordPress theme.json font definitions
        const wpFontScript = domElement.querySelector('script[id*="theme-json"]');
        if (wpFontScript) {
            const scriptContent = wpFontScript.textContent || '';
            try {
                // Try to parse the JSON
                const themeData = JSON.parse(scriptContent);
                // Look for font family definitions in WordPress theme.json structure
                if (themeData.settings && themeData.settings.typography && themeData.settings.typography.fontFamilies) {
                    const fontFamilies = themeData.settings.typography.fontFamilies;
                    if (fontFamilies.length > 0 && fontFamilies[0].fontFamily) {
                        return fontFamilies[0].fontFamily;
                    }
                }
            } catch (e) {
                console.error("Error parsing WordPress theme JSON:", e);
            }
        }
        
        // 1. Check for Google Fonts
        const googleFontsLinks = domElement.querySelectorAll('link[href*="fonts.googleapis.com"]');
        if (googleFontsLinks.length > 0) {
            for (let i = 0; i < googleFontsLinks.length; i++) {
                const href = googleFontsLinks[i].getAttribute('href') || '';
                const fontMatch = href.match(/family=([^:&]+)/);
                if (fontMatch && fontMatch[1]) {
                    // Clean up the font name (remove + signs, etc.)
                    return fontMatch[1].replace(/\+/g, ' ').split('|')[0];
                }
            }
        }
        
        // 2. Check for Adobe Fonts (Typekit)
        const adobeFontsLinks = domElement.querySelectorAll('link[href*="use.typekit.net"]');
        if (adobeFontsLinks.length > 0) {
            return "Adobe Fonts (Typekit)";
        }
        
        // 3. Check for other font services
        const fontAwesomeLinks = domElement.querySelectorAll('link[href*="fontawesome"]');
        if (fontAwesomeLinks.length > 0) {
            return "Font Awesome";
        }
        
        // 4. Extract from style tags
        const styleElements = domElement.querySelectorAll('style');
        
        const fontFamilies = new Set<string>();
        
        styleElements.forEach(styleEl => {
            const cssText = styleEl.textContent || '';
            // Look for font-family declarations in CSS
            const fontFamilyMatches = cssText.match(/font-family:\s*([^;]+)/g);
            
            if (fontFamilyMatches) {
                fontFamilyMatches.forEach(match => {
                    // Extract the actual font names from the declaration
                    const fontValue = match.replace(/font-family:\s*/, '').trim();
                    
                    // Skip CSS variables
                    if (fontValue.includes('var(')) {
                        return;
                    }
                    
                    // Split by commas to get individual font names
                    const fonts = fontValue.split(',');
                    if (fonts.length > 0) {
                        // Get the first (primary) font and clean it up
                        const primaryFont = fonts[0].trim().replace(/["']/g, '');
                        if (primaryFont && !isGenericFontFamily(primaryFont)) {
                            fontFamilies.add(primaryFont);
                        }
                    }
                });
            }
        });
        
        // 5. Check inline styles on important elements
        const importantElements = domElement.querySelectorAll('body, h1, h2, h3, p, div[class*="head"], div[class*="title"], header');
        
        importantElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/);
            if (fontFamilyMatch && fontFamilyMatch[1]) {
                const fontFamily = fontFamilyMatch[1].trim();
                
                // Skip CSS variables
                if (fontFamily.includes('var(')) {
                    return;
                }
                
                // Extract the first font name from the font stack
                const firstFont = fontFamily.split(',')[0].trim().replace(/["']/g, '');
                if (firstFont && !isGenericFontFamily(firstFont)) {
                    fontFamilies.add(firstFont);
                }
            }
        });
        
        // Return the first font we found, or a default
        if (fontFamilies.size > 0) {
            return Array.from(fontFamilies)[0];
        }
        
        // 6. Look for font-related classes in the body or other main elements
        const bodyElement = domElement.querySelector('body');
        if (bodyElement) {
            const bodyClass = bodyElement.getAttribute('class') || '';
            const fontClassMatch = bodyClass.match(/font-([a-zA-Z0-9_-]+)/);
            if (fontClassMatch && fontClassMatch[1]) {
                // Convert kebab-case or snake_case to Title Case
                return fontClassMatch[1]
                    .replace(/[-_]/g, ' ')
                    .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            }
        }
        
        // 7. Default to a modern font if nothing is found
        return "Montserrat";
    } catch (error) {
        console.error("Error extracting font information:", error);
        return "Montserrat";
    }
}

// Helper function to check if a font name is a generic family
function isGenericFontFamily(fontName: string): boolean {
    const genericFonts = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded'];
    return genericFonts.includes(fontName.toLowerCase());
}

// Function to enhance data with GPT
async function enhanceWithGPT(title: string, description: string, keywords: string, bodyText: string, url: string): Promise<{
    quote: string;
    logoIdea: string;
    focusKeywords: string[];
}> {
    try {
        // Prepare a concise context for GPT
        const context = `
Website Title: ${title}
Website Description: ${description}
Website Keywords: ${keywords}
Website URL: ${url}
`;
        
        // Make API call to OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a brand design assistant. Generate brand kit suggestions based on the website information provided. Return ONLY valid JSON with no additional text."
                    },
                    {
                        role: "user",
                        content: `Create a brand kit for this website: ${context}. Return JSON with the following structure: 
                        {
                            "quote": "short inspirational quote that fits the brand (max 100 chars)",
                            "logoIdea": "one-line logo idea (max 100 chars)",
                            "focusKeywords": ["keyword1", "keyword2", "keyword3"]
                        }`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Error calling OpenAI API");
        }

        // Parse the response content as JSON
        const content = data.choices[0].message.content;
        const parsedData = JSON.parse(content);
        
        return {
            quote: parsedData.quote || `Inspired by ${title}`,
            logoIdea: parsedData.logoIdea || "A modern, sleek design with geometric elements",
            focusKeywords: parsedData.focusKeywords || ["professional", "innovative", "modern"]
        };
    } catch (error) {
        console.error("Error enhancing with GPT:", error);
        
        // Return fallback data
        return {
            quote: `Inspired by ${title || url}`,
            logoIdea: "A modern, sleek design with geometric elements",
            focusKeywords: ["professional", "innovative", "modern"]
        };
    }
}

// Function to generate similar color palettes using GPT
async function generateSimilarPalettes(colorPalette: string[]): Promise<string[][]> {
    try {
        // Prepare the color palette for GPT
        const colorContext = `Current Color Palette: ${colorPalette.join(", ")}`;
        
        // Make API call to OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a color palette generator. Generate similar but distinctly different color palettes based on the provided colors. Return ONLY valid JSON with no additional text."
                    },
                    {
                        role: "user",
                        content: `Create 3 similar but visually distinct color palettes based on these colors: ${colorContext}. Each palette should have exactly 5 colors and should be noticeably different from the original palette while maintaining a similar aesthetic. Return JSON with the following structure: 
                        {
                            "palettes": [
                                ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
                                ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
                                ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]
                            ]
                        }`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Error calling OpenAI API");
        }

        // Parse the response content as JSON
        const content = data.choices[0].message.content;
        const parsedData = JSON.parse(content);
        
        // Validate that we got distinct palettes
        const palettes = parsedData.palettes || [];
        
        // If we got fewer than 3 palettes or they're too similar, use fallbacks
        if (palettes.length < 3) {
            return generateFallbackPalettes(colorPalette);
        }
        
        return palettes;
    } catch (error) {
        console.error("Error generating similar palettes:", error);
        return generateFallbackPalettes(colorPalette);
    }
}

// Generate fallback palettes that are completely different from the original
function generateFallbackPalettes(originalPalette: string[]): string[][] {
    // Predefined distinctly different color schemes
    const distinctPalettes = [
        ["#FF5733", "#C70039", "#900C3F", "#581845", "#2C3E50"],
        ["#16A085", "#27AE60", "#2980B9", "#8E44AD", "#2C3E50"],
        ["#F1C40F", "#E67E22", "#E74C3C", "#ECF0F1", "#95A5A6"]
    ];
    
    // If the original palette is similar to any of our predefined ones, use completely different ones
    const fallbackPalettes = [
        ["#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6", "#34495E"],
        ["#F39C12", "#D35400", "#C0392B", "#BDC3C7", "#7F8C8D"],
        ["#046380", "#002F2F", "#A7A37E", "#EFECCA", "#E6E2AF"]
    ];
    
    // Check if original palette is empty or invalid
    if (!originalPalette || originalPalette.length === 0) {
        return distinctPalettes;
    }
    
    // Try to create palettes based on color theory
    try {
        const palettes: string[][] = [];
        
        // 1. Analogous colors (colors next to each other on the color wheel)
        const analogousPalette = createAnalogousPalette(originalPalette[0]);
        palettes.push(analogousPalette);
        
        // 2. Complementary colors (colors opposite on the color wheel)
        const complementaryPalette = createComplementaryPalette(originalPalette[0]);
        palettes.push(complementaryPalette);
        
        // 3. Monochromatic colors (different shades of the same color)
        const monoChromaticPalette = createMonochromaticPalette(originalPalette[0]);
        palettes.push(monoChromaticPalette);
        
        // If we successfully created all three palettes, return them
        if (palettes.length === 3 && palettes.every(p => p.length === 5)) {
            return palettes;
        }
    } catch (e) {
        console.error("Error creating color theory palettes:", e);
    }
    
    // Fallback to predefined palettes
    return distinctPalettes;
}

// Create an analogous color palette (colors next to each other on the color wheel)
function createAnalogousPalette(baseColor: string): string[] {
    try {
        // Parse the hex color
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Convert RGB to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Create analogous colors by shifting hue
        const palette: string[] = [];
        for (let i = -2; i <= 2; i++) {
            const newHue = (h + i * 30 + 360) % 360; // Shift by 30 degrees
            const [newR, newG, newB] = hslToRgb(newHue, s, l);
            const hexColor = rgbToHexString(newR, newG, newB);
            palette.push(hexColor);
        }
        
        return palette;
    } catch (e) {
        console.error("Error creating analogous palette:", e);
        return ["#FF5733", "#FF8D33", "#FFBD33", "#FFEC33", "#BDFF33"];
    }
}

// Create a complementary color palette (colors opposite on the color wheel)
function createComplementaryPalette(baseColor: string): string[] {
    try {
        // Parse the hex color
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Convert RGB to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Create complementary colors
        const palette: string[] = [];
        
        // Add the base color
        palette.push(baseColor);
        
        // Add two colors with different saturations
        const [r1, g1, b1] = hslToRgb(h, Math.max(0, s - 0.3), l);
        palette.push(rgbToHexString(r1, g1, b1));
        
        const [r2, g2, b2] = hslToRgb(h, Math.min(1, s + 0.3), l);
        palette.push(rgbToHexString(r2, g2, b2));
        
        // Add the complementary color
        const complementaryHue = (h + 180) % 360;
        const [r3, g3, b3] = hslToRgb(complementaryHue, s, l);
        palette.push(rgbToHexString(r3, g3, b3));
        
        // Add a variation of the complementary color
        const [r4, g4, b4] = hslToRgb(complementaryHue, Math.min(1, s + 0.2), Math.max(0, l - 0.2));
        palette.push(rgbToHexString(r4, g4, b4));
        
        return palette;
    } catch (e) {
        console.error("Error creating complementary palette:", e);
        return ["#16A085", "#138D75", "#0E6655", "#D35400", "#BA4A00"];
    }
}

// Create a monochromatic color palette (different shades of the same color)
function createMonochromaticPalette(baseColor: string): string[] {
    try {
        // Parse the hex color
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Convert RGB to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Create monochromatic colors by shifting lightness
        const palette: string[] = [];
        for (let i = 0; i < 5; i++) {
            const newLightness = 0.2 + (i * 0.15); // From 0.2 to 0.8
            const [newR, newG, newB] = hslToRgb(h, s, newLightness);
            const hexColor = rgbToHexString(newR, newG, newB);
            palette.push(hexColor);
        }
        
        return palette;
    } catch (e) {
        console.error("Error creating monochromatic palette:", e);
        return ["#F1C40F", "#D4AC0D", "#B7950B", "#9A7D0A", "#7D6608"];
    }
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h *= 60;
    }
    
    return [h, s, l];
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, (h / 360) + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, (h / 360) - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to hex string
function rgbToHexString(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to convert RGB to hex
function rgbToHex(rgb: string): string | null {
    try {
        // Extract RGB values
        const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (!rgbMatch) return null;
        
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        
        // Convert to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch (error) {
        console.error("Error converting RGB to hex:", error);
        return null;
    }
}

const App = ({ addOnUISdk, sandboxProxy }: { addOnUISdk: AddOnSDKAPI; sandboxProxy: DocumentSandboxApi }) => {
    const [inputValue, setInputValue] = useState("");
    const [brandKitData, setBrandKitData] = useState<BrandKitData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState("input"); // "input" or "results"
    const [errorMessage, setErrorMessage] = useState("");
    const [similarPalettes, setSimilarPalettes] = useState<string[][]>([]);
    const [showSimilarPalettes, setShowSimilarPalettes] = useState(false);
    const [isLoadingSimilarPalettes, setIsLoadingSimilarPalettes] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setErrorMessage("");
    };

    const handleFetchFromUrl = async () => {
        if (!inputValue) {
            setErrorMessage("Please enter a URL");
            return;
        }
        
        // Validate URL
        if (!isValidUrl(inputValue)) {
            setErrorMessage("Please enter a valid URL");
            return;
        }
        
        setIsLoading(true);
        setErrorMessage("");
        
        try {
            // Check if input is a valid URL
            let url = inputValue;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            // Extract colors and other data from the URL
            const data = await extractColorsFromUrl(url);
            setBrandKitData(data);
            setActiveView("results");
        } catch (error) {
            console.error("Error fetching from URL:", error);
            setErrorMessage("Failed to fetch from URL. Please check the URL and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateQuote = () => {
        if (brandKitData) {
            sandboxProxy.createQuote(brandKitData.quote);
        }
    };

    const handleCreateLogoIdea = () => {
        if (brandKitData) {
            sandboxProxy.createLogoIdea(brandKitData.logoIdea);
        }
    };

    const handleCreateFocusKeywords = () => {
        if (brandKitData) {
            sandboxProxy.createFocusKeywords(brandKitData.focusKeywords);
        }
    };

    const handleBackToInput = () => {
        setActiveView("input");
    };

    const handleShowSimilarPalettes = async () => {
        if (brandKitData) {
            setIsLoadingSimilarPalettes(true);
            const palettes = await generateSimilarPalettes(brandKitData.colorPalette);
            setSimilarPalettes(palettes);
            setShowSimilarPalettes(true);
            setIsLoadingSimilarPalettes(false);
        }
    };

    const renderInputView = () => {
        return (
            <div className="input-container">
                <div className="logo-container">
                    <img src={logoDataUrl} alt="VibeKit Logo" className="logo" />
                    <h2>VibeKit</h2>
                </div>
                <div className="input-field">
                    <label htmlFor="brand-input">Enter Website URL</label>
                    <input 
                        id="brand-input"
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="e.g., example.com or https://example.com"
                    />
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="button-group">
                    <Button 
                        variant="primary" 
                        onClick={handleFetchFromUrl}
                        disabled={isLoading || !inputValue}
                    >
                        Generate VibeKit
                    </Button>
                </div>
                {isLoading && <div className="loading">Loading... This may take a moment while we analyze the website.</div>}
            </div>
        );
    };

    const renderResultsView = () => {
        if (!brandKitData) return null;
        
        return (
            <div className="results-container">
                <div className="logo-container">
                    <img src={logoDataUrl} alt="VibeKit Logo" className="logo" />
                    <h2>VibeKit Results</h2>
                </div>
                <div className="brand-kit-preview">
                    <div className="color-palette-preview">
                        {brandKitData.colorPalette.map((color, index) => (
                            <div 
                                key={index} 
                                className="color-box-container"
                            >
                                <div 
                                    className="color-box" 
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                                <div className="color-label">{color}</div>
                            </div>
                        ))}
                    </div>
                    <div className="brand-info">
                        <p><strong>Quote:</strong> "{brandKitData.quote}"</p>
                        <p><strong>Logo Idea:</strong> {brandKitData.logoIdea}</p>
                        <p><strong>Font Suggestion:</strong> {brandKitData.fontSuggestion}</p>
                        <p><strong>Focus Keywords:</strong> {brandKitData.focusKeywords.join(", ")}</p>
                    </div>
                </div>
                <hr className="divider" />
                <div className="action-buttons">
                    <Button onClick={handleShowSimilarPalettes} variant="secondary" disabled={isLoadingSimilarPalettes}>
                        {isLoadingSimilarPalettes ? (
                            <span className="button-loading">Loading palettes...</span>
                        ) : (
                            <span>🔍 Show Similar Color Palettes</span>
                        )}
                    </Button>
                </div>
                {showSimilarPalettes && (
                    <div className="similar-palettes">
                        <h3>Similar Palettes</h3>
                        {isLoadingSimilarPalettes ? (
                            <div className="loading">Loading similar palettes...</div>
                        ) : (
                            similarPalettes.map((palette, index) => (
                                <div key={index} className="palette-preview">
                                    {palette.map((color, colorIndex) => (
                                        <div 
                                            key={colorIndex} 
                                            className="color-box-container"
                                        >
                                            <div 
                                                className="color-box" 
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                            <div className="color-label">{color}</div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                )}
                <div className="back-button">
                    <Button onClick={handleBackToInput} variant="primary">
                        Back to Input
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="container">
                {activeView === "input" ? renderInputView() : renderResultsView()}
            </div>
        </Theme>
    );
};

export default App;
