'use client';

import {useState,type CSSProperties} from 'react';
import {Select} from 'radix-ui';
import {Check,ChevronDown,ChevronUp} from 'lucide-react';

export type SelectOption={value:string;label:string;detail?:string;color?:string};
export const capoOptions:SelectOption[]=Array.from({length:13},(_,fret)=>({
  value:String(fret),label:fret?`Fret ${fret}`:'No capo',
  detail:fret?'Chord shapes relative to capo':'Open strings',
}));

export function GlassSelect({label,value,onChange,options,disabled=false,className='',caption=label}:{
  label:string;value:string;onChange:(value:string)=>void;options:SelectOption[];
  disabled?:boolean;className?:string;caption?:string;
}){
  const [trigger,setTrigger]=useState<HTMLButtonElement|null>(null);
  const selected=options.find(option=>option.value===value);
  // Keep the menu in the native dialog's top layer when editing a song.
  const container=trigger?.closest('dialog')||undefined;
  const unset='__chordbook_unset';
  return <Select.Root value={value||unset} onValueChange={next=>onChange(next===unset?'':next)} disabled={disabled}>
    <Select.Trigger ref={setTrigger} type="button" className={`glass-select-trigger ${className}`} aria-label={label}>
      {selected?.color&&<span className="select-swatch" style={{'--swatch':selected.color} as CSSProperties}/>}
      <Select.Value><span className="glass-select-value" key={value}>{selected?.label||'Choose'}</span></Select.Value>
      <Select.Icon className="glass-select-chevron"><ChevronDown size={13}/></Select.Icon>
    </Select.Trigger>
    <Select.Portal container={container}>
      <Select.Content className="glass-select-menu" position="popper" sideOffset={9} collisionPadding={12} align="start">
        <div className="glass-select-caption" aria-hidden="true"><span/>{caption}</div>
        <Select.ScrollUpButton className="glass-select-scroll"><ChevronUp size={14}/></Select.ScrollUpButton>
        <Select.Viewport className="glass-select-viewport">
          {options.map((option,index)=><Select.Item className="glass-select-option" key={option.value} value={option.value||unset} textValue={option.label} style={{'--option-delay':`${Math.min(index,6)*18}ms`} as CSSProperties}>
            {option.color&&<span className="select-swatch" style={{'--swatch':option.color} as CSSProperties}/>}
            <span className="glass-select-copy"><Select.ItemText>{option.label}</Select.ItemText>{option.detail&&<small>{option.detail}</small>}</span>
            <Select.ItemIndicator className="glass-select-check"><Check size={14}/></Select.ItemIndicator>
          </Select.Item>)}
        </Select.Viewport>
        <Select.ScrollDownButton className="glass-select-scroll"><ChevronDown size={14}/></Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
