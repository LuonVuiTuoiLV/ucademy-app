import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { withUt } from 'uploadthing/tw';
export default withUt({
	darkMode: ['class'],
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
    	extend: {
    		screens: {
    			'3xl': '1600px'
    		},
    		colors: {
    			primary: '#8873EF ',
    			grayDarkest: '#131316',
    			grayDarker: '#212126',
    			grayDark: '#9394A1'
    		},
    		fontFamily: {
    			primary: [
    				'var(--font-manrope)'
    			]
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
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
	plugins: [animate],
}) satisfies Config;
