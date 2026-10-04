'use client';

import {useEffect,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {Palette} from 'lucide-react';

const themes=['forest','ocean','sunset','lavender','slate'] as const;
type Theme=typeof themes[number];
const storageKey='chordbook-color-theme';

function isTheme(value:string|null):value is Theme {
  return themes.some(theme=>theme===value);
}

function getThemeSnapshot():Theme {
  const saved=window.localStorage.getItem(storageKey);
  return isTheme(saved)?saved:'forest';
}

function subscribeToTheme(onChange:()=>void) {
  window.addEventListener('storage',onChange);
  window.addEventListener('chordbook-theme-change',onChange);
  return ()=>{
    window.removeEventListener('storage',onChange);
    window.removeEventListener('chordbook-theme-change',onChange);
  };
}

export function ThemeSelector() {
  const theme=useSyncExternalStore(subscribeToTheme,getThemeSnapshot,()=> 'forest');
  const [container,setContainer]=useState<HTMLElement|null>(null);

  useEffect(()=>{document.documentElement.dataset.theme=theme},[theme]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>setContainer(document.querySelector<HTMLElement>('.sidebar-bottom')));
    return ()=>cancelAnimationFrame(frame);
  },[]);

  function selectTheme(value:string) {
    if(!isTheme(value))return;
    window.localStorage.setItem(storageKey,value);
    window.dispatchEvent(new Event('chordbook-theme-change'));
  }

  if(!container)return null;
  return createPortal(<label className="theme-picker">
    <Palette size={17}/>
    <span>Theme</span>
    <select aria-label="Color theme" value={theme} onChange={event=>selectTheme(event.target.value)}>
      <option value="forest">Forest</option>
      <option value="ocean">Ocean</option>
      <option value="sunset">Sunset</option>
      <option value="lavender">Lavender</option>
      <option value="slate">Slate</option>
    </select>
  </label>,container);
}
