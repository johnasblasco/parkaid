/** @type {import('tailwindcss').Config} */
export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
            screens: {
                  'cp': '320px',  // If you really need this for very small devices
                  'laptop': '1024px',    // For laptops
                  'desktop': '1280px',   // For desktops
                },
        },
      },
      plugins: [],
}