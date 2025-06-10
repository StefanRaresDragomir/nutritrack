/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#686A6C",
        secondary: {
          DEFAULT: "#C0C0C0",
          100: "#C0C0C0",
          200: "#C0C0C0",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
      },
      fontFamily: {
          // Poppins Variations
          pthin: ["Poppins-Thin", "sans-serif"],
          pextralight: ["Poppins-ExtraLight", "sans-serif"],
          plight: ["Poppins-Light", "sans-serif"],
          pregular: ["Poppins-Regular", "sans-serif"],
          pmedium: ["Poppins-Medium", "sans-serif"],
          psemibold: ["Poppins-SemiBold", "sans-serif"],
          pbold: ["Poppins-Bold", "sans-serif"],
          pextrabold: ["Poppins-ExtraBold", "sans-serif"],
          pblack: ["Poppins-Black", "sans-serif"],

          // Open Sans Variations
          oslight: ["OpenSans-Light", "sans-serif"],
          oslightitalic: ["OpenSans-LightItalic", "sans-serif"],
          osregular: ["OpenSans-Regular", "sans-serif"],
          ositalic: ["OpenSans-Italic", "sans-serif"],
          ossemibold: ["OpenSans-Semibold", "sans-serif"],
          ossemibolditalic: ["OpenSans-SemiboldItalic", "sans-serif"],
          osbold: ["OpenSans-Bold", "sans-serif"],
          osbolditalic: ["OpenSans-BoldItalic", "sans-serif"],
          osextrabold: ["OpenSans-ExtraBold", "sans-serif"],
          osextrabolditalic: ["OpenSans-ExtraBoldItalic", "sans-serif"],

          // Nunito Variations
          nlight: ["Nunito-Light", "sans-serif"],
          nlightitalic: ["Nunito-LightItalic", "sans-serif"],
          nregular: ["Nunito-Regular", "sans-serif"],
          nitalic: ["Nunito-Italic", "sans-serif"],
          nsemibold: ["Nunito-SemiBold", "sans-serif"],
          nsemibolditalic: ["Nunito-SemiBoldItalic", "sans-serif"],
          nbold: ["Nunito-Bold", "sans-serif"],
          nbolditalic: ["Nunito-BoldItalic", "sans-serif"],
          nextralight: ["Nunito-ExtraLight", "sans-serif"],
          nextralightitalic: ["Nunito-ExtraLightItalic", "sans-serif"],
          nextrabold: ["Nunito-ExtraBold", "sans-serif"],
          nextrabolditalic: ["Nunito-ExtraBoldItalic", "sans-serif"],
          nblack: ["Nunito-Black", "sans-serif"],
          nblackitalic: ["Nunito-BlackItalic", "sans-serif"],

          // Inter Variations
          ithin: ["Inter-Thin", "sans-serif"],
          ithinitalic: ["Inter-ThinItalic", "sans-serif"],
          ilight: ["Inter-Light", "sans-serif"],
          ilightitalic: ["Inter-LightItalic", "sans-serif"],
          iextralight: ["Inter-ExtraLight", "sans-serif"],
          iextralightitalic: ["Inter-ExtraLightItalic", "sans-serif"],
          iregular: ["Inter-Regular", "sans-serif"],
          iitalic: ["Inter-Italic", "sans-serif"],
          imedium: ["Inter-Medium", "sans-serif"],
          imediumitalic: ["Inter-MediumItalic", "sans-serif"],
          isemibold: ["Inter-SemiBold", "sans-serif"],
          isemibolditalic: ["Inter-SemiBoldItalic", "sans-serif"],
          ibold: ["Inter-Bold", "sans-serif"],
          ibolditalic: ["Inter-BoldItalic", "sans-serif"],
          iextrabold: ["Inter-ExtraBold", "sans-serif"],
          iextrabolditalic: ["Inter-ExtraBoldItalic", "sans-serif"],
          iblack: ["Inter-Black", "sans-serif"],
          iblackitalic: ["Inter-BlackItalic", "sans-serif"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};

