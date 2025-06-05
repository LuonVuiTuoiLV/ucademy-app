import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import { withUt } from 'uploadthing/tw';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
  	extend: {
  		screens: {
  			'3xl': '2000px'
  		},
  		colors: {
  			primary: '#8873EF',
  			secondary: '#2979ff',
  			grayDarkest: '#131316',
  			grayDarker: '#212126',
  			grayDark: '#9394A1',
  			'color-1': 'hsl(0, 100%, 63%)',
  			'color-2': 'hsl(270, 100%, 63%)',
  			'color-3': 'hsl(210, 100%, 63%)',
  			'color-4': 'hsl(195, 100%, 63%)',
  			'color-5': 'hsl(90, 100%, 63%)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			primary: [
  				'var(--font-manrope)'
  			]
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(255, 204, 112, 0.7), 0 0 40px rgba(200, 80, 192, 0.5), 0 0 60px rgba(65, 88, 208, 0.3)',
  			glow2: '0 0 20px rgba(50, 255, 50, 0.7), 0 0 40px rgba(20, 200, 20, 0.5), 0 0 60px rgba(5, 150, 5, 0.3)'
  		},
  		filter: {
  			'blur-20': 'blur(20px)',
  			'blur-25': 'blur(25px)'
  		},
  		brightness: {
  			'150': '1.5'
  		},
  		backgroundImage: {
  			striped: 'repeating-linear-gradient(45deg, #3B3A3D, #3B3A3D 5px, transparent 5px, transparent 20px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%'
  				},
  				'50%': {
  					'background-position': '100% 100%'
  				},
  				to: {
  					'background-position': '0% 0%'
  				}
  			},
  			aurora: {
  				'0%': {
  					'background-position': '0% 50%',
  					transform: 'rotate(-5deg) scale(0.9)'
  				},
  				'25%': {
  					'background-position': '50% 100%',
  					transform: 'rotate(5deg) scale(1.1)'
  				},
  				'50%': {
  					'background-position': '100% 50%',
  					transform: 'rotate(-3deg) scale(0.95)'
  				},
  				'75%': {
  					'background-position': '50% 0%',
  					transform: 'rotate(3deg) scale(1.05)'
  				},
  				'100%': {
  					'background-position': '0% 50%',
  					transform: 'rotate(-5deg) scale(0.9)'
  				}
  			},
  			rainbow: {
  				'0%': {
  					backgroundPosition: '0% 50%'
  				},
  				'100%': {
  					backgroundPosition: '200% 50%'
  				}
  			},
  			gradient: {
  				to: {
  					'background-position': 'var(--bg-size, 300%) 0'
  				}
  			},
  			'blink-red': {
  				'0%, 100%': {
  					backgroundColor: 'rgba(239, 68, 68, 0.7)',
  					boxShadow: '0 0 30px 10px rgba(239, 68, 68, 0.5)'
  				},
  				'50%': {
  					backgroundColor: 'rgba(239, 68, 68, 0.5)',
  					boxShadow: '0 0 30px 10px rgba(239, 68, 68, 1)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			shine: 'shine var(--duration) infinite linear',
  			aurora: 'aurora 8s ease-in-out infinite alternate',
  			rainbow: 'rainbow var(--speed, 2s) infinite linear;',
  			gradient: 'gradient 8s linear infinite',
  			'blink-red': 'blink-red 2s infinite linear'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default withUt(config);
