/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./features/**/*.{js,ts,jsx,tsx,mdx}",
		"./dialogs/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		fontFamily: {
    			manrope: [
    				'Manrope',
    				'sans-serif'
    			]
    		},
    		colors: {
    			primary: {
    				'50': '#38377E',
    				'100': '#444298',
    				'200': '#4F4DB1',
    				'300': '#6866BD',
    				'400': '#8180C8',
    				'500': '#29285C',
    				'600': '#212049',
    				'700': '#191837',
    				'800': '#101025',
    				'900': '#080812',
    				'1000': '#2D2C65',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				'50': '#7D7E37',
    				'100': '#969842',
    				'200': '#B0B14D',
    				'300': '#BBBD66',
    				'400': '#C6C880',
    				'500': '#5B5C28',
    				'600': '#494920',
    				'700': '#373718',
    				'800': '#242510',
    				'900': '#121208',
    				'1000': '#64652C',
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			'neutral-light': {
    				'50': '#F7F8FB',
    				'100': '#F8F9FC',
    				'200': '#F9F9FC',
    				'300': '#FAFAFD',
    				'400': '#FBFBFD',
    				'500': '#D7DBED',
    				'600': '#98A4D1',
    				'700': '#5A6CB5',
    				'800': '#38467D',
    				'900': '#1C233F',
    				'1000': '#F6F7FB',
    				DEFAULT: '#F6F7FB'
    			},
    			'neutral-dark': {
    				'50': '#3B3B57',
    				'100': '#4C4C6F',
    				'200': '#5C5C87',
    				'300': '#6F6F9D',
    				'400': '#8787AD',
    				'500': '#272739',
    				'600': '#1F1F2E',
    				'700': '#171722',
    				'800': '#101017',
    				'900': '#08080B',
    				'1000': '#2B2B3F',
    				DEFAULT: '#2B2B3F'
    			},
    			error: {
    				'10': '#200a0a1a',
    				'100': '#e9b8b8',
    				'200': '#de9494',
    				'300': '#d27070',
    				'400': '#c74d4d',
    				'500': '#af3737',
    				'600': '#8b2b2b',
    				'700': '#672020',
    				'800': '#441515',
    				'900': '#200a0a'
    			},
    			warning: {
    				'10': '#2515041a',
    				'100': '#f6d1aa',
    				'200': '#f1ba80',
    				'300': '#eda356',
    				'400': '#e88d2b',
    				'500': '#ce7516',
    				'600': '#a45d12',
    				'700': '#7a450d',
    				'800': '#4f2d09',
    				'900': '#251504'
    			},
    			success: {
    				'10': '#07260a1a',
    				'100': '#b0f1b7',
    				'200': '#89e993',
    				'300': '#62e26e',
    				'400': '#3bdb4a',
    				'500': '#24c333',
    				'600': '#1d9c29',
    				'700': '#15751f',
    				'800': '#0e4d14',
    				'900': '#07260a'
    			},
    			black: {
    				DEFAULT: '#000000',
    				base: '#1A1A1A'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
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
    		fontSize: {
    			'h-1': '58px',
    			'h-2': '48px',
    			'h-3': '40px',
    			'h-4': '34px',
    			'h-5': '28px',
    			'h-6': '24px',
    			'h-7': '20px',
    			'h-8': '18px',
    			'b-1': '16px',
    			'b-2': '14px',
    			'b-3': '12px',
    			'b-4': '10px',
    			'b-5': '8px'
    		},
    		lineHeight: {
    			'h-1': '87px',
    			'h-2': '72px',
    			'h-3': '60px',
    			'h-4': '51px',
    			'h-5': '42px',
    			'h-6': '36px',
    			'h-7': '30px',
    			'h-8': '24px',
    			'b-1': '24px',
    			'b-2': '21px',
    			'b-3': '18px',
    			'b-4': '15px',
    			'b-5': '12px'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
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
	plugins: [animate, typography, tailwindcssAnimate],
};

export default config;
