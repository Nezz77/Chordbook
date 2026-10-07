import {pitch} from './music';

/** Lowest capo fret that preserves the target key's major/minor quality. */
export function findCapoFret(originalKey:string,shapeKey:string):number|null{
  const parse=(key:string)=>key.match(/^([A-G](?:#|b|♯|♭)?)(m?)$/);
  const original=parse(originalKey);
  const shape=parse(shapeKey);
  if(!original||!shape||original[2]!==shape[2])return null;
  const target=pitch(original[1]);
  const open=pitch(shape[1]);
  if(target===undefined||open===undefined)return null;
  return (target-open+12)%12;
}
