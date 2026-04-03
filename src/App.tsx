import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ━━━━━━━━━━━━━━━━━━━━━ TYPES ━━━━━━━━━━━━━━━━━━━━━
interface Profile { name:string; income:number; fico:number; debt:number; savings:number; county:string; household:number; jobYears:number; firstTime:boolean; firstGen:boolean; education:boolean; }
interface DPA { id:string; name:string; short:string; max:number; pctCap?:number; type:string; forgiveYrs?:number; incomeLimit:number; ficoMin:number; priceLimit:number; status:"open"|"closed"; coverage:string; url:string; phone:string; notes:string; reqFirstTime:boolean; reqFirstGen:boolean; }
interface Listing { id:number; name:string; price:number; beds:number; baths:number; sqft:number; city:string; builder:string; url:string; }

// ━━━━━━━━━━━━━━━━━━━━━ DATA ━━━━━━━━━━━━━━━━━━━━━
const PROGRAMS: DPA[] = [
  { id:"firstgen", name:"First-Generation Homebuyers Community DPA Fund", short:"First-Gen DPA", max:32000, pctCap:10, type:"Forgivable (5yr)", forgiveYrs:5, incomeLimit:132400, ficoMin:0, priceLimit:515200, status:"closed", coverage:"Statewide", url:"firstgendpa.org", phone:"firstgendpa.org", notes:"0% interest, forgiven 20%/yr. Portal currently closed.", reqFirstTime:false, reqFirstGen:true },
  { id:"welcome", name:"Welcome Home Down Payment Assistance", short:"Welcome Home", max:50000, pctCap:30, type:"Forgivable (10yr)", forgiveYrs:10, incomeLimit:160000, ficoMin:0, priceLimit:766550, status:"open", coverage:"Statewide", url:"nwhomepartners.org", phone:"651-292-8710", notes:"Up to 30% of price capped at $50K. Approved partners only. $1K own funds required.", reqFirstTime:true, reqFirstGen:false },
  { id:"startup", name:"MHFA Start Up + Deferred Payment Loan", short:"MHFA Start Up", max:18000, type:"Deferred (0%)", incomeLimit:152200, ficoMin:640, priceLimit:659550, status:"open", coverage:"Statewide", url:"mnhousing.gov", phone:"mnhousing.gov", notes:"Below-market rate mortgage + up to $18K DPA. Repaid at sale/refi.", reqFirstTime:true, reqFirstGen:false },
  { id:"dakotacda", name:"Dakota County CDA First Time Homebuyer", short:"Dakota CDA", max:8500, type:"Deferred (0%)", incomeLimit:103900, ficoMin:640, priceLimit:515300, status:"open", coverage:"Dakota County", url:"dakotacda.org", phone:"651-675-4472", notes:"+ Mortgage Credit Certificate (MCC) up to $2K/yr tax credit.", reqFirstTime:true, reqFirstGen:false },
  { id:"commkeys", name:"Community Keys Plus Impact", short:"Community Keys+", max:20000, type:"Deferred (0%)", incomeLimit:120000, ficoMin:0, priceLimit:515200, status:"open", coverage:"5-county metro", url:"nwhomepartners.org", phone:"651-292-8710", notes:"Census tract restricted. MHFA portion covers FHA 3.5%.", reqFirstTime:false, reqFirstGen:false },
  { id:"stepup", name:"MHFA Step Up Program", short:"MHFA Step Up", max:14000, type:"Monthly Payment", incomeLimit:170000, ficoMin:640, priceLimit:659550, status:"open", coverage:"Statewide", url:"mnhousing.gov", phone:"mnhousing.gov", notes:"For buyers exceeding Start Up limits. 10-year term.", reqFirstTime:false, reqFirstGen:false },
  { id:"chenoa", name:"Chenoa Fund DPA", short:"Chenoa Fund", max:20000, pctCap:3.5, type:"Forgivable (3yr)", forgiveYrs:3, incomeLimit:999999, ficoMin:620, priceLimit:552000, status:"open", coverage:"Nationwide", url:"chenoafund.org", phone:"chenoafund.org", notes:"Covers FHA 3.5% as second mortgage.", reqFirstTime:false, reqFirstGen:false },
  { id:"naf", name:"New American Funding DPA", short:"NAF DPA", max:6000, type:"Deferred", incomeLimit:999999, ficoMin:620, priceLimit:766550, status:"open", coverage:"Nationwide", url:"newamericanfunding.com", phone:"newamericanfunding.com", notes:"Combinable with MN Housing DPA.", reqFirstTime:false, reqFirstGen:false },
];

const LISTINGS: Listing[] = [
  { id:1, name:"Mercer Plan, Meadowview Preserve", price:489990, beds:3, baths:3, sqft:2500, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375621_zpid/" },
  { id:2, name:"Ivy Plan, Meadowview Preserve", price:509990, beds:3, baths:3, sqft:2800, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375651_zpid/" },
  { id:3, name:"Continental Plan, Meadowview Preserve", price:519990, beds:4, baths:3, sqft:3000, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375649_zpid/" },
  { id:4, name:"Sequoia Plan, Voyageur Farms", price:515990, beds:5, baths:3, sqft:2500, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/voyageur-farms/2056470147_zpid/" },
  { id:5, name:"Vanderbilt Plan, Cedar Hills", price:537990, beds:4, baths:3, sqft:2200, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/cedar-hills-discovery-collection/2067647389_zpid/" },
  { id:6, name:"Vanderbilt Plan, Amelia Meadows", price:549990, beds:4, baths:3, sqft:2200, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/amelia-meadows-amelia-meadows-landmark/460901813_zpid/" },
  { id:7, name:"19289 Everfield Ave", price:602990, beds:3, baths:3, sqft:2800, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/homedetails/19289-Everfield-Ave-Farmington-MN-55024/459962118_zpid/" },
  { id:8, name:"Lewis Plan, Caslano", price:600990, beds:4, baths:3, sqft:2600, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/caslano/2055879828_zpid/" },
];

const COUNTIES=["","Anoka","Carver","Chisago","Dakota","Hennepin","Isanti","Ramsey","Scott","Sherburne","Washington","Wright","Other MN"];
const CHECKLIST=[
  {id:"credit",label:"Check your credit score (all 3 bureaus)",tip:"Free at annualcreditreport.com"},
  {id:"w2",label:"Gather 2 years of W-2s / tax returns",tip:"Lenders require proof of income history"},
  {id:"education",label:"Complete homebuyer education course",tip:"Required for most DPA programs. Home Stretch or Framework online."},
  {id:"counselor",label:"Meet with a HUD-certified counselor",tip:"Free service. Find at hocmn.org"},
  {id:"preapproval",label:"Get a pre-approval letter",tip:"Shows sellers you're a serious buyer"},
  {id:"dpa",label:"Apply for down payment assistance",tip:"First-come, first-served. Apply as soon as eligible."},
  {id:"agent",label:"Find a buyer's agent",tip:"Typically free to you (paid by seller)"},
  {id:"offer",label:"Make an offer on a home",tip:"Your agent will help negotiate"},
];

// ━━━━━━━━━━━━━━━━━━━━━ HELPERS ━━━━━━━━━━━━━━━━━━━━━
const $=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const $k=(n:number)=>n>=1000?`$${(n/1000).toFixed(0)}K`:$(n);
const pmt=(p:number,r:number,y:number)=>{const mr=r/100/12,n=y*12;return mr===0?p/n:(p*mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1);};
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));

function getReadiness(p:Profile):{score:number;label:string;color:string;items:{label:string;ok:boolean;detail:string}[]} {
  const items = [
    {label:"Credit Score",ok:p.fico>=620,detail:p.fico>=740?"Excellent":p.fico>=670?"Good":p.fico>=620?"Meets minimum":"Below 620 minimum"},
    {label:"Employment",ok:p.jobYears>=2,detail:p.jobYears>=2?`${p.jobYears} years (meets 2yr requirement)`:`${p.jobYears} year(s) — lenders prefer 2+`},
    {label:"Income Documented",ok:p.income>0,detail:p.income>0?`${$(p.income)}/year`:"Enter your income"},
    {label:"DTI Ratio",ok:p.income>0&&((p.debt/(p.income/12))*100)<=43,detail:p.income>0?`${((p.debt/(p.income/12))*100).toFixed(0)}% — ${((p.debt/(p.income/12))*100)<=43?"within limits":"over 43%"}`:"N/A"},
    {label:"Savings",ok:p.savings>=5000,detail:p.savings>=5000?`${$(p.savings)} available`:"Build reserves"},
    {label:"Homebuyer Education",ok:p.education,detail:p.education?"Completed":"Required for most DPA programs"},
  ];
  const score=Math.round((items.filter(i=>i.ok).length/items.length)*100);
  return {score,label:score>=80?"Ready":score>=60?"Almost Ready":score>=40?"Getting There":"Needs Work",color:score>=80?"#16a34a":score>=60?"#ca8a04":score>=40?"#ea580c":"#dc2626",items};
}

function eligibleFor(prog:DPA,p:Profile):{ok:boolean;reason:string}{
  if(prog.reqFirstGen&&!p.firstGen)return{ok:false,reason:"First-gen only"};
  if(prog.reqFirstTime&&!p.firstTime)return{ok:false,reason:"First-time only"};
  if(p.income>prog.incomeLimit&&prog.incomeLimit<900000)return{ok:false,reason:"Income over limit"};
  if(p.fico<prog.ficoMin&&prog.ficoMin>0)return{ok:false,reason:`FICO < ${prog.ficoMin}`};
  return{ok:true,reason:"Eligible"};
}

// ━━━━━━━━━━━━━━━━━━━━━ COMPONENTS ━━━━━━━━━━━━━━━━━━━━━
function DonutChart({segments,size=160,label}:{segments:{value:number;color:string;label:string}[];size?:number;label?:string}){
  const total=segments.reduce((a,s)=>a+s.value,0);
  const r=size*0.35,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  let offset=circ*0.25;
  return(
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s,i)=>{const len=(s.value/total)*circ;const el=(<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size*0.11} strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-offset} strokeLinecap="round" className="chart-anim"/>);offset+=len;return el;})}
        {label&&<text x={cx} y={cy-4} textAnchor="middle" style={{fontSize:size*0.12,fontWeight:700,fill:"hsl(var(--foreground))"}}>{label}</text>}
        {label&&<text x={cx} y={cy+size*0.09} textAnchor="middle" style={{fontSize:size*0.065,fill:"hsl(var(--muted-foreground))"}}>/ month</text>}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
        {segments.map((s,i)=>(<div key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{background:s.color}}/><span className="text-[10px] text-muted-foreground">{s.label}</span></div>))}
      </div>
    </div>
  );
}

function KPI({label,value,sub,color,icon}:{label:string;value:string;sub?:string;color?:string;icon?:string}){
  return(
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold leading-tight" style={{color:color||"hsl(var(--foreground))"}}>{value}</p>
            {sub&&<p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          {icon&&<span className="text-2xl opacity-20">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function ReadinessGauge({score,label,color}:{score:number;label:string;color:string}){
  const r=48,cx=60,cy=60,circ=2*Math.PI*r,arc=circ*0.75,off=arc-(score/100)*arc;
  return(
    <div className="flex flex-col items-center">
      <svg width="120" height="100" viewBox="0 0 120 100">
        <path d="M 12 88 A 48 48 0 1 1 108 88" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 12 88 A 48 48 0 1 1 108 88" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={off} className="gauge-anim"/>
        <text x={cx} y="58" textAnchor="middle" style={{fontSize:"22px",fontWeight:700,fill:"hsl(var(--foreground))"}}>{score}%</text>
        <text x={cx} y="76" textAnchor="middle" style={{fontSize:"10px",fill:color,fontWeight:600}}>{label}</text>
      </svg>
    </div>
  );
}

function Row({l,v,bold,green}:{l:string;v:string;bold?:boolean;green?:boolean}){
  return(<div className={`flex justify-between py-1 ${bold?"font-semibold":""}`}><span className="text-xs text-muted-foreground">{l}</span><span className={`text-xs ${green?"text-emerald-600":""} ${bold?"text-sm font-bold":""}`}>{v}</span></div>);
}

// ━━━━━━━━━━━━━━━━━━━━━ NAV ITEMS ━━━━━━━━━━━━━━━━━━━━━
const NAV=[
  {id:"ready",label:"Readiness",icon:"📊"},
  {id:"afford",label:"Affordability",icon:"💰"},
  {id:"programs",label:"DPA Programs",icon:"🏛"},
  {id:"search",label:"Home Search",icon:"🏡"},
  {id:"checklist",label:"Milestones",icon:"✅"},
];

// ━━━━━━━━━━━━━━━━━━━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━
export default function App(){
  const [p,setP]=useState<Profile>({name:"",income:0,fico:0,debt:0,savings:0,county:"",household:1,jobYears:0,firstTime:false,firstGen:false,education:false});
  const [started,setStarted]=useState(false);
  const [view,setView]=useState("ready");
  const [price,setPrice]=useState(350000);
  const [rate,setRate]=useState(7.0);
  const [downPct,setDownPct]=useState(3.5);
  const [debtReduce,setDebtReduce]=useState(0);
  const [selProgs,setSelProgs]=useState<Set<string>>(new Set());
  const [selListing,setSelListing]=useState<number|null>(null);
  const [zUrl,setZUrl]=useState("");
  const [activeUrl,setActiveUrl]=useState("");
  const [customPrice,setCustomPrice]=useState(0);
  const [checks,setChecks]=useState<Set<string>>(new Set());
  const [sidebarOpen,setSidebarOpen]=useState(true);

  const effDebt=Math.max(0,p.debt-debtReduce);
  const mi=p.income/12||1;
  const dti=mi>1?(effDebt/mi)*100:0;

  const readiness=useMemo(()=>getReadiness(p),[p]);

  const eligProgs=useMemo(()=>PROGRAMS.map(pr=>({...pr,...eligibleFor(pr,p)})),[p]);

  useEffect(()=>{if(started){const s=new Set<string>();eligProgs.forEach(pr=>{if(pr.ok&&pr.status!=="closed")s.add(pr.id)});setSelProgs(s);}},[started]);

  const totalDPA=useMemo(()=>{let t=0;selProgs.forEach(id=>{const pr=PROGRAMS.find(x=>x.id===id);if(!pr)return;let a=pr.max;if(pr.pctCap)a=Math.min(a,price*pr.pctCap/100);t+=a;});return t;},[selProgs,price]);

  const mort=useMemo(()=>{
    const dp=price*downPct/100,cc=price*0.03,cash=dp+cc,oop=Math.max(0,cash-totalDPA);
    const loan=price-dp,mipUp=loan*0.0175,tl=loan+mipUp;
    const piAmt=pmt(tl,rate,30),tax=(price*0.012)/12,ins=200,mip=(loan*0.0055)/12;
    const total=piAmt+tax+ins+mip;
    const fDTI=mi>1?(total/mi)*100:0,bDTI=mi>1?((total+effDebt)/mi)*100:0;
    return{dp,cc,cash,oop,loan,tl,pi:piAmt,tax,ins,mip,total,fDTI,bDTI};
  },[price,rate,downPct,p.income,effDebt,totalDPA]);

  const maxAfford=useMemo(()=>{
    if(p.income<=0)return 0;
    const maxPayment=(p.income/12)*0.43-effDebt;
    if(maxPayment<=0)return 0;
    const mr=rate/100/12,n=360;
    const maxLoan=mr===0?maxPayment*n:maxPayment*(Math.pow(1+mr,n)-1)/(mr*Math.pow(1+mr,n));
    const grossPrice=maxLoan/(1-downPct/100);
    return Math.round(grossPrice/1000)*1000;
  },[p.income,effDebt,rate,downPct]);

  const amortData=useMemo(()=>{
    const data:number[][]=[];let bal=mort.tl;const mr=rate/100/12;
    for(let y=1;y<=30;y++){let intY=0,prinY=0;for(let m=0;m<12;m++){const int=bal*mr;const prin=mort.pi-int;intY+=int;prinY+=prin;bal-=prin;}
    data.push([y,Math.round(bal),Math.round(prinY),Math.round(intY)]);}return data;
  },[mort.tl,mort.pi,rate]);

  const filteredListings=useMemo(()=>LISTINGS.filter(l=>l.price<=maxAfford*1.1||maxAfford===0).sort((a,b)=>a.price-b.price),[maxAfford]);

  const toggleProg=useCallback((id:string)=>{setSelProgs(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});},[]);
  const handleSearch=useCallback(()=>{const q=zUrl.trim();if(!q)return;setActiveUrl(q.startsWith("http")?q:`https://www.zillow.com/homes/${q.replace(/[,]/g,"").replace(/\s+/g,"-")}_rb/`);setSelListing(null);},[zUrl]);

  // ━━━ ONBOARDING ━━━
  if(!started) return(
    <TooltipProvider>
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"linear-gradient(160deg,#0f1b2d 0%,#152238 40%,#1a2d3d 100%)"}}>
      <Card className="w-full max-w-lg shadow-2xl border-0 fade-in">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-white" style={{background:"linear-gradient(135deg,#1a5276,#2d8b8b)"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <CardTitle className="text-xl font-bold">Minnesota Homebuyer Dashboard</CardTitle>
          <CardDescription>Enter your financial profile to see what you can afford, which DPA programs you qualify for, and find your home.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-6 px-6">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name</Label><Input placeholder="First name" value={p.name} onChange={e=>setP(x=>({...x,name:e.target.value}))} className="mt-1 h-9"/></div>
            <div><Label className="text-xs">County</Label><Select value={p.county} onValueChange={v=>setP(x=>({...x,county:v}))}><SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent>{COUNTIES.filter(Boolean).map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Annual Gross Income</Label><Input type="number" placeholder="e.g. 90000" value={p.income||""} onChange={e=>setP(x=>({...x,income:+e.target.value}))} className="mt-1 h-9"/></div>
            <div><Label className="text-xs">FICO Score</Label><Input type="number" placeholder="e.g. 640" value={p.fico||""} onChange={e=>setP(x=>({...x,fico:clamp(+e.target.value,0,850)}))} className="mt-1 h-9"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Monthly Debt Payments</Label><Input type="number" placeholder="e.g. 800" value={p.debt||""} onChange={e=>setP(x=>({...x,debt:+e.target.value}))} className="mt-1 h-9"/></div>
            <div><Label className="text-xs">Savings / Liquid Assets</Label><Input type="number" placeholder="e.g. 10000" value={p.savings||""} onChange={e=>setP(x=>({...x,savings:+e.target.value}))} className="mt-1 h-9"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Household Size</Label><Input type="number" placeholder="1" value={p.household||""} onChange={e=>setP(x=>({...x,household:clamp(+e.target.value,1,10)}))} className="mt-1 h-9"/></div>
            <div><Label className="text-xs">Years at Current Job</Label><Input type="number" placeholder="e.g. 2" value={p.jobYears||""} onChange={e=>setP(x=>({...x,jobYears:+e.target.value}))} className="mt-1 h-9"/></div>
          </div>
          <Separator/>
          <div className="space-y-2.5">
            {[["I'm a first-time homebuyer","firstTime"],["I'm a first-generation buyer","firstGen"],["I've completed homebuyer education","education"]].map(([label,key])=>(
              <div key={key} className="flex items-center justify-between"><Label className="text-xs">{label}</Label><Switch checked={(p as any)[key]} onCheckedChange={v=>setP(x=>({...x,[key]:v}))}/></div>
            ))}
          </div>
          {(!p.income||!p.fico||!p.county)&&<p className="text-xs text-destructive text-center">Please enter income, FICO score, and county.</p>}
          <Button className="w-full h-11 font-semibold" disabled={!p.income||!p.fico||!p.county} style={{background:(!p.income||!p.fico||!p.county)?"#64748b":"linear-gradient(135deg,#1a5276,#2d8b8b)"}} onClick={()=>setStarted(true)}>Launch Dashboard →</Button>
          <p className="text-[10px] text-center text-muted-foreground">Educational tool only. Not financial advice.</p>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );

  // ━━━ MAIN DASHBOARD ━━━
  return(
    <TooltipProvider>
    <div className="min-h-screen flex" style={{background:"#eef1f5"}}>
      {/* SIDEBAR */}
      <aside className={`sidebar-bg text-white flex-shrink-0 transition-all duration-300 ${sidebarOpen?"w-56":"w-14"} flex flex-col`} style={{minHeight:"100vh"}}>
        <div className="p-3 flex items-center gap-2 border-b border-white/10">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
          {sidebarOpen&&<span className="text-sm font-semibold truncate">MN Homebuyer</span>}
        </div>
        <nav className="flex-1 py-2">
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${view===n.id?"bg-white/15 text-white":"text-white/60 hover:text-white/90 hover:bg-white/5"}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              {sidebarOpen&&<span className="text-xs font-medium">{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen&&(
          <div className="p-3 border-t border-white/10 space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Profile</p>
            <p className="text-xs text-white/80 truncate">{p.name||"User"} · {p.county}</p>
            <p className="text-xs text-white/50">{$(p.income)}/yr · FICO {p.fico}</p>
            <Button variant="ghost" size="sm" className="w-full text-[10px] text-white/50 hover:text-white h-6 mt-1" onClick={()=>setStarted(false)}>Edit Profile</Button>
          </div>
        )}
      </aside>

      {/* MAIN CANVAS */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1300px] mx-auto p-4 lg:p-6 space-y-4">

          {/* KPI ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <KPI label="Max Affordable" value={maxAfford>0?$k(maxAfford):"—"} sub="Based on 43% DTI" color="#1a5276" icon="🏠"/>
            <KPI label="Est. Monthly Payment" value={p.income>0?$(mort.total):"—"} sub={`at ${$(price)} · ${rate}%`} color={mort.bDTI<=43?"#16a34a":mort.bDTI<=50?"#ca8a04":"#dc2626"} icon="📅"/>
            <KPI label="Cash to Close" value={$(mort.oop)} sub={mort.oop===0?"DPA covers all":"After DPA"} color={mort.oop===0?"#16a34a":"#1a5276"} icon="💵"/>
            <KPI label="DPA Available" value={$k(totalDPA)} sub={`${selProgs.size} program(s)`} color="#2d8b8b" icon="🎁"/>
            <KPI label="Readiness" value={`${readiness.score}%`} sub={readiness.label} color={readiness.color} icon="📊"/>
          </div>

          {/* ━━━ READINESS VIEW ━━━ */}
          {view==="ready"&&(
            <div className="grid lg:grid-cols-3 gap-4 fade-in">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Mortgage Readiness</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ReadinessGauge score={readiness.score} label={readiness.label} color={readiness.color}/>
                  <div className="space-y-2">
                    {readiness.items.map(item=>(
                      <div key={item.label} className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${item.ok?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{item.ok?"✓":"✗"}</div>
                        <div><p className="text-xs font-medium">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.detail}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Your Financial Snapshot</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Income & Debt</h4>
                      <Row l="Gross Monthly Income" v={$(p.income/12)}/>
                      <Row l="Monthly Debt Payments" v={$(p.debt)}/>
                      <Row l="Debt Reduction Applied" v={debtReduce>0?`- ${$(debtReduce)}`:"None"}/>
                      <Row l="Effective Monthly Debt" v={$(effDebt)}/>
                      <Separator className="my-2"/>
                      <Row l="Current DTI (debt only)" v={`${dti.toFixed(1)}%`} bold/>
                      <Row l="DTI + Housing at target" v={`${mort.bDTI.toFixed(1)}%`} bold/>
                      <div className="mt-3">
                        <Label className="text-xs">Debt reduction ($/mo)</Label>
                        <Input type="number" placeholder="0" value={debtReduce||""} onChange={e=>setDebtReduce(Math.max(0,+e.target.value))} className="mt-1 h-8 text-xs"/>
                        <p className="text-[10px] text-muted-foreground mt-1">If you plan to pay off or transfer a debt before applying.</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Payment Breakdown</h4>
                      <DonutChart size={180} label={$(mort.total)} segments={[
                        {value:mort.pi,color:"#1a5276",label:`P&I ${$(mort.pi)}`},
                        {value:mort.tax,color:"#2d8b8b",label:`Tax ${$(mort.tax)}`},
                        {value:mort.ins,color:"#e67e22",label:`Ins ${$(mort.ins)}`},
                        {value:mort.mip,color:"#8e44ad",label:`MIP ${$(mort.mip)}`},
                      ]}/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ━━━ AFFORDABILITY VIEW ━━━ */}
          {view==="afford"&&(
            <div className="grid lg:grid-cols-3 gap-4 fade-in">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Adjust Scenario</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {([
                    ["Target Price",price,setPrice,100000,750000,5000,$(price)],
                    ["Interest Rate",rate,setRate,4.5,9.5,0.125,`${rate}%`],
                    ["Down Payment",downPct,setDownPct,0,20,0.5,`${downPct}%`],
                  ] as [string,number,(v:number)=>void,number,number,number,string][]).map(([label,val,setter,min,max,step,display])=>(
                    <div key={label}><div className="flex justify-between"><Label className="text-xs">{label}</Label><span className="text-xs font-bold">{display}</span></div><Slider min={min} max={max} step={step} value={[val]} onValueChange={([v])=>setter(v)} className="mt-2"/></div>
                  ))}
                  {price>515200&&<p className="text-[10px] text-destructive">Exceeds $515,200 First-Gen DPA purchase limit</p>}
                  <Separator/>
                  <div className="rounded-lg bg-muted/60 p-3 space-y-1">
                    <Row l="Max you can afford (43% DTI)" v={maxAfford>0?$(maxAfford):"—"} bold/>
                    <Row l="Target price" v={$(price)}/>
                    <Row l={price<=maxAfford?"Within budget":"Over budget"} v={price<=maxAfford?"✓":"⚠"} bold green={price<=maxAfford}/>
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Cost Analysis</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Monthly Payment</h4>
                      <Row l="Principal & Interest" v={$(mort.pi)}/>
                      <Row l="Property Tax (est.)" v={$(mort.tax)}/>
                      <Row l="Insurance" v={$(mort.ins)}/>
                      <Row l="FHA MIP" v={$(mort.mip)}/>
                      <Separator className="my-1"/>
                      <Row l="Total PITI + MIP" v={$(mort.total)} bold/>
                      <Separator className="my-1"/>
                      <Row l="Front-End DTI" v={`${mort.fDTI.toFixed(1)}%`}/>
                      <Row l="Back-End DTI" v={`${mort.bDTI.toFixed(1)}%`} bold/>
                      <div className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded ${mort.bDTI<=43?"bg-emerald-50 text-emerald-700":mort.bDTI<=50?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>
                        {mort.bDTI<=43?"✓ Qualifies (under 43%)":mort.bDTI<=50?"⚡ Borderline (43-50%)":"⚠ Over 50% — reduce debt or price"}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Cash to Close</h4>
                      <Row l={`Down Payment (${downPct}%)`} v={$(mort.dp)}/>
                      <Row l="Closing Costs (3%)" v={$(mort.cc)}/>
                      <Row l="Total Needed" v={$(mort.cash)}/>
                      <Row l="DPA Applied" v={`(${$(totalDPA)})`} green/>
                      <Separator className="my-1"/>
                      <Row l="Your Out-of-Pocket" v={$(mort.oop)} bold/>
                      {mort.oop===0&&<p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ DPA covers everything. $0 out of pocket.</p>}
                      <Separator className="my-2"/>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-3">30-Year Interest Cost</h4>
                      <Row l="Total interest paid" v={$(amortData.reduce((a,d)=>a+d[3],0))}/>
                      <Row l="Total cost of home" v={$(price+amortData.reduce((a,d)=>a+d[3],0))}/>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ━━━ PROGRAMS VIEW ━━━ */}
          {view==="programs"&&(
            <div className="space-y-4 fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-muted-foreground"><span className="font-bold" style={{color:"#2d8b8b"}}>{$(totalDPA)}</span> total from {selProgs.size} program(s)</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>{const s=new Set<string>();eligProgs.forEach(x=>{if(x.ok)s.add(x.id)});setSelProgs(s);}}>Select All Eligible</Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>setSelProgs(new Set())}>Clear</Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {eligProgs.map(pr=>(
                  <Card key={pr.id} className={`cursor-pointer transition-all hover:shadow-lg ${selProgs.has(pr.id)?"ring-2 ring-[#2d8b8b] shadow-md":""} ${!pr.ok?"opacity-50":""}`} onClick={()=>toggleProg(pr.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div><h4 className="font-semibold text-sm">{pr.short}</h4><p className="text-[10px] text-muted-foreground">{pr.name}</p></div>
                        <Switch checked={selProgs.has(pr.id)} onCheckedChange={()=>toggleProg(pr.id)} onClick={e=>e.stopPropagation()}/>
                      </div>
                      <p className="text-xl font-bold" style={{color:"#2d8b8b"}}>{$(pr.max)}</p>
                      <Badge variant="outline" className={`text-[9px] mt-1 ${pr.status==="open"?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"}`}>{pr.status}</Badge>
                      <Badge className={`text-[9px] mt-1 ml-1 ${pr.ok?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{pr.ok?"Eligible":pr.reason}</Badge>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mt-2">
                        <span className="text-muted-foreground">Type</span><span className="font-medium">{pr.type}</span>
                        <span className="text-muted-foreground">Income Limit</span><span className="font-medium">{pr.incomeLimit>900000?"None":$(pr.incomeLimit)}</span>
                        <span className="text-muted-foreground">FICO</span><span className="font-medium">{pr.ficoMin||"None"}</span>
                        <span className="text-muted-foreground">Price Limit</span><span className="font-medium">{$(pr.priceLimit)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1.5">{pr.notes}</p>
                      <a href={`https://${pr.url}`} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline" onClick={e=>e.stopPropagation()}>{pr.url}</a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ━━━ SEARCH VIEW ━━━ */}
          {view==="search"&&(
            <div className="grid lg:grid-cols-5 gap-4 fade-in">
              <div className="lg:col-span-2 space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">Find Homes</CardTitle>
                    {maxAfford>0&&<CardDescription className="text-xs">You can afford up to <strong style={{color:"#2d8b8b"}}>{$(maxAfford)}</strong></CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Search Zillow</Label>
                      <div className="flex gap-2 mt-1"><Input placeholder="City, zip, or Zillow URL..." value={zUrl} onChange={e=>setZUrl(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleSearch();}} className="text-xs h-8"/><Button size="sm" className="h-8 text-xs px-3" style={{background:"#1a5276"}} onClick={handleSearch}>Go</Button></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[["Farmington","Farmington-MN/new-construction/"],["Lakeville","Lakeville-MN/new-construction/"],["Eagan","Eagan-MN/"],["Apple Valley","Apple-Valley-MN/"],["Under $500K","twin-cities-mn/?searchQueryState=%7B%22filterState%22%3A%7B%22price%22%3A%7B%22max%22%3A500000%7D%7D%7D"],["Dakota County","dakota-county-mn/"]].map(([label,q])=>(
                        <Button key={label} variant="outline" size="sm" className="text-[10px] h-6 justify-start" onClick={()=>{setActiveUrl(`https://www.zillow.com/${q}`);setZUrl(label);setSelListing(null);}}>{label}</Button>
                      ))}
                    </div>
                    <div><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Listing price</Label>
                      <div className="flex gap-2 mt-1 items-center"><span className="text-xs text-muted-foreground">$</span><Input type="number" placeholder="Enter price" value={customPrice||""} onChange={e=>setCustomPrice(+e.target.value)} className="text-xs h-8"/><Button variant="outline" size="sm" className="h-8 text-xs" disabled={!customPrice} onClick={()=>setPrice(customPrice)}>Apply</Button></div>
                    </div>
                    <Separator/>
                    <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Curated Listings</p>
                      {LISTINGS.map(l=>{const ok=l.price<=515200;const sel=selListing===l.id;return(
                        <div key={l.id} className={`p-2 rounded-lg border cursor-pointer transition-all ${sel?"ring-2 ring-[#2d8b8b] bg-[#2d8b8b]/5":"hover:bg-muted/50"} ${l.price>maxAfford&&maxAfford>0?"opacity-50":""}`}
                          onClick={()=>{setSelListing(l.id);setPrice(l.price);setActiveUrl(l.url);setCustomPrice(l.price);}}>
                          <div className="flex justify-between"><span className="font-semibold text-[11px]">{l.name}</span><span className="text-xs font-bold" style={{color:"#2d8b8b"}}>{$(l.price)}</span></div>
                          <p className="text-[10px] text-muted-foreground">{l.beds}bd · {l.baths}ba · {l.sqft.toLocaleString()}sf · {l.city}</p>
                          <div className="flex gap-1 mt-1"><Badge variant="outline" className="text-[8px] py-0 h-3.5">{l.builder}</Badge>{ok&&<Badge className="text-[8px] py-0 h-3.5 bg-emerald-50 text-emerald-700 border-emerald-200 border">DPA OK</Badge>}{l.price>maxAfford&&maxAfford>0&&<Badge className="text-[8px] py-0 h-3.5 bg-red-50 text-red-700 border-red-200 border">Over budget</Badge>}</div>
                        </div>
                      );})}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="lg:col-span-3">
                <CardContent className="p-0">
                  {activeUrl?(
                    <div><div className="border-b" style={{height:"380px"}}><iframe src={activeUrl} className="w-full h-full" title="Zillow" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"/></div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl" style={{background:mort.bDTI<=43?"#f0fdf4":mort.bDTI<=50?"#fefce8":"#fef2f2"}}><p className="text-2xl font-bold" style={{color:mort.bDTI<=43?"#16a34a":mort.bDTI<=50?"#ca8a04":"#dc2626"}}>{mort.bDTI.toFixed(0)}%</p><p className="text-[10px] text-muted-foreground">DTI</p></div>
                        <div className="text-center p-3 rounded-xl bg-muted/50"><p className="text-xl font-bold">{$(mort.total)}</p><p className="text-[10px] text-muted-foreground">Monthly</p></div>
                        <div className="text-center p-3 rounded-xl bg-muted/50"><p className="text-xl font-bold" style={{color:mort.oop===0?"#16a34a":"#1a5276"}}>{$(mort.oop)}</p><p className="text-[10px] text-muted-foreground">Out of Pocket</p></div>
                      </div>
                      <a href={activeUrl} target="_blank" rel="noopener"><Button className="w-full" style={{background:"linear-gradient(135deg,#1a5276,#2d8b8b)"}}>Open on Zillow ↗</Button></a>
                    </div></div>
                  ):(
                    <div className="flex items-center justify-center h-[500px] text-muted-foreground text-center px-8">
                      <div><p className="text-lg font-bold mb-1">Search for homes</p><p className="text-sm">Use quick buttons, type a city/zip, or select a curated listing.</p>{maxAfford>0&&<p className="text-sm mt-2">Based on your income, you can afford up to <strong style={{color:"#2d8b8b"}}>{$(maxAfford)}</strong></p>}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ━━━ CHECKLIST VIEW ━━━ */}
          {view==="checklist"&&(
            <div className="grid lg:grid-cols-2 gap-4 fade-in">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Homebuying Milestones</CardTitle><CardDescription className="text-xs">Track your progress toward homeownership</CardDescription></CardHeader>
                <CardContent className="space-y-1">
                  {CHECKLIST.map((item,i)=>(
                    <div key={item.id} className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${checks.has(item.id)?"bg-emerald-50":"hover:bg-muted/50"}`}>
                      <Checkbox checked={checks.has(item.id)} onCheckedChange={v=>{setChecks(prev=>{const n=new Set(prev);v?n.add(item.id):n.delete(item.id);return n;});}} className="mt-0.5"/>
                      <div>
                        <p className={`text-sm ${checks.has(item.id)?"line-through text-muted-foreground":"font-medium"}`}><span className="text-muted-foreground mr-1">{i+1}.</span>{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.tip}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4"><Progress value={(checks.size/CHECKLIST.length)*100} className="h-2"/><p className="text-[10px] text-muted-foreground mt-1 text-center">{checks.size} of {CHECKLIST.length} complete</p></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-bold">Key Contacts</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {o:"NeighborWorks Home Partners",p:"651-292-8710",n:"Welcome Home DPA, Community Keys. Somali/Spanish/Hmong speakers."},
                    {o:"Dakota County CDA",p:"651-675-4472",n:"Home Stretch education, local DPA."},
                    {o:"Minnesota Housing (MHFA)",p:"mnhousing.gov",n:"Start Up / Step Up mortgages."},
                    {o:"MMCDC (First-Gen DPA)",p:"firstgendpa.org",n:"First-Gen DPA Fund."},
                    {o:"MN Homeownership Center",p:"hocmn.org",n:"Education & advisor directory."},
                  ].map(c=>(
                    <div key={c.o} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <p className="text-sm font-semibold">{c.o}</p>
                      <p className="text-xs font-medium" style={{color:"#2d8b8b"}}>{c.p}</p>
                      <p className="text-[10px] text-muted-foreground">{c.n}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-foreground py-2">Educational tool only. Not financial, legal, or tax advice. Verify all program details with administrators.</p>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
