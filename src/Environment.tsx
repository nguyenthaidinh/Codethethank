import type { State, Action } from './game/state';
import type { Dispatch } from 'react';
import { evidence, montage } from './game/story';

function Chair({x,y,person=false,teacher=false}:{x:number;y:number;person?:boolean;teacher?:boolean}){return <g transform={`translate(${x} ${y})`}>
  <ellipse cx="30" cy="131" rx="56" ry="11" fill="#111c1b" opacity=".3"/>
  <path d="M4 65L-3 125M53 65L64 126" stroke="#292c27" strokeWidth="7"/><path d="M-5 20Q28 8 57 22L53 66H0Z" fill={teacher?'#9b7958':'#4e625b'} stroke="#333d35" strokeWidth="3"/><path d="M0 65L55 64L70 78L11 81Z" fill="#374941"/>
  {person&&<><path d="M17 68L50 74L66 113L48 118L31 88L9 84Z" fill="#273438"/><path d="M12 20Q24 6 39 15L57 54L44 67L8 61Z" fill={teacher?'#c8b18b':'#82908b'}/><path d="M40 29L65 48L86 43" fill="none" stroke={teacher?'#c8b18b':'#82908b'} strokeWidth="12" strokeLinecap="round"/><circle cx="26" cy="0" r="17" fill="#c99b75"/><path d="M9 0Q3-29 29-21Q49-19 43 3L34-5L17-9Z" fill="#29322e"/>{teacher&&<path d="M10-13Q-3 9 13 19L21 10Z" fill="#29322e"/>}</>}
  </g>}
function Desk({x,y,scale=1}:{x:number;y:number;scale?:number}){return <g transform={`translate(${x} ${y}) scale(${scale})`}>
 <path d="M0 43L210 43L247 73L25 73Z" fill="#a18864"/><path d="M25 73H247V84H25Z" fill="#635c49"/><path d="M30 84V170M225 84V170" stroke="#38443e" strokeWidth="10"/><path d="M72 0H161V49H72Z" fill="#283c39" stroke="#54675b" strokeWidth="5"/><path d="M78 5H155V43H78Z" fill="#728f83"/><path d="M87 15H137M87 22H121M87 29H145" stroke="#bfd0b0" strokeWidth="2" opacity=".7"/><path d="M111 49V58M95 59H135" stroke="#25332e" strokeWidth="5"/><path d="M73 64H140" stroke="#c2af8b" strokeWidth="5"/>
 </g>}
export default function Environment({s,dispatch,onEvidence}:{s:State;dispatch:Dispatch<Action>;onEvidence:(index:number)=>void}){
 const lab=['S02','S03'].includes(s.scene);const reunion=s.scene==='S04'&&s.revealed;const galaxy=s.scene==='S06';const journey=s.scene==='S04'&&s.changed&&!s.revealed;
 return <div className={`stage ${lab?'lab-stage':''} ${reunion?'reunion':''} ${galaxy?'galaxy':''}`}>
 <svg viewBox="0 0 1200 570" preserveAspectRatio="xMidYMid slice" role="img" aria-label={lab?'Phòng thực hành đại học trong nắng chiều, An bên bàn máy và chiếc ghế của cô Vân.':galaxy?'Chòm sao tri ân, hai ngôi sao ở cạnh nhau.':'Hội trường tương lai với lõi AION ở trung tâm.'}>
 <defs><linearGradient id="wall" x2="0" y2="1"><stop stopColor="#676b57"/><stop offset="1" stopColor="#303e36"/></linearGradient><linearGradient id="sky" x2="0" y2="1"><stop stopColor="#efc58b"/><stop offset="1" stopColor="#a7b5a0"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stopColor="#4e5949"/><stop offset="1" stopColor="#1b2b28"/></linearGradient><radialGradient id="halo"><stop stopColor="#bddecd" stopOpacity=".3"/><stop offset="1" stopColor="#102126" stopOpacity="0"/></radialGradient><linearGradient id="future" x2="0" y2="1"><stop stopColor="#213c43"/><stop offset="1" stopColor="#0d1a20"/></linearGradient></defs>
 {journey?<g key={s.frame} className="montage-art">
 <path fill="url(#future)" d="M0 0H1200V570H0Z"/><path d="M0 390H1200V570H0Z" fill="#24382f"/>
 <text x="600" y="170" textAnchor="middle" fontFamily="LessonSerif,serif" fontSize="110" fill="#c7d5b5" opacity=".55">{montage[s.frame].year}</text>
 <path d="M200 208H1000" stroke="#758c76" opacity=".5"/>
 {s.frame<2?<><Desk x={430} y={310}/><Chair x={480} y={411} person/><path d="M730 391l50-12 24 35-50 10Z" fill="#d9d4b5"/>{s.frame===1&&<g stroke="#b99878" strokeWidth="3"><path d="M736 397l35 10M742 409l24-18"/></g>}</>:s.frame<4?<><Desk x={430} y={310}/><Chair x={350} y={416} person teacher/><Chair x={510} y={416} person/><Chair x={680} y={416} person teacher/><path d="M350 251H800V275H350Z" fill="#5e7f6b"/>{s.frame===3&&<text x="575" y="269" textAnchor="middle" fontSize="12" fill="#dde1c7">CÔNG TRÌNH NGHIÊN CỨU / ĐƯỢC GHI NHẬN</text>}</>:<><g stroke="#a7c8b3" fill="none"><ellipse cx="600" cy="337" rx="155" ry="100"/><ellipse cx="600" cy="337" rx="65" ry="100"/><path d="M445 337H755M469 287H731M469 387H731"/></g>{[0,1,2,3,4].map(i=><circle key={i} cx={480+i*57} cy={300+(i%2)*70} r="6" fill="#e4d1a2"/>)}<text x="600" y="488" textAnchor="middle" fontSize="16" fill="#d1dbc7">{s.frame===4?'KHOA HỌC · Y TẾ · GIÁO DỤC':'HAI MƯƠI NĂM · MỘT NGUYÊN TẮC'}</text></>}
 </g>:lab?<>
 <path fill="url(#wall)" d="M0 0H1200V360H0Z"/><path fill="url(#floor)" d="M0 360H1200V570H0Z"/>
 <path d="M0 0L200 70H1100L1200 0M200 70V333L0 418M1100 70V333L1200 418M200 333H1100" stroke="#8c8c6a" fill="none" opacity=".3"/>
 <path d="M0 68L157 105V310L0 354Z" fill="url(#sky)" stroke="#343f34" strokeWidth="10"/>
 <path d="M48 79V341M103 93V326M0 211L157 213" stroke="#4d5544" strokeWidth="9"/>
 <path className="sunbeam" d="M0 210L157 211L1090 570H360Z" fill="#f5d698" opacity=".13"/>
 <path d="M240 109H680V246H240Z" fill="#344e43" stroke="#88866b" strokeWidth="9"/><g fill="#c4c6a2" fontFamily="monospace"><text x="269" y="148" fontSize="17">PHÒNG THỰC HÀNH · CNTT</text><text x="269" y="185" fontSize="13" opacity=".7">mục tiêu → dự báo → quyết định</text><path d="M269 204H549M269 218H429" stroke="#a7b594" opacity=".4"/></g>
 <rect x="840" y="113" width="124" height="53" rx="3" fill="#29392f"/><text x="859" y="150" fontSize="30" fontFamily="monospace" fill="#e8d0a0">17:05</text>
 <path d="M1020 168H1145V360H1020Z" fill="#25392f" stroke="#6b7057" strokeWidth="6"/><path d="M1037 188H1129V263H1037Z" fill="#65745e"/><circle cx="1126" cy="289" r="4" fill="#e9c595"/>
 <Desk x={245} y={265} scale={.75}/><Desk x={685} y={265} scale={.75}/>
 <Chair x={365} y={356}/><Chair x={794} y={350}/>
 <path d="M0 477L1200 448M80 570L425 360M1070 570L895 360" stroke="#899279" opacity=".16"/>
 <g transform="translate(350 325) scale(1.32)"><Desk x={0} y={0}/><path d="M176 54L207 52L221 66L188 69Z" fill="#ece0bd"/><path d="M182 57L204 56M187 62L211 61" stroke="#8d8e71"/></g>
 <Chair x={438} y={427} person/>
 <g className={s.scene==='S03'?'teacher-arrives':''}><Chair x={620} y={427} person={s.scene==='S03'} teacher/></g>
 <path d="M0 530Q140 491 269 570H0Z" fill="#142823"/><path d="M1050 570L1100 407H1190L1200 570" fill="#142823"/>
 </>:<>
 <path fill="url(#future)" d="M0 0H1200V570H0Z"/><ellipse cx="600" cy="240" rx="510" ry="350" fill="url(#halo)"/>
 {!galaxy&&<><path d="M0 450L242 320H958L1200 450V570H0Z" fill="#13282e"/><path d="M0 450H1200M0 483H1200M0 530H1200" stroke="#506b6c" opacity=".45"/>{[110,250,950,1090].map(x=><path key={x} d={`M${x} 0V365`} stroke="#91b8b0" strokeWidth="2" opacity=".3"/>)}<path d="M310 55H890V315H310Z" fill="none" stroke="#78938c" opacity=".35"/><text x="600" y="95" textAnchor="middle" fontSize="12" letterSpacing="7" fill="#a7c1b8">{s.scene==='S01'?'FOUNDER PROTOCOL':'AION / GLOBAL AI INDEX #1'}</text><g className="aion-core" transform="translate(600 207)"><path d="M0-80L80 0L0 80L-80 0Z" fill="#315756" stroke="#bcdcc6"/><path d="M0-52L52 0L0 52L-52 0Z" fill="#8cb5a1" fillOpacity=".2" stroke="#cde2ca"/><path d="M-80 0H80M0-80V80" stroke="#bddeca" opacity=".5"/><circle r="11" fill="#d5e7cd"/></g><ellipse cx="600" cy="350" rx="127" ry="17" fill="#88b7a1" opacity=".08"/>{!reunion&&s.scene!=='S05'&&<g fill="#09181d"><circle cx="807" cy="308" r="14"/><path d="M791 326Q807 316 823 326L831 386H784Z"/><path d="M793 380L789 429H801L808 387L816 429H827L821 380Z"/></g>}</>}
 {s.scene==='S05'&&<g>{[0,1,2].map(i=><g key={i}><path d={`M600 285L${400+i*200} 385`} stroke={s.principles.includes(i)?'#d8d4ac':'#42645c'} strokeWidth="2"/><circle cx={400+i*200} cy="385" r="29" fill={s.principles.includes(i)?'#c9d9b8':'#223c37'} stroke="#9ebaa3"/><text x={400+i*200} y="391" textAnchor="middle" fontSize="16" fill={s.principles.includes(i)?'#223c37':'#c9d9b8'}>{s.principles.includes(i)?'✓':`0${i+1}`}</text></g>)}<text x="600" y="470" textAnchor="middle" fontFamily="LessonSerif,serif" fontSize="24" fill="#d3dfc7">Dự báo ≠ Phán quyết</text></g>}
 {galaxy&&<>{Array.from({length:55},(_,i)=><circle key={i} cx={(i*197+57)%1200} cy={(i*i*39+50)%500} r={i%7===0?2:1} fill="#b0cfc2" opacity={.2+(i%5)/8}/>)}<path d="M232 334L453 162L620 273L814 127L999 294" fill="none" stroke="#8daea0" strokeWidth="1" opacity=".4"/><g fill="#f2d7a7">{[[453,162],[620,273],...(s.star?[[814,127]]:[])].map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}><circle r="24" opacity=".07"/><path d="M0-12L3-3L12 0L3 3L0 12L-3 3L-12 0L-3-3Z"/></g>)}</g><text x="600" y="450" textAnchor="middle" fontFamily="LessonSerif,serif" fontSize="24" fill="#d6dfcc">Có người đã ở lại. Có người được đi tiếp.</text></>}
 {reunion&&<g transform="translate(160 0)"><Desk x={280} y={331}/><Chair x={365} y={426} person/><g className="teacher-arrives"><Chair x={540} y={426} person teacher/></g></g>}
 </>}
 </svg>
 <div className="stage-caption"><span>{lab?'KÝ ỨC 2026':galaxy?'CHÒM SAO TRI ÂN':'THẾ GIỚI HƯ CẤU / 2046'}</span><span>{lab?'17:05 · Sau giờ học':galaxy?'Mỗi lời cảm ơn là một khởi đầu':'Khoa học · Y tế · Giáo dục'}</span></div>
 {s.scene==='S02'&&<div className="spatial-hotspots">{evidence.map((e,i)=><button key={e.title} className={`spot spot-${i}`} onClick={()=>{dispatch({type:'evidence',index:i});onEvidence(i);}} aria-label={`Khám phá ${e.title}`}><span>{s.evidence.includes(i)?'✓':`0${i+1}`}</span><b>{e.title}</b></button>)}</div>}
 </div>
}
