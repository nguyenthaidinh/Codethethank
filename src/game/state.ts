import { scenes, type SceneId } from './story';
export const SAVE_KEY = 'project2011.save';
export interface State { version:1; scene:SceneId; evidence:number[]; view:'completion'|'people'|null; selected:boolean; tested:boolean; question:'why'|'unknown'|null; changed:boolean; frame:number; revealed:boolean; principles:number[]; draft:{name:string;message:string}; star:boolean; ended:boolean; muted:boolean; reduced:boolean }
export const initial:State = {version:1,scene:'S00',evidence:[],view:null,selected:false,tested:false,question:null,changed:false,frame:0,revealed:false,principles:[],draft:{name:'',message:''},star:false,ended:false,muted:true,reduced:false};
export type Action = {type:'next'}|{type:'evidence';index:number}|{type:'view';value:State['view']}|{type:'select'}|{type:'test'}|{type:'question';value:State['question']}|{type:'change'}|{type:'frame'}|{type:'reveal'}|{type:'principle';index:number}|{type:'draft';value:State['draft']}|{type:'star'}|{type:'end'}|{type:'mute'}|{type:'motion'}|{type:'restart'};
export function canNext(s:State) { return s.scene==='S00'||s.scene==='S01'&&!!s.view||s.scene==='S02'&&s.evidence.length===3||s.scene==='S03'&&s.tested&&!!s.question||s.scene==='S04'&&s.revealed||s.scene==='S05'&&s.principles.length===3; }
const add = (items:number[],i:number)=> i>=0&&i<3 ? [...new Set([...items,i])] : items;
export function reducer(s:State,a:Action):State {
  switch(a.type){
    case 'next':return canNext(s)?{...s,scene:scenes[scenes.findIndex(x=>x.id===s.scene)+1].id}:s;
    case 'evidence':return s.scene==='S02'?{...s,evidence:add(s.evidence,a.index)}:s;
    case 'view':return s.scene==='S01'?{...s,view:a.value}:s;
    case 'select':return s.scene==='S03'?{...s,selected:true}:s;
    case 'test':return s.scene==='S03'&&s.selected?{...s,tested:true}:s;
    case 'question':return s.tested?{...s,question:a.value}:s;
    case 'change':return s.scene==='S04'&&s.tested?{...s,changed:true}:s;
    case 'frame':return s.changed?{...s,frame:Math.min(5,s.frame+1)}:s;
    case 'reveal':return s.changed&&s.frame===5?{...s,revealed:true}:s;
    case 'principle':return s.scene==='S05'?{...s,principles:add(s.principles,a.index)}:s;
    case 'draft':return {...s,draft:{name:a.value.name.slice(0,60),message:a.value.message.slice(0,280)}};
    case 'star':return s.scene==='S06'&&s.draft.message.trim()?{...s,star:true,ended:true}:s;
    case 'end':return {...s,ended:true};
    case 'mute':return {...s,muted:!s.muted};
    case 'motion':return {...s,reduced:!s.reduced};
    case 'restart':return {...initial,muted:s.muted,reduced:s.reduced};
  }
}
export function decode(raw:string|null):State {
  try { const x:unknown=JSON.parse(raw??'null'); if(!x||typeof x!=='object')return initial;
    const s=x as State;
    if(s.version!==1||!scenes.some(v=>v.id===s.scene)||!Array.isArray(s.evidence)||!Array.isArray(s.principles)||!s.draft||typeof s.draft.name!=='string'||typeof s.draft.message!=='string')return initial;
    if(!['selected','tested','changed','revealed','star','ended','muted','reduced'].every(k=>typeof s[k as keyof State]==='boolean')||!Number.isInteger(s.frame)||s.frame<0||s.frame>5||![null,'completion','people'].includes(s.view)||![null,'why','unknown'].includes(s.question)) return initial;
    const cleaned={...s,evidence:[...new Set(s.evidence.filter(i=>Number.isInteger(i)&&i>=0&&i<3))],principles:[...new Set(s.principles.filter(i=>Number.isInteger(i)&&i>=0&&i<3))],draft:{name:s.draft.name.slice(0,60),message:s.draft.message.slice(0,280)}};
    const index=scenes.findIndex(v=>v.id===s.scene);
    if(index>=2&&!s.view||index>=3&&cleaned.evidence.length!==3||index>=4&&(!s.tested||!s.question)||index>=5&&(!s.changed||!s.revealed||s.frame!==5)||index>=6&&cleaned.principles.length!==3)return initial;
    return cleaned;
  }catch{return initial;}
}
