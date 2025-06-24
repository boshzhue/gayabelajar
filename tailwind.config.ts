import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class", "class"],
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/global.css"],
    theme: {
        screens: {
            xs: "480px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1440px",
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0F67A6",
                    foreground: "#0F67A6",
                },
                secondary: {
                    DEFAULT: "#4a48a1",
                },
                background: {
                    DEFAULT: "#F3F4F6",
                    light: "#F3F4F6",
                    dark: "hsl(240, 10%, 10%)",
                },
                surface: {
                    DEFAULT: "#FFFFFF",
                },
                text: {
                    primary: "#1F2937",
                    secondary: "#6B7280",
                },
                error: "#EF4444",
                success: "#10B981",
                accent: {
                    orange: "#FF6A3B",
                    green: "#4ade80",
                    purple: "#c084fc",
                },
                dicoding: "#1f2b38",
                warning: "#facc15",
                muted: {
                    DEFAULT: "#6B7280",
                    foreground: "#1F2937",
                },
                border: {
                    DEFAULT: "hsl(var(--border, 240, 5%, 90%))",
                    light: "hsl(240, 5%, 90%)",
                    dark: "hsl(240, 5%, 20%)",
                },
                foreground: {
                    DEFAULT: "hsl(var(--foreground, 240, 10%, 10%))",
                    light: "hsl(240, 10%, 10%)",
                    dark: "hsl(0, 0%, 95%)",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background, 0, 0%, 100%))",
                    dark: "hsl(240, 10%, 15%)",
                    foreground: "hsl(var(--sidebar-foreground, 240, 10%, 10%))",
                    primary: "hsl(var(--sidebar-primary, 220, 80%, 56%))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground, 0, 0%, 95%))",
                    accent: "hsl(var(--sidebar-accent, 160, 60%, 45%))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground, 0, 0%, 95%))",
                    border: "hsl(var(--sidebar-border, 240, 5%, 90%))",
                    ring: "hsl(var(--sidebar-ring, 220, 80%, 56%))",
                },
            },
            fontFamily: {
                sans: ["var(--font-poppins)", "sans-serif"],
                heading: ["var(--font-poppins)", "sans-serif"],
            },
            fontSize: {
                xs: ["12px", { lineHeight: "16px" }],
                sm: ["14px", { lineHeight: "20px" }],
                base: ["16px", { lineHeight: "24px" }],
                lg: ["18px", { lineHeight: "28px" }],
                xl: ["20px", { lineHeight: "30px" }],
                "2xl": ["24px", { lineHeight: "32px" }],
                "3xl": ["30px", { lineHeight: "36px" }],
                "4xl": ["36px", { lineHeight: "40px" }],
                "5xl": ["48px", { lineHeight: "1" }],
                "6xl": ["60px", { lineHeight: "1" }],
                "7xl": ["72px", { lineHeight: "1" }],
            },
            fontWeight: {
                light: "300",
                normal: "400",
                bold: "700",
            },
        },
    },
    plugins: [],
};

export default config;
