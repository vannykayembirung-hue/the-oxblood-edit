/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Generated editorial plate markup (16:9 figures) is built in lib/, so its utility classes must be scanned too.
    "./lib/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        oxblood: "#6E1423",
        "oxblood-deep": "#4C0E18",
        nearblack: "#0B0A08",
        ink: "#0B0A08",
        velvet: "#120F0D",
        "velvet-soft": "#1A1613",
        cream: "#EDE4D0",
        parchment: "#EDE4D0",
        gold: "#C6A15B",
        "gold-dim": "rgba(198, 161, 91, 0.28)"
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        cormorant: ["Cormorant Garamond", "serif"]
      },
      backgroundImage: {
        // Smoky velvet panel used by every card surface.
        velvet: "linear-gradient(158deg, #16120F 0%, #120F0D 55%, #0E0C0A 100%)"
      },
      boxShadow: {
        velvet: "0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(237, 228, 208, 0.05)"
      }
    }
  },
  plugins: []
};
