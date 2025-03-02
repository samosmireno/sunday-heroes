/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			oswald: [
  				'Oswald',
  				'sans-serif'
  			],
  			exo: [
  				'Exo',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'football-grass': 'linear-gradient(90deg, #43a047 25%, #388e3c 25%, #388e3c 50%, #43a047 50%, #43a047 75%, #388e3c 75%, #388e3c 100%)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
