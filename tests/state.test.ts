import { describe,expect,it } from 'vitest';
import { initial,reducer,decode } from '../src/game/state';
describe('story gates',()=>{
it('requires distinct evidence and does not skip An test',()=>{let s={...initial,scene:'S02' as const};s=reducer(s,{type:'evidence',index:0}) as typeof s;s=reducer(s,{type:'evidence',index:0}) as typeof s;expect(s.evidence).toEqual([0]);expect(reducer(s,{type:'next'}).scene).toBe('S02');expect(reducer({...s,scene:'S03'},{type:'test'}).tested).toBe(false);});
it('requires rule change and all montage frames before reveal',()=>{const s={...initial,scene:'S04' as const,tested:true};expect(reducer(s,{type:'reveal'}).revealed).toBe(false);expect(reducer({...s,changed:true},{type:'reveal'}).revealed).toBe(false);expect(reducer({...s,changed:true,frame:5},{type:'reveal'}).revealed).toBe(true);});
it('recovers invalid, old and inconsistent saves safely',()=>{for(const raw of ['{bad','null',JSON.stringify({...initial,version:0}),JSON.stringify({...initial,scene:'S06'}),JSON.stringify({...initial,muted:'false'})])expect(decode(raw)).toEqual(initial);expect(decode(JSON.stringify({...initial,scene:'S01',view:'people'})).view).toBe('people');});
it('rejects whitespace messages and limits text without interpreting HTML',()=>{const s={...initial,scene:'S06' as const,draft:{name:'',message:'   '}};expect(reducer(s,{type:'star'}).star).toBe(false);expect(reducer(s,{type:'draft',value:{name:'a'.repeat(100),message:'b'.repeat(400)}}).draft.message).toHaveLength(280);});
});
