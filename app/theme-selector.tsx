'use client';

import {useSyncExternalStore} from 'react';
import {Moon,Sun,Palette} from 'lucide-react';

const themes=['amber','forest','ocean','sunset','lavender','slate'] as const;
type Theme=typeof themes[number];
type Mode='dark'|'light';
const accentKey='chordbook-color-theme';
const modeKey='chordbook-display-mode';
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
  return <label className="theme-picker"><Palette size={14}/><span>Colour</span><select aria-label="Color theme" value={theme} onChange={event=>{const selected=themes.find(t=>t===event.target.value);if(selected){memoryAccent=selected;update(accentKey,selected)}}}>
    {themes.map(value=><option value={value} key={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}
  </select></label>;
}
