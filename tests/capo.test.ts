import assert from 'node:assert/strict';
import {test} from 'node:test';
import {findCapoFret} from '../lib/capo';
import {NOTES,pitch,transposeChord} from '../lib/music';

test('finds open, capo 4, and wrapped capo positions',()=>{
  assert.equal(findCapoFret('C','C'),0);
  assert.equal(findCapoFret('E','C'),4);
  assert.equal(findCapoFret('G','C'),7);
  assert.equal(findCapoFret('C','G'),5);
  assert.equal(findCapoFret('C','C#'),11);
});

test('preserves minor quality and accepts enharmonic spelling',()=>{
  assert.equal(findCapoFret('Em','Dm'),2);
  assert.equal(findCapoFret('C#m','Dbm'),0);
  assert.equal(findCapoFret('Bb','G'),3);
  assert.equal(findCapoFret('B♭','G'),3);
});

test('rejects incomplete keys and impossible changes of quality',()=>{
  for(const [original,shape] of [['','C'],['C',''],['H','G'],['C7','C'],['C','Am'],['Am','C']]){
    assert.equal(findCapoFret(original,shape),null);
  }
});

test('every major and minor pairing sounds in the target key at the suggested fret',()=>{
  for(const suffix of ['','m'])for(const target of NOTES)for(const root of NOTES){
    const fret=findCapoFret(target+suffix,root+suffix);
    assert.ok(fret!==null&&fret>=0&&fret<12);
    const sounding=transposeChord(root+suffix,fret);
    assert.equal(pitch(sounding.replace(/m$/,'')),pitch(target));
    assert.equal(sounding.endsWith('m'),suffix==='m');
  }
});
