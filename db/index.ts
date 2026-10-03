import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Songbook storage is unavailable');return env.DB;}
