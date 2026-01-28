"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

export type ThemeColor = "horizon" | "sunset" | "forest" | "neutral";

interface ThemeColorContextType {
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({
    children,
    defaultTheme = "neutral",
}: {
    children: React.ReactNode;
    defaultTheme?: ThemeColor;
}) {
    const [themeColor, setThemeColorState] = useState<ThemeColor>(defaultTheme);

    useEffect(() => {
        const root = window.document.body; // Using body for global scope
        // Remove known theme attributes to reset
        root.removeAttribute("data-theme-color");

        // Don't set attribute for the default palette to keep DOM clean.
        if (themeColor !== "neutral") {
            root.setAttribute("data-theme-color", themeColor);
        }
    }, [themeColor]);

    const setThemeColor = (color: ThemeColor) => {
        setThemeColorState(color);
        Cookies.set("NEXT_THEME_COLOR", color, { expires: 365 });
    };

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
}

export function useThemeColor() {
    const context = useContext(ThemeColorContext);
    if (!context) {
        throw new Error("useThemeColor must be used within a ThemeColorProvider");
    }
    return context;
}
