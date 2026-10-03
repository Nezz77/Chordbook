import {jsPDF} from 'jspdf';
import {Song,parseSheet,chordFor,keyName,soundingKey} from './music';
export function buildSongbook(songs:Song[],includePending=true){
 const ready=songs.filter(s=>s.content.trim());const pending=songs.filter(s=>!s.content.trim());
 const pdf=new jsPDF({unit:'pt',format:'a4'});const width=595.28,height=841.89,margin=42;let y=0;
 const clean=(s:string)=>s.replace(/[–—]/g,'-').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/…/g,'...').replace(/•/g,' / ');
 const text=(s:string,x:number,yy:number,size=11,font='helvetica',style='normal',color='#25372f')=>{pdf.setFont(font,style);pdf.setFontSize(size);pdf.setTextColor(color);pdf.text(clean(s),x,yy)};
 const header=(song?:Song,continued=false)=>{pdf.setFillColor('#172923');pdf.rect(0,0,width,7,'F');text('CHORDROOM / PERSONAL SONGBOOK',margin,34,8,'helvetica','bold','#647568');if(song){const titleLines=pdf.splitTextToSize(clean(song.title),460);pdf.setFont('helvetica','bold');pdf.setFontSize(21);const wrapped=pdf.splitTextToSize(clean(song.title)+(continued?' (continued)':''),width-margin*2);wrapped.forEach((s:string,i:number)=>text(s,margin,68+i*25,21,'helvetica','bold'));y=68+(wrapped.length-1)*25+22;text(`${song.artist||song.language} / Chord key: ${keyName(song)||'not set'} / Capo: ${song.capo||'none'} / Sounds: ${soundingKey(song)||'not set'}`,margin,y,9,'helvetica','normal','#647568');y+=22;pdf.setDrawColor('#dfe5df');pdf.line(margin,y,width-margin,y);y+=22;}else y=64;};
 const next=(song?:Song,continued=false)=>{pdf.addPage();header(song,continued)};
 const ensure=(space:number,song?:Song)=>{if(y+space>height-48)next(song,true)};
 const lyricRows=(segments:{chord?:string;text:string}[],song:Song)=>{
 const max=77;const rows:{chords:string,lyrics:string}[]=[];let chords='',lyrics='',cursor=0;
 const flush=()=>{if(cursor){rows.push({chords,lyrics});chords='';lyrics='';cursor=0;}};
 for(const segment of segments){let content=clean(segment.text);let chord=segment.chord?chordFor(song,segment.chord):'';
 // Wrap whole chord/lyric segments first to keep chord anchors with their words.
 if(cursor&&cursor+Math.max(content.length,chord.length+1)>max)flush();
 do{let room=max-cursor;let take=Math.min(content.length,room);if(content.length>room){const space=content.lastIndexOf(' ',room-1);if(space>0)take=space+1;}
 const chunk=content.slice(0,take);const occupied=Math.max(chunk.length,chord?chord.length+1:0,1);
 if(cursor+occupied>max){flush();continue;}
 lyrics=lyrics.padEnd(cursor,' ')+chunk;chords=chords.padEnd(cursor,' ')+chord;cursor+=occupied;content=content.slice(take);chord='';if(content)flush();
 }while(content);}
 flush();return rows;
 };
 header();text('Your songbook.',margin,y+28,32,'helvetica','bold');y+=56;text(`${ready.length} playable ${ready.length===1?'sheet':'sheets'} / Saved in your chosen keys`,margin,y,11,'helvetica','normal','#647568');y+=34;
 for(const s of ready){ensure(22);text(s.title,margin,y,11,'helvetica','bold');text(keyName(s)||'-',width-margin-35,y,11);y+=23;}
 if(!ready){text('Add lyrics and chords to create playable song sheets.',margin,y,11);y+=25;}
 if(includePending&&pending.length){y+=22;ensure(42);text('LYRICS TO ADD',margin,y,9,'helvetica','bold','#647568');y+=21;for(const s of pending){ensure(20);text(s.title,margin,y,10);y+=19;}}
 for(const song of ready){next(song);for(const line of parseSheet(song.content)){
 if(line.type==='space'){y+=7;continue}
 if(line.type==='section'){ensure(67,song);y+=5;text(line.label||'',margin,y,9,'helvetica','bold','#647568');y+=22;continue;}
 for(const row of lyricRows(line.segments||[],song)){const hasChord=!!row.chords.trim();ensure(hasChord?35:22,song);if(hasChord){text(row.chords,margin,y,11,'courier','bold','#157961');y+=13;}text(row.lyrics,margin,y,11,'courier');y+=22;}
 }
 }
 const count=pdf.getNumberOfPages();for(let page=1;page<=count;page++){pdf.setPage(page);pdf.setDrawColor('#dfe5df');pdf.line(margin,height-32,width-margin,height-32);text('CHORDROOM',margin,height-19,7,'helvetica','normal','#647568');text(`${page} / ${count}`,width-margin-30,height-19,7,'helvetica','normal','#647568');}
 pdf.setProperties({title:ready.length===1?ready[0].title+' - Chordroom':'Chordroom Songbook',author:'Personal songbook'});return pdf;
}
