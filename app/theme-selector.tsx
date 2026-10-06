'use client';

import {useSyncExternalStore} from 'react';
import {Moon,Sun,Palette} from 'lucide-react';
import {GlassSelect} from './glass-select';

const themes=['amber','forest','ocean','sunset','lavender','slate'] as const;
type Theme=typeof themes[number];
type Mode='dark'|'light';
const accentKey='chordbook-color-theme';
const modeKey='chordbook-display-mode';
const swatches={amber:'#efaa73',forest:'#b7d99a',ocean:'#8acddd',sunset:'#f39c7e',lavender:'#c5b1e5',slate:'#bdcbd4'};
let memoryAccent:Theme='amber';
let memoryMode:Mode='dark';

function read(key:string){try{return window.localStorage.getItem(key)}catch{return null}}
function getAccent():Theme{const value=read(accentKey);return themes.find(theme=>theme===value)||memoryAccent}
function getMode():Mode{const value=read(modeKey);return value==='light'||value==='dark'?value:memoryMode}
function syncDocument(){document.documentElement.dataset.theme=getAccent();document.documentElement.dataset.mode=getMode()}
function subscribe(onChange:()=>void){
  const update=()=>{syncDocument();onChange()};
  window.addEventListener('storage',update);window.addEventListener('chordbook-theme-change',update);
  return()=>{window.removeEventListener('storage',update);window.removeEventListener('chordbook-theme-change',update)};
}
function update(key:string,value:string){
  try{window.localStorage.setItem(key,value)}catch{/* Keep the controls usable when storage is unavailable. */}
  window.dispatchEvent(new Event('chordbook-theme-change'));
}

export function ThemeSelector(){
  const mode=useSyncExternalStore(subscribe,getMode,()=> 'dark' as Mode);
  return <button type="button" className="theme-toggle" role="switch" aria-checked={mode==='light'} aria-label="Light mode" title={mode==='dark'?'Switch to light mode':'Switch to dark mode'} onClick={()=>{memoryMode=mode==='dark'?'light':'dark';update(modeKey,memoryMode)}}>
    <Moon size={14}/><span className="theme-switch-track"><span/></span><Sun size={15}/>
  </button>;
}

export function AccentPicker(){
  const theme=useSyncExternalStore(subscribe,getAccent,()=> 'amber' as Theme);
  return <div className="theme-picker"><Palette size={14}/><GlassSelect label="Color theme" caption="Set the mood" value={theme} onChange={value=>{const selected=themes.find(t=>t===value);if(selected){memoryAccent=selected;update(accentKey,selected)}}} options={themes.map(value=>({value,label:value[0].toUpperCase()+value.slice(1),color:swatches[value]}))}/></div>;
}
