import { useState, useMemo, useCallback, useEffect, type ReactNode, type KeyboardEvent } from "react";
import {
  Home,
  LineChart,
  Wallet,
  Banknote,
  Gift,
  ClipboardCheck,
  PieChart,
  Building2,
  Search,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
// Logo is loaded via <link rel="icon"> in index.html which Parcel hashes and copies to dist.
// We read the href at runtime to get the correct hashed path.
const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement|null;
const logoImg = faviconLink?.href || "./logo.png";
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
import { DPAWatchlist } from "@/components/DPAWatchlist";
import { AIChatbot } from "@/components/AIChatbot";

// ══════════ TYPES ══════════
interface Profile{name:string;income:number;fico:number;debt:number;savings:number;county:string;household:number;jobYears:number;firstTime:boolean;firstGen:boolean;education:boolean;studentLoanBal:number;studentLoanIDR:boolean;isSelfEmployed:boolean;debtReduce:number;}
interface DPA{id:string;name:string;short:string;max:number;pctCap?:number;type:string;forgiveYrs?:number;incomeLimit:number;ficoMin:number;priceLimit:number;status:"open"|"closed";coverage:string;url:string;phone:string;notes:string;reqFirstTime:boolean;reqFirstGen:boolean;}
interface Listing{id:number;name:string;price:number;beds:number;baths:number;sqft:number;city:string;builder:string;url:string;image?:string;}
interface SearchResult{zpid:string;address:string;price:number;bedrooms:number;bathrooms:number;livingArea:number;imgSrc:string;detailUrl:string;city:string;}

// ══════════ DATA ══════════
const COUNTY_TAX:Record<string,number>={"Anoka":0.0115,"Carver":0.0105,"Chisago":0.011,"Dakota":0.011,"Hennepin":0.0125,"Isanti":0.0115,"Ramsey":0.013,"Scott":0.0108,"Sherburne":0.011,"Washington":0.0112,"Wright":0.0108};
const COUNTIES=["","Anoka","Carver","Chisago","Dakota","Hennepin","Isanti","Ramsey","Scott","Sherburne","Washington","Wright","Other MN"];
const PROGRAMS:DPA[]=[
  {id:"firstgen",name:"First-Generation Homebuyers Community DPA Fund",short:"First-Gen DPA",max:32000,pctCap:10,type:"Forgivable (5yr)",forgiveYrs:5,incomeLimit:132400,ficoMin:0,priceLimit:515200,status:"closed",coverage:"Statewide",url:"firstgendpa.org",phone:"firstgendpa.org",notes:"0% interest, forgiven 20%/yr. Portal currently closed.",reqFirstTime:false,reqFirstGen:true},
  {id:"welcome",name:"Welcome Home Down Payment Assistance",short:"Welcome Home",max:50000,pctCap:30,type:"Forgivable (10yr)",forgiveYrs:10,incomeLimit:160000,ficoMin:0,priceLimit:766550,status:"open",coverage:"Statewide",url:"nwhomepartners.org",phone:"651-292-8710",notes:"Up to 30% of price capped at $50K. Approved partners only.",reqFirstTime:true,reqFirstGen:false},
  {id:"startup",name:"MHFA Start Up + Deferred Payment Loan",short:"MHFA Start Up",max:18000,type:"Deferred (0%)",incomeLimit:152200,ficoMin:640,priceLimit:659550,status:"open",coverage:"Statewide",url:"mnhousing.gov",phone:"mnhousing.gov",notes:"Below-market rate + up to $18K DPA.",reqFirstTime:true,reqFirstGen:false},
  {id:"dakotacda",name:"Dakota County CDA First Time Homebuyer",short:"Dakota CDA",max:8500,type:"Deferred (0%)",incomeLimit:103900,ficoMin:640,priceLimit:515300,status:"open",coverage:"Dakota County",url:"dakotacda.org",phone:"651-675-4472",notes:"+ MCC up to $2K/yr tax credit.",reqFirstTime:true,reqFirstGen:false},
  {id:"commkeys",name:"Community Keys Plus Impact",short:"Community Keys+",max:20000,type:"Deferred (0%)",incomeLimit:120000,ficoMin:0,priceLimit:515200,status:"open",coverage:"5-county metro",url:"nwhomepartners.org",phone:"651-292-8710",notes:"Census tract restricted.",reqFirstTime:false,reqFirstGen:false},
  {id:"stepup",name:"MHFA Step Up Program",short:"MHFA Step Up",max:14000,type:"Monthly Payment",incomeLimit:170000,ficoMin:640,priceLimit:659550,status:"open",coverage:"Statewide",url:"mnhousing.gov",phone:"mnhousing.gov",notes:"For buyers exceeding Start Up limits.",reqFirstTime:false,reqFirstGen:false},
  {id:"chenoa",name:"Chenoa Fund DPA",short:"Chenoa Fund",max:20000,pctCap:3.5,type:"Forgivable (3yr)",forgiveYrs:3,incomeLimit:999999,ficoMin:620,priceLimit:552000,status:"open",coverage:"Nationwide",url:"chenoafund.org",phone:"chenoafund.org",notes:"Covers FHA 3.5% as second mortgage.",reqFirstTime:false,reqFirstGen:false},
  {id:"naf",name:"New American Funding DPA",short:"NAF DPA",max:6000,type:"Deferred",incomeLimit:999999,ficoMin:620,priceLimit:766550,status:"open",coverage:"Nationwide",url:"newamericanfunding.com",phone:"newamericanfunding.com",notes:"Combinable with MN Housing DPA.",reqFirstTime:false,reqFirstGen:false},
];
const CURATED_IMAGES=[
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop",
];
const CURATED:Listing[]=[
  {id:1,name:"21878 Denton Ave, Whispering Fields",price:317990,beds:3,baths:3,sqft:1782,city:"Farmington",builder:"Lennar",image:CURATED_IMAGES[0],url:"https://www.zillow.com/farmington-mn-55024/new-homes/"},
  {id:2,name:"21926 Wisteria Way, Wisteria",price:334990,beds:3,baths:3,sqft:1804,city:"Farmington",builder:"Lennar",image:CURATED_IMAGES[1],url:"https://www.zillow.com/farmington-mn-55024/new-homes/"},
  {id:3,name:"4792 218th St W, Voyageur Farms",price:358085,beds:3,baths:2,sqft:1281,city:"Farmington",builder:"Lennar",image:CURATED_IMAGES[2],url:"https://www.zillow.com/farmington-mn/new-homes/"},
  {id:4,name:"19139 Crystal Ter, M/I Homes",price:426990,beds:3,baths:2,sqft:1892,city:"Farmington",builder:"M/I Homes",image:CURATED_IMAGES[3],url:"https://www.zillow.com/farmington-mn-55024/new-homes/"},
  {id:5,name:"4870 218th Ct, Voyageur Farms",price:449390,beds:3,baths:2,sqft:1281,city:"Farmington",builder:"Lennar",image:CURATED_IMAGES[4],url:"https://www.zillow.com/farmington-mn/new-homes/"},
  {id:6,name:"4884 218th Ct, Voyageur Farms",price:460485,beds:5,baths:3,sqft:2505,city:"Farmington",builder:"Lennar",image:CURATED_IMAGES[0],url:"https://www.zillow.com/farmington-mn/new-homes/"},
  {id:7,name:"20947 Flanders Way, Whispering Fields",price:479990,beds:3,baths:3,sqft:2200,city:"Farmington",builder:"D.R. Horton",image:CURATED_IMAGES[1],url:"https://www.zillow.com/farmington-mn-55024/new-homes/"},
  {id:8,name:"Xxx3 217th St, Vita Attiva",price:455000,beds:2,baths:2,sqft:1503,city:"Farmington",builder:"Vita Attiva",image:CURATED_IMAGES[2],url:"https://www.zillow.com/farmington-mn-55024/new-homes/"},
  {id:9,name:"Cordelia Ashton Plan, Lakeville",price:499990,beds:4,baths:3,sqft:2400,city:"Lakeville",builder:"D.R. Horton",image:CURATED_IMAGES[3],url:"https://www.zillow.com/lakeville-mn/new-homes/"},
  {id:10,name:"Pheasant Run 6BD, Lakeville",price:515000,beds:6,baths:3,sqft:2400,city:"Lakeville",builder:"D.R. Horton",image:CURATED_IMAGES[4],url:"https://www.zillow.com/lakeville-mn/new-homes/"},
];
const CHECKLIST=[
  {id:"credit",label:"Check credit score (all 3 bureaus)",tip:"Free at annualcreditreport.com. Lenders use FICO 2, 4, 5."},
  {id:"w2",label:"Gather 2 years W-2s / tax returns",tip:"Also: 2mo bank statements, 30 days paystubs, photo ID."},
  {id:"education",label:"Complete homebuyer education",tip:"Home Stretch or Framework online. BEFORE purchase agreement."},
  {id:"counselor",label:"Meet HUD-certified counselor",tip:"Free at hocmn.org."},
  {id:"preapproval",label:"Get pre-approval letter",tip:"Shop 3+ lenders within 14 days."},
  {id:"dpa",label:"Apply for DPA programs",tip:"First-come, first-served. Be ready when portals open."},
  {id:"agent",label:"Find a buyer's agent",tip:"Typically paid by seller. Ask about First-Gen experience."},
  {id:"offer",label:"Make an offer",tip:"Earnest money is typically 1-2% of price."},
];

// ══════════ HELPERS ══════════
const $=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const $k=(n:number)=>n>=1000?`$${(n/1000).toFixed(0)}K`:$(n);
const pmtCalc=(principal:number,r:number,y:number)=>{const mr=r/100/12,n=y*12;return mr===0?principal/n:(principal*mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1);};
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
const getTax=(c:string)=>COUNTY_TAX[c]||0.012;
function eligibleFor(pr:DPA,p:Profile):{ok:boolean;reason:string}{if(pr.reqFirstGen&&!p.firstGen)return{ok:false,reason:"First-gen only"};if(pr.reqFirstTime&&!p.firstTime)return{ok:false,reason:"First-time only"};if(p.income>pr.incomeLimit&&pr.incomeLimit<900000)return{ok:false,reason:"Income over limit"};if(p.fico<pr.ficoMin&&pr.ficoMin>0)return{ok:false,reason:`FICO < ${pr.ficoMin}`};return{ok:true,reason:"Eligible"};}

function Tip({term,children}:{term:string;children:string}){return(<Tooltip><TooltipTrigger asChild><span className="inline-flex items-center gap-0.5 cursor-help border-b border-dotted border-muted-foreground/40">{term}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></span></TooltipTrigger><TooltipContent className="max-w-xs text-xs">{children}</TooltipContent></Tooltip>);}

// ══════════ MICRO COMPONENTS ══════════
function DonutChart({segments,size=170,label}:{segments:{value:number;color:string;label:string}[];size?:number;label?:string}){
  const total=segments.reduce((a,s)=>a+s.value,0);if(total===0)return null;
  const r=size*0.35,cx=size/2,cy=size/2,circ=2*Math.PI*r;let offset=circ*0.25;
  return(<div className="flex flex-col items-center"><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {segments.map((s,i)=>{const len=(s.value/total)*circ;const el=(<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size*0.1} strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-offset} strokeLinecap="round" className="chart-anim"/>);offset+=len;return el;})}
    {label&&<><text x={cx} y={cy-2} textAnchor="middle" style={{fontSize:size*0.11,fontWeight:700,fill:"hsl(var(--foreground))"}}>{label}</text><text x={cx} y={cy+size*0.08} textAnchor="middle" style={{fontSize:size*0.055,fill:"hsl(var(--muted-foreground))"}}>/ month</text></>}
  </svg><div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">{segments.map((s,i)=>(<div key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{background:s.color}}/><span className="text-[10px] text-muted-foreground">{s.label}</span></div>))}</div></div>);
}

function KPI({label,value,sub,color,icon,onClick}:{label:string;value:string;sub?:string;color?:string;icon?:ReactNode;onClick?:()=>void}){
  return(
    <Card
      className={`kpi-card min-h-[108px] hover:shadow-lg transition-all ${onClick?"cursor-pointer focus-within:ring-2 focus-within:ring-[var(--brand-navy)]/25":""}`}
      onClick={onClick}
      role={onClick?"button":undefined}
      tabIndex={onClick?0:undefined}
      onKeyDown={onClick?(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick();}}:undefined}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold leading-tight tabular-nums" style={{color:color||"hsl(var(--foreground))"}}>{value}</p>
            {sub&&<p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sub}</p>}
          </div>
          {icon&&<div className="text-[color:var(--brand-navy)] opacity-[0.18] shrink-0 mt-0.5">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function ListingMedia({image,builder,city}:{image?:string;builder:string;city:string}){
  const initial=builder.replace(/[^A-Za-z0-9]/g,"").slice(0,2).toUpperCase()||"NH";
  return(
    <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted">
      {image?(
        <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy"/>
      ):(
        <div className="property-card-media-fallback flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-2xl font-bold tracking-tight text-white/90">{initial}</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">{city}</span>
        </div>
      )}
    </div>
  );
}

function Gauge({score,label,color}:{score:number;label:string;color:string}){
  const r=48,cx=60,cy=58,circ=2*Math.PI*r,arc=circ*0.75,off=arc-(score/100)*arc;
  return(<svg width="120" height="96" viewBox="0 0 120 96"><path d="M 12 84 A 48 48 0 1 1 108 84" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round"/><path d="M 12 84 A 48 48 0 1 1 108 84" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={off} className="gauge-anim"/><text x={cx} y="54" textAnchor="middle" style={{fontSize:"22px",fontWeight:700,fill:"hsl(var(--foreground))"}}>{score}%</text><text x={cx} y="72" textAnchor="middle" style={{fontSize:"10px",fill:color,fontWeight:600}}>{label}</text></svg>);
}

function Row({l,v,bold,green}:{l:string;v:string;bold?:boolean;green?:boolean}){return(<div className={`flex justify-between py-1 ${bold?"font-semibold":""}`}><span className="text-xs text-muted-foreground">{l}</span><span className={`text-xs ${green?"text-emerald-600":""} ${bold?"text-sm font-bold":""}`}>{v}</span></div>);}

function PropertyCard({listing,maxLoan,totalDPA,buyingPower,onSelect,isSelected}:{listing:Listing;maxLoan:number;totalDPA:number;buyingPower:number;onSelect:()=>void;isSelected:boolean}){
  const affordable=listing.price<=buyingPower;
  const withinDTI=listing.price<=maxLoan/(1-0.035);
  const reachWithDPA=!withinDTI&&affordable;
  const firstGenOk=listing.price<=515200;
  const matchPct=affordable?clamp(Math.round((1-(listing.price/buyingPower))*100+70),50,99):clamp(Math.round((buyingPower/listing.price)*80),10,49);
  const onKeyDown=(e:KeyboardEvent)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect();}};

  return(
    <Card
      className={`group overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a2e] focus-visible:ring-offset-2 ${isSelected?"ring-2 ring-[#2d6a2e] shadow-lg":"hover:shadow-lg hover:-translate-y-0.5"} ${!affordable?"opacity-65":""}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
    >
      <ListingMedia image={listing.image} builder={listing.builder} city={listing.city}/>
      <CardContent className="p-3.5 space-y-2 min-h-[7.5rem]">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xl font-bold tabular-nums leading-none" style={{color:"var(--brand-navy)"}}>{$(listing.price)}</p>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold tabular-nums" style={{color:matchPct>=70?"#2d6a2e":matchPct>=50?"#d4a017":"#dc2626"}}>{matchPct}%</p>
            <p className="text-[10px] text-muted-foreground">match</p>
          </div>
        </div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">{listing.name}</p>
        <p className="text-xs text-muted-foreground">{listing.beds} bd · {listing.baths} ba · {listing.sqft.toLocaleString()} sf · {listing.city}</p>
        <div className="flex gap-1.5 flex-wrap">
          {listing.builder&&<Badge variant="outline" className="text-[10px] py-0.5 h-5 font-normal">{listing.builder}</Badge>}
          {firstGenOk&&<Badge className="text-[10px] py-0.5 h-5 bg-emerald-50 text-emerald-800 border border-emerald-200/80">First-Gen</Badge>}
          {withinDTI&&<Badge className="text-[10px] py-0.5 h-5 bg-emerald-50 text-emerald-800 border border-emerald-200/80">In budget</Badge>}
          {reachWithDPA&&<Badge className="text-[10px] py-0.5 h-5 bg-sky-50 text-sky-800 border border-sky-200/80">DPA reach</Badge>}
          {!affordable&&<Badge className="text-[10px] py-0.5 h-5 bg-red-50 text-red-800 border border-red-200/80">Over</Badge>}
        </div>
        {reachWithDPA&&<p className="text-[11px] text-sky-800 bg-sky-50/90 border border-sky-100 p-2 rounded-md leading-snug">Reachable with {$(totalDPA)} in selected DPA.</p>}
        {!affordable&&listing.price<buyingPower*1.15&&<p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded-md leading-snug">Tip: ~{$(Math.round((listing.price-buyingPower)*0.006))}/mo less debt could qualify this price.</p>}
      </CardContent>
    </Card>
  );
}

function SearchResultCard({result,maxLoan,totalDPA,buyingPower,onSelect,isSelected}:{result:SearchResult;maxLoan:number;totalDPA:number;buyingPower:number;onSelect:()=>void;isSelected:boolean}){
  const affordable=result.price<=buyingPower;
  const withinDTI=result.price<=maxLoan/(1-0.035);
  const reachWithDPA=!withinDTI&&affordable;
  const firstGenOk=result.price<=515200;

  return(
    <Card className={`overflow-hidden cursor-pointer transition-all ${isSelected?"ring-2 ring-[#2d6a2e] shadow-lg":"hover:shadow-md"} ${!affordable?"opacity-50":""}`} onClick={onSelect}>
      {result.imgSrc&&<div className="h-36 bg-muted overflow-hidden relative"><img src={result.imgSrc} alt="" className="w-full h-full object-cover"/><Badge className="absolute top-2 left-2 text-[9px] bg-black/60 text-white border-0">{result.city}</Badge>{firstGenOk&&<Badge className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white border-0">First-Gen OK</Badge>}</div>}
      <CardContent className="p-3 space-y-1">
        <div className="flex justify-between items-start">
          <p className="text-base font-bold" style={{color:"var(--brand-navy)"}}>{$(result.price)}</p>
          {affordable?<Badge className="text-[8px] py-0 h-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200">{reachWithDPA?"DPA Reach":"Affordable"}</Badge>:<Badge className="text-[8px] py-0 h-3.5 bg-red-50 text-red-700 border border-red-200">Over Budget</Badge>}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{result.address}</p>
        <p className="text-[11px] text-muted-foreground">{result.bedrooms}bd · {result.bathrooms}ba · {result.livingArea?.toLocaleString()}sf</p>
      </CardContent>
    </Card>
  );
}

const NAV:{id:string;label:string;Icon:LucideIcon}[]=[
  {id:"ready",label:"Readiness",Icon:LineChart},
  {id:"afford",label:"Affordability",Icon:Wallet},
  {id:"programs",label:"DPA Programs",Icon:Building2},
  {id:"search",label:"Home Search",Icon:Search},
  {id:"checklist",label:"Milestones",Icon:ClipboardCheck},
];
const VIEW_TITLES:Record<string,string>={ready:"Readiness",afford:"Affordability",programs:"DPA Programs",search:"Home Search",checklist:"Milestones"};
const STORAGE_KEY="mn_homebuyer_v2";
function loadProfile():Profile|null{try{const d=localStorage.getItem(STORAGE_KEY);return d?JSON.parse(d):null;}catch{return null;}}
function saveProfile(p:Profile){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(p));}catch{}}

// ══════════ API CONFIG ══════════
// Property search: https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-zillow-data
const RAPIDAPI_KEY = ""; // Paste your RapidAPI key here
const RAPIDAPI_HOST = "real-time-zillow-data.p.rapidapi.com";

// Mortgage rates: https://fred.stlouisfed.org/docs/api/api_key.html (free, instant)
const FRED_API_KEY = "bc24a6a30bee3e3219bbd6dd8bb7e01d";

async function fetchFredRate(series:string):Promise<{rate:number;date:string}|null>{
  if(!FRED_API_KEY)return null;
  try{
    const res=await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`);
    const data=await res.json();
    const obs=data?.observations?.[0];
    if(!obs||obs.value===".")return null;
    return{rate:parseFloat(obs.value),date:obs.date};
  }catch{return null;}
}

async function fetchLiveRates():Promise<{rate30:number;rate15:number;date:string}|null>{
  if(!FRED_API_KEY)return null;
  try{
    const [r30,r15]=await Promise.all([fetchFredRate("MORTGAGE30US"),fetchFredRate("MORTGAGE15US")]);
    if(!r30)return null;
    return{rate30:r30.rate,rate15:r15?.rate||0,date:r30.date};
  }catch{return null;}
}

async function searchProperties(query:string):Promise<SearchResult[]>{
  if(!RAPIDAPI_KEY)return[];
  try{
    const res=await fetch(`https://${RAPIDAPI_HOST}/propertyExtendedSearch?location=${encodeURIComponent(query)}&status_type=ForSale&home_type=Houses&sort=Price_Low_High`,{
      headers:{"X-RapidAPI-Key":RAPIDAPI_KEY,"X-RapidAPI-Host":RAPIDAPI_HOST}
    });
    const data=await res.json();
    const props=data?.props||data?.results||[];
    if(!Array.isArray(props)||props.length===0)return[];
    return props.slice(0,24).map((p:any)=>({
      zpid:String(p.zpid||p.id||Math.random()),
      address:p.address||p.streetAddress||p.formattedAddress||"Unknown",
      price:p.price||p.listPrice||0,
      bedrooms:p.bedrooms||p.beds||0,
      bathrooms:p.bathrooms||p.baths||0,
      livingArea:p.livingArea||p.livingAreaValue||p.sqft||0,
      imgSrc:p.imgSrc||p.image||p.primaryPhoto||p.hiResImageLink||p.thumbnail||"",
      detailUrl:p.detailUrl?(p.detailUrl.startsWith("http")?p.detailUrl:`https://www.zillow.com${p.detailUrl}`):p.url||`https://www.zillow.com/homedetails/${p.zpid}_zpid/`,
      city:p.addressCity||p.city||(typeof p.address==="string"?p.address.split(",")[1]?.trim():"")||"",
    })).filter((r:SearchResult)=>r.price>0);
  }catch{return[];}
}

// ══════════ MAIN APP ══════════
export default function App(){
  // Clear legacy storage key from previous versions
  useEffect(()=>{try{localStorage.removeItem("mn_homebuyer_profile");}catch{}},[]);

  const saved=loadProfile();
  const [p,setP]=useState<Profile>(saved||{name:"",income:0,fico:0,debt:0,savings:0,county:"",household:1,jobYears:0,firstTime:false,firstGen:false,education:false,studentLoanBal:0,studentLoanIDR:false,isSelfEmployed:false,debtReduce:0});
  const [started,setStarted]=useState(false); // Always show onboarding first after deploy
  const [view,setView]=useState("ready");
  const [price,setPrice]=useState(350000);
  const [rate,setRate]=useState(7.0);
  const [downPct,setDownPct]=useState(3.5);
  const [selProgs,setSelProgs]=useState<Set<string>>(new Set());
  const [checks,setChecks]=useState<Set<string>>(new Set());
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [loanType,setLoanType]=useState<"fha"|"conv">("fha");
  // Search state
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState<SearchResult[]>([]);
  const [isSearching,setIsSearching]=useState(false);
  const [selectedResult,setSelectedResult]=useState<SearchResult|null>(null);
  const [selectedCurated,setSelectedCurated]=useState<number|null>(null);
  const [searchMode,setSearchMode]=useState<"curated"|"api">("curated");
  const [customPrice,setCustomPrice]=useState(0);
  const [liveRates,setLiveRates]=useState<{rate30:number;rate15:number;date:string}|null>(null);

  // Fetch live mortgage rates on mount
  useEffect(()=>{fetchLiveRates().then(r=>{if(r){setLiveRates(r);setRate(r.rate30);}});},[]);

  useEffect(()=>{if(started)saveProfile(p);},[p,started]);

  const studentDebt=useMemo(()=>p.studentLoanIDR?p.studentLoanBal*0.005:0,[p.studentLoanBal,p.studentLoanIDR]);
  const effDebt=Math.max(0,p.debt-p.debtReduce+studentDebt);
  const mi=p.income/12||1;
  const taxRate=getTax(p.county);

  const readiness=useMemo(()=>{
    const items=[
      {label:"Credit Score",ok:p.fico>=620,detail:p.fico>=740?"Excellent":p.fico>=670?"Good":p.fico>=620?"Meets minimum":"Below 620"},
      {label:"Employment",ok:p.jobYears>=2,detail:p.jobYears>=2?`${p.jobYears}yr (meets req)`:`${p.jobYears}yr${p.isSelfEmployed?" self-employed":""} — need 2+`},
      {label:"Income",ok:p.income>0,detail:p.income>0?`${$(p.income)}/yr`:"Enter income"},
      {label:"DTI",ok:mi>1&&(effDebt/mi*100)<=43,detail:mi>1?`${(effDebt/mi*100).toFixed(0)}% — ${(effDebt/mi*100)<=43?"healthy":"over 43%"}`:"N/A"},
      {label:"Savings",ok:p.savings>=5000,detail:p.savings>=5000?$(p.savings):"Build reserves"},
      {label:"Education",ok:p.education,detail:p.education?"Done":"Required for DPA"},
    ];
    const score=Math.round((items.filter(i=>i.ok).length/items.length)*100);
    return{score,label:score>=80?"Ready":score>=60?"Almost":score>=40?"Getting There":"Needs Work",color:score>=80?"#2d6a2e":score>=60?"#d4a017":score>=40?"#ea580c":"#dc2626",items};
  },[p,mi,effDebt]);

  const eligProgs=useMemo(()=>PROGRAMS.map(pr=>({...pr,...eligibleFor(pr,p)})),[p]);
  useEffect(()=>{if(started){const s=new Set<string>();eligProgs.forEach(pr=>{if(pr.ok&&pr.status!=="closed")s.add(pr.id)});setSelProgs(s);}},[started]);

  const totalDPA=useMemo(()=>{let t=0;selProgs.forEach(id=>{const pr=PROGRAMS.find(x=>x.id===id);if(!pr)return;let a=pr.max;if(pr.pctCap)a=Math.min(a,price*pr.pctCap/100);t+=a;});return t;},[selProgs,price]);

  const calcMort=(lType:"fha"|"conv")=>{
    const dpPct=lType==="fha"?3.5:downPct;const dp=price*dpPct/100;const cc=price*0.03;const cash=dp+cc;const oop=Math.max(0,cash-totalDPA);
    const loan=price-dp;const mipUp=lType==="fha"?loan*0.0175:0;const tl=loan+mipUp;const piAmt=pmtCalc(tl,rate,30);
    const tax=(price*taxRate)/12;const ins=200;const mip=lType==="fha"?(loan*0.0055)/12:0;const pmi=lType==="conv"&&dpPct<20?(loan*0.007)/12:0;
    const total=piAmt+tax+ins+mip+pmi;const fDTI=mi>1?(total/mi)*100:0;const bDTI=mi>1?((total+effDebt)/mi)*100:0;
    return{dp,cc,cash,oop,loan,tl,pi:piAmt,tax,ins,mip,pmi,total,fDTI,bDTI,dpPct};
  };
  const mort=useMemo(()=>calcMort(loanType),[price,rate,downPct,loanType,p.income,effDebt,totalDPA,taxRate]);
  const mortAlt=useMemo(()=>calcMort(loanType==="fha"?"conv":"fha"),[price,rate,downPct,loanType,p.income,effDebt,totalDPA,taxRate]);

  // Buying power: DTI-based max loan + DPA + savings
  const buyingPower=useMemo(()=>{
    if(p.income<=0)return{maxLoan:0,dtiMax:0,totalPower:0};
    const maxPmt=(p.income/12)*0.43-effDebt;if(maxPmt<=0)return{maxLoan:0,dtiMax:0,totalPower:0};
    const mr=rate/100/12,n=360;
    const maxLoan=mr===0?maxPmt*n:maxPmt*(Math.pow(1+mr,n)-1)/(mr*Math.pow(1+mr,n));
    const dtiMax=Math.round((maxLoan/(1-0.035))/1000)*1000;
    const totalPower=dtiMax+Math.round(totalDPA*0.8/1000)*1000;
    return{maxLoan,dtiMax,totalPower};
  },[p.income,effDebt,rate,totalDPA]);

  const curatedInBudgetCount=useMemo(()=>{
    if(buyingPower.totalPower<=0)return 0;
    return CURATED.filter(l=>l.price<=buyingPower.totalPower).length;
  },[buyingPower.totalPower]);

  const toggleProg=useCallback((id:string)=>{setSelProgs(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});},[]);

  const doSearch=useCallback(async()=>{
    if(!searchQuery.trim())return;
    setIsSearching(true);setSelectedResult(null);setSelectedCurated(null);
    const results=await searchProperties(searchQuery);
    if(results.length>0){setSearchResults(results);setSearchMode("api");}
    else{setSearchMode("curated");} // Fallback to curated if no API key or no results
    setIsSearching(false);
  },[searchQuery]);

  const selectProperty=(listing:Listing)=>{setSelectedCurated(listing.id);setSelectedResult(null);setPrice(listing.price);};
  const selectSearchResult=(r:SearchResult)=>{setSelectedResult(r);setSelectedCurated(null);setPrice(r.price);};

  // ══════════ ONBOARDING ══════════
  if(!started) return(
    <TooltipProvider>
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"linear-gradient(160deg,#1a2e44 0%,#1e4a2a 40%,#2d6a2e 70%,#1a2e44 100%)"}}>
      <Card className="w-full max-w-lg shadow-2xl border-0 fade-in">
        <CardHeader className="text-center pb-2 pt-6">
          <img src={logoImg} alt="MN Homebuyer Dashboard" className="mx-auto w-28 h-auto mb-2 drop-shadow-lg"/>
          <CardTitle className="text-xl font-bold" style={{color:"var(--brand-navy)"}}>MN Homebuyer Dashboard</CardTitle>
          <CardDescription>Your financial profile powers everything. Data stays on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5 px-6">
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
            <div><Label className="text-xs">Savings</Label><Input type="number" placeholder="e.g. 10000" value={p.savings||""} onChange={e=>setP(x=>({...x,savings:+e.target.value}))} className="mt-1 h-9"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Household Size</Label><Input type="number" placeholder="1" value={p.household||""} onChange={e=>setP(x=>({...x,household:clamp(+e.target.value,1,10)}))} className="mt-1 h-9"/></div>
            <div><Label className="text-xs">Years at Job</Label><Input type="number" placeholder="2" value={p.jobYears||""} onChange={e=>setP(x=>({...x,jobYears:+e.target.value}))} className="mt-1 h-9"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Student Loan Balance</Label><Input type="number" placeholder="e.g. 40000" value={p.studentLoanBal||""} onChange={e=>setP(x=>({...x,studentLoanBal:+e.target.value}))} className="mt-1 h-9"/></div>
            <div className="flex items-end pb-1"><div className="flex items-center gap-2"><Switch checked={p.studentLoanIDR} onCheckedChange={v=>setP(x=>({...x,studentLoanIDR:v}))}/><Label className="text-[10px] text-muted-foreground leading-tight">On IDR plan</Label></div></div>
          </div>
          <Separator/>
          <div className="space-y-2">
            {([["First-time homebuyer","firstTime"],["First-generation buyer","firstGen"],["Completed homebuyer education","education"],["Self-employed / commission","isSelfEmployed"]] as [string,keyof Profile][]).map(([label,key])=>(
              <div key={key} className="flex items-center justify-between"><Label className="text-xs">{label}</Label><Switch checked={!!(p as any)[key]} onCheckedChange={v=>setP(x=>({...x,[key]:v}))}/></div>
            ))}
          </div>
          {(!p.income||!p.fico||!p.county)&&<p className="text-xs text-destructive text-center">Enter income, FICO, and county.</p>}
          <Button className="w-full h-11 font-semibold brand-btn text-white" disabled={!p.income||!p.fico||!p.county} onClick={()=>setStarted(true)}>Launch Dashboard</Button>
          <p className="text-[10px] text-center text-muted-foreground">Educational tool. Not financial advice.</p>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );

  // ══════════ DASHBOARD ══════════
  return(
    <TooltipProvider>
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className={`sidebar-bg text-white flex-shrink-0 transition-all duration-300 ${sidebarOpen?"w-52":"w-14"} hidden md:flex flex-col`} style={{minHeight:"100vh",position:"sticky",top:0}}>
        <div className="p-3 flex items-center gap-2 border-b border-white/10">
          <button type="button" onClick={()=>setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" aria-label={sidebarOpen?"Collapse sidebar":"Expand sidebar"}><img src={logoImg} alt="" className="w-7 h-7 object-contain"/></button>
          {sidebarOpen&&<span className="text-sm font-semibold gold-accent tracking-tight">MN Homebuyer</span>}
        </div>
        <nav className="flex-1 py-2">{NAV.map(n=>(<button key={n.id} type="button" onClick={()=>setView(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-l-2 ${view===n.id?"border-amber-400/90 bg-white/10 text-white":"border-transparent text-white/70 hover:text-white hover:bg-white/5"}`}><n.Icon className="h-4 w-4 shrink-0 opacity-95" aria-hidden />{sidebarOpen&&<span className="text-xs font-medium">{n.label}</span>}</button>))}</nav>
        {sidebarOpen&&<div className="p-3 border-t border-white/10 text-[10px] space-y-2"><div><p className="text-white/40 uppercase tracking-widest mb-1">Profile</p><p className="text-white/85">{p.name||"User"} · {p.county}</p><p className="text-white/55">{$(p.income)}/yr · FICO {p.fico}</p></div><Button variant="ghost" size="sm" className="w-full text-[10px] text-white/80 hover:text-white h-8 justify-start gap-2" onClick={()=>setStarted(false)}><Home className="h-3.5 w-3.5 shrink-0"/>Welcome screen</Button><Button variant="ghost" size="sm" className="w-full text-[10px] text-white/45 hover:text-red-200 h-7 justify-start" onClick={()=>{localStorage.removeItem(STORAGE_KEY);setStarted(false);}}>Reset profile</Button></div>}
      </aside>
      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border/80 flex justify-around py-2 shadow-[0_-8px_30px_rgba(26,46,68,0.08)]">{NAV.map(n=>(<button key={n.id} type="button" onClick={()=>setView(n.id)} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[3.25rem] transition-colors ${view===n.id?"text-[color:var(--brand-navy)] bg-[color:var(--brand-cream)]":"text-muted-foreground"}`}><n.Icon className="h-5 w-5" aria-hidden /><span className="text-[9px] font-medium leading-tight text-center">{n.label}</span></button>))}</div>

      <div className="flex-1 overflow-auto pb-20 md:pb-0 dashboard-page-bg">
        <div className="max-w-[1300px] mx-auto p-4 lg:p-6 space-y-5">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 fade-in border-b border-border/50 pb-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{VIEW_TITLES[view]}</p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1" style={{color:"var(--brand-navy)"}}>MN Homebuyer Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">Profile-driven estimates for South Metro buyers and DPA stacking.</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0 border-[color:var(--brand-navy)]/20 text-[color:var(--brand-navy)] hover:bg-[color:var(--brand-cream)]" onClick={()=>setStarted(false)}>
              <Home className="h-4 w-4" /> Welcome
            </Button>
          </header>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KPI label="Buying Power" value={buyingPower.totalPower>0?$k(buyingPower.totalPower):"--"} sub={`DTI: ${$k(buyingPower.dtiMax)} + DPA`} color="var(--brand-navy)" icon={<Building2 className="h-5 w-5" strokeWidth={1.5} />} onClick={()=>setView("afford")}/>
            <KPI label="Est. Monthly" value={p.income>0?$(mort.total):"--"} sub={`${$(price)} · ${rate}%${liveRates?" (live)":""}`} color={mort.bDTI<=43?"#2d6a2e":mort.bDTI<=50?"#d4a017":"#dc2626"} icon={<CalendarDays className="h-5 w-5" strokeWidth={1.5} />} onClick={()=>setView("afford")}/>
            <KPI label="Cash to Close" value={$(mort.oop)} sub={mort.oop===0?"DPA covers all":"After DPA"} color={mort.oop===0?"#2d6a2e":"var(--brand-navy)"} icon={<Banknote className="h-5 w-5" strokeWidth={1.5} />} onClick={()=>setView("afford")}/>
            <KPI label="DPA Available" value={$k(totalDPA)} sub={`${selProgs.size} program(s)`} color="var(--brand-green)" icon={<Gift className="h-5 w-5" strokeWidth={1.5} />} onClick={()=>setView("programs")}/>
            <KPI label="Readiness" value={`${readiness.score}%`} sub={readiness.label} color={readiness.color} icon={<PieChart className="h-5 w-5" strokeWidth={1.5} />} onClick={()=>setView("ready")}/>
          </div>

          {/* ═══ READINESS ═══ */}
          {view==="ready"&&(<div className="grid lg:grid-cols-3 gap-4 fade-in">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base font-bold">Mortgage Readiness</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="flex justify-center"><Gauge score={readiness.score} label={readiness.label} color={readiness.color}/></div>
              <div className="space-y-2">{readiness.items.map(item=>(<div key={item.label} className="flex items-start gap-2"><div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${item.ok?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{item.ok?"✓":"✗"}</div><div><p className="text-xs font-medium">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.detail}</p></div></div>))}</div>
              {p.isSelfEmployed&&p.jobYears<2&&<div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">Self-employed &lt;2yr: lenders require 2-year income average.</div>}
              {studentDebt>0&&<div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">Student loans (IDR): lenders impute {$(studentDebt)}/mo into DTI even if actual payment is $0.</div>}
            </CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base font-bold">Financial Snapshot</CardTitle></CardHeader><CardContent><div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Income & Debt</h4>
                <Row l="Gross Monthly Income" v={$(p.income/12)}/><Row l="Monthly Debt" v={$(p.debt)}/>
                {studentDebt>0&&<Row l="Student Loan (IDR)" v={`+ ${$(studentDebt)}`}/>}
                {p.debtReduce>0&&<Row l="Debt Reduction" v={`- ${$(p.debtReduce)}`} green/>}
                <Separator className="my-1.5"/>
                <Row l="Effective Debt" v={$(effDebt)} bold/>
                <Row l="Current DTI (no housing)" v={`${(mi>1?(effDebt/mi)*100:0).toFixed(1)}%`}/>
                <div className="mt-3"><Label className="text-xs">Debt reduction ($/mo)</Label><Input type="number" placeholder="0" value={p.debtReduce||""} onChange={e=>setP(x=>({...x,debtReduce:Math.max(0,+e.target.value)}))} className="mt-1 h-8 text-xs"/></div>
              </div>
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Payment at {$(price)}</h4>
                <DonutChart size={175} label={$(mort.total)} segments={[{value:mort.pi,color:"var(--brand-navy)",label:`P&I ${$(mort.pi)}`},{value:mort.tax,color:"var(--brand-green)",label:`Tax ${$(mort.tax)}`},{value:mort.ins,color:"var(--brand-gold)",label:`Ins ${$(mort.ins)}`},{value:mort.mip+mort.pmi,color:"var(--brand-sky)",label:`${loanType==="fha"?"MIP":"PMI"} ${$(mort.mip+mort.pmi)}`}]}/>
                <p className="text-[10px] text-center text-muted-foreground mt-2">Tax: {(taxRate*100).toFixed(2)}% ({p.county||"est."} county)</p>
                {liveRates&&<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 mt-3 space-y-1">
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Current Mortgage Rates</p>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">30-Year Fixed</span><span className="font-bold text-emerald-700">{liveRates.rate30}%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">15-Year Fixed</span><span className="font-bold text-emerald-700">{liveRates.rate15}%</span></div>
                  <p className="text-[9px] text-muted-foreground">Week of {liveRates.date} · Freddie Mac PMMS via FRED</p>
                </div>}
              </div>
            </div></CardContent></Card>
          </div>)}

          {/* ═══ AFFORDABILITY ═══ */}
          {view==="afford"&&(<div className="grid lg:grid-cols-3 gap-4 fade-in">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base font-bold">Scenario Builder</CardTitle></CardHeader><CardContent className="space-y-4">
              {([["Target Price",price,setPrice,100000,750000,5000,$(price)],["Interest Rate",rate,setRate,4.5,9.5,0.125,`${rate}%`],["Down Payment",downPct,setDownPct,0,20,0.5,`${downPct}%`]] as [string,number,(v:number)=>void,number,number,number,string][]).map(([label,val,setter,min,max,step,display])=>(<div key={label}><div className="flex justify-between"><Label className="text-xs">{label}</Label><span className="text-xs font-bold">{display}</span></div><Slider min={min} max={max} step={step} value={[val]} onValueChange={([v])=>setter(v)} className="mt-2"/></div>))}
              {liveRates&&<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 space-y-1">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Live Freddie Mac Rates</p>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">30-Year Fixed</span><span className="font-bold text-emerald-700">{liveRates.rate30}%</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">15-Year Fixed</span><span className="font-bold text-emerald-700">{liveRates.rate15}%</span></div>
                <p className="text-[9px] text-muted-foreground">Week of {liveRates.date} &middot; Source: FRED / Freddie Mac PMMS</p>
                <div className="flex gap-1.5 mt-1"><Button variant="outline" size="sm" className="text-[10px] h-6 flex-1" onClick={()=>setRate(liveRates.rate30)}>Use 30yr ({liveRates.rate30}%)</Button><Button variant="outline" size="sm" className="text-[10px] h-6 flex-1" onClick={()=>setRate(liveRates.rate15)}>Use 15yr ({liveRates.rate15}%)</Button></div>
              </div>}
              {!liveRates&&!FRED_API_KEY&&<p className="text-[9px] text-muted-foreground">Add a free FRED API key in App.tsx for live mortgage rates from Freddie Mac.</p>}
              {price>515200&&<p className="text-[10px] text-destructive">Over $515,200 First-Gen DPA limit</p>}
              <div><Label className="text-xs">Loan Type</Label><div className="flex gap-2 mt-1">{(["fha","conv"] as const).map(t=>(<Button key={t} variant={loanType===t?"default":"outline"} size="sm" className="flex-1 text-xs h-8" onClick={()=>setLoanType(t)}>{t==="fha"?"FHA (3.5%)":"Conventional"}</Button>))}</div></div>
              <Separator/>
              <div className="rounded-lg bg-muted/60 p-3 space-y-1">
                <Row l="Buying power (DTI only)" v={buyingPower.dtiMax>0?$(buyingPower.dtiMax):"--"}/>
                <Row l="Buying power (with DPA)" v={buyingPower.totalPower>0?$(buyingPower.totalPower):"--"} bold/>
                <Row l="Target" v={$(price)}/><Row l={price<=buyingPower.totalPower?"Within budget":"Over budget"} v={price<=buyingPower.totalPower?"✓":"⚠"} bold green={price<=buyingPower.totalPower}/>
              </div>
            </CardContent></Card>
            <Card className="lg:col-span-2"><CardHeader className="pb-2"><CardTitle className="text-base font-bold">FHA vs Conventional</CardTitle></CardHeader><CardContent><div className="grid sm:grid-cols-2 gap-6">
              {[{m:mort,label:loanType.toUpperCase()},{m:mortAlt,label:loanType==="fha"?"CONVENTIONAL":"FHA"}].map(({m,label})=>(<div key={label}>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</h4>
                <Row l="P&I" v={$(m.pi)}/><Row l={`Tax (${(taxRate*100).toFixed(1)}%)`} v={$(m.tax)}/><Row l="Insurance" v={$(m.ins)}/><Row l={label.includes("FHA")?"MIP":"PMI"} v={$(m.mip+m.pmi)}/>
                <Separator className="my-1"/><Row l="Monthly" v={$(m.total)} bold/><Row l="Back DTI" v={`${m.bDTI.toFixed(1)}%`}/>
                <Separator className="my-1"/><Row l={`Down (${m.dpPct}%)`} v={$(m.dp)}/><Row l="Closing (3%)" v={$(m.cc)}/><Row l="DPA" v={`(${$(totalDPA)})`} green/><Row l="Out-of-Pocket" v={$(m.oop)} bold/>
                <div className={`mt-2 text-[10px] font-semibold px-2 py-1 rounded ${m.bDTI<=43?"bg-emerald-50 text-emerald-700":m.bDTI<=50?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>{m.bDTI<=43?"✓ Qualifies":m.bDTI<=50?"⚡ Borderline":"⚠ Over limit"}</div>
              </div>))}
            </div></CardContent></Card>
          </div>)}

          {/* ═══ PROGRAMS ═══ */}
          {view==="programs"&&(<div className="space-y-4 fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2"><p className="text-sm text-muted-foreground"><span className="font-bold" style={{color:"var(--brand-green)"}}>{$(totalDPA)}</span> from {selProgs.size} program(s)</p><div className="flex gap-2"><Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>{const s=new Set<string>();eligProgs.forEach(x=>{if(x.ok)s.add(x.id)});setSelProgs(s);}}>Select Eligible</Button><Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>setSelProgs(new Set())}>Clear</Button></div></div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{eligProgs.map(pr=>(<Card key={pr.id} className={`cursor-pointer transition-all hover:shadow-lg ${selProgs.has(pr.id)?"ring-2 ring-[#2d6a2e] shadow-md":""} ${!pr.ok?"opacity-50":""}`} onClick={()=>toggleProg(pr.id)}><CardContent className="p-4">
              <div className="flex items-start justify-between mb-1"><div><h4 className="font-semibold text-sm">{pr.short}</h4><p className="text-[10px] text-muted-foreground">{pr.name}</p></div><Switch checked={selProgs.has(pr.id)} onCheckedChange={()=>toggleProg(pr.id)} onClick={e=>e.stopPropagation()}/></div>
              <p className="text-xl font-bold" style={{color:"var(--brand-green)"}}>{$(pr.max)}</p>
              <Badge variant="outline" className={`text-[9px] mt-1 ${pr.status==="open"?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"}`}>{pr.status}</Badge>
              <Badge className={`text-[9px] mt-1 ml-1 ${pr.ok?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{pr.ok?"Eligible":pr.reason}</Badge>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mt-2"><span className="text-muted-foreground">Type</span><span className="font-medium">{pr.type}</span><span className="text-muted-foreground">Income</span><span className="font-medium">{pr.incomeLimit>900000?"None":$(pr.incomeLimit)}</span><span className="text-muted-foreground">FICO</span><span className="font-medium">{pr.ficoMin||"None"}</span><span className="text-muted-foreground">Price</span><span className="font-medium">{$(pr.priceLimit)}</span></div>
              <p className="text-[10px] text-muted-foreground mt-2 border-t pt-1.5">{pr.notes}</p>
              <a href={`https://${pr.url}`} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline" onClick={e=>e.stopPropagation()}>{pr.url}</a>
            </CardContent></Card>))}</div>
            {/* DPA Waitlist — notified when First-Gen portal reopens */}
            <DPAWatchlist />
          </div>)}

          {/* ═══ HOME SEARCH ═══ */}
          {view==="search"&&(<div className="grid lg:grid-cols-5 gap-4 fade-in">
            {/* LEFT: Search + Results Feed */}
            <div className="lg:col-span-2 space-y-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base font-bold">Find Homes</CardTitle>{buyingPower.totalPower>0&&<CardDescription className="text-xs">Budget: up to <strong style={{color:"var(--brand-green)"}}>{$(buyingPower.totalPower)}</strong> (with DPA)</CardDescription>}</CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search on Zillow</p>
                  <p className="text-[11px] text-muted-foreground">Click to open Zillow filtered to your budget. Find a home, copy the price back here to analyze it.</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      ["Farmington","Farmington-MN"],["Lakeville","Lakeville-MN"],["Eagan","Eagan-MN"],["Apple Valley","Apple-Valley-MN"],
                      ["Rosemount","Rosemount-MN"],["Burnsville","Burnsville-MN"],["Dakota County","dakota-county-mn"],["South Metro","twin-cities-mn"],
                    ].map(([label,slug])=>(
                      <a key={label} href={`https://www.zillow.com/${slug}/?searchQueryState=${encodeURIComponent(JSON.stringify({filterState:{price:{max:buyingPower.totalPower||550000},beds:{min:2},isNewConstruction:{value:true}}}))}` } target="_blank" rel="noopener">
                        <Button variant="outline" size="sm" className="text-[10px] h-7 w-full justify-start gap-1.5">
                          <span>↗</span> {label}
                        </Button>
                      </a>
                    ))}
                  </div>
                  {buyingPower.totalPower>0&&<p className="text-[10px] text-muted-foreground">Results pre-filtered to your max budget: <strong style={{color:"var(--brand-green)"}}>{$(buyingPower.totalPower)}</strong></p>}
                </div>
                <Separator/>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Analyze Any Listing</p>
                  <p className="text-[11px] text-muted-foreground mb-2">Found a home on Zillow? Enter the price to see your DTI, monthly payment, and DPA coverage instantly.</p>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground">$</span>
                    <Input type="number" placeholder="e.g. 425000" value={customPrice||""} onChange={e=>setCustomPrice(+e.target.value)} className="text-xs h-8"/>
                    <Button size="sm" className="h-8 text-xs px-4 brand-btn text-white" disabled={!customPrice} onClick={()=>{if(customPrice){setPrice(customPrice);setSelectedCurated(null);setSelectedResult({zpid:"custom",address:`Custom listing at ${$(customPrice)}`,price:customPrice,bedrooms:0,bathrooms:0,livingArea:0,imgSrc:"",detailUrl:"",city:""});}}}>Analyze</Button>
                  </div>
                </div>
              </CardContent></Card>

              {/* Curated spotlight */}
              <Card className="overflow-hidden border-[color:var(--brand-navy)]/10 shadow-md">
                <div className="bg-gradient-to-br from-[#1a2e44] via-[#1e4a2a] to-[#2d6a2e] px-4 py-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">South Metro spotlight</p>
                  <CardTitle className="text-base font-bold text-white mt-1">Curated new construction</CardTitle>
                  <p className="text-xs text-white/85 mt-1.5 leading-relaxed">Sample South Metro inventory for your buyer&apos;s profile—match scores and DPA tags update live as programs change.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-white/15 text-white border-0 text-[11px] font-medium">{CURATED.length} listings</Badge>
                    {buyingPower.totalPower>0&&(
                      <Badge className="bg-emerald-400/25 text-emerald-50 border border-emerald-300/40 text-[11px] font-medium">{curatedInBudgetCount} within {$(buyingPower.totalPower)} budget</Badge>
                    )}
                    {buyingPower.totalPower<=0&&(
                      <Badge variant="secondary" className="bg-white/10 text-white/90 border-0 text-[11px]">Enter income to see budget match</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="max-h-[min(520px,55vh)] overflow-y-auto pr-1 -mr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CURATED.map(l=>(<PropertyCard key={l.id} listing={l} maxLoan={buyingPower.maxLoan} totalDPA={totalDPA} buyingPower={buyingPower.totalPower} onSelect={()=>selectProperty(l)} isSelected={selectedCurated===l.id}/>))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Property Detail / Analysis */}
            <Card className="lg:col-span-3"><CardContent className="p-0">
              {(selectedCurated||selectedResult)?(()=>{
                const sel=selectedResult?{name:selectedResult.address,price:selectedResult.price,beds:selectedResult.bedrooms,baths:selectedResult.bathrooms,sqft:selectedResult.livingArea,city:selectedResult.city,image:selectedResult.imgSrc,url:selectedResult.detailUrl}
                  :CURATED.find(l=>l.id===selectedCurated)?{...CURATED.find(l=>l.id===selectedCurated)!}:null;
                if(!sel)return null;
                const m=calcMort(loanType);
                const affordable=sel.price<=buyingPower.totalPower;
                const firstGenOk=sel.price<=515200;
                return(<div className="space-y-0">
                  {(sel as any).image&&<div className="h-52 bg-muted overflow-hidden"><img src={(sel as any).image} alt="" className="w-full h-full object-cover"/></div>}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div><h3 className="text-lg font-bold" style={{color:"var(--brand-navy)"}}>{sel.name}</h3><p className="text-xs text-muted-foreground">{sel.beds}bd {sel.baths}ba {sel.sqft?.toLocaleString()}sf &middot; {sel.city}</p></div>
                      <div className="text-right"><p className="text-xl font-bold" style={{color:"var(--brand-navy)"}}>{$(sel.price)}</p>
                        {firstGenOk&&<Badge className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200">First-Gen Eligible</Badge>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-xl" style={{background:m.bDTI<=43?"#f0fdf4":m.bDTI<=50?"#fefce8":"#fef2f2"}}><p className="text-2xl font-bold" style={{color:m.bDTI<=43?"#2d6a2e":m.bDTI<=50?"#d4a017":"#dc2626"}}>{m.bDTI.toFixed(0)}%</p><p className="text-[10px] text-muted-foreground">Back DTI</p></div>
                      <div className="text-center p-3 rounded-xl bg-muted/50"><p className="text-xl font-bold">{$(m.total)}</p><p className="text-[10px] text-muted-foreground">Monthly</p></div>
                      <div className="text-center p-3 rounded-xl bg-muted/50"><p className="text-xl font-bold" style={{color:m.oop===0?"#2d6a2e":"var(--brand-navy)"}}>{$(m.oop)}</p><p className="text-[10px] text-muted-foreground">Out of Pocket</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><Row l={`Down (${m.dpPct}%)`} v={$(m.dp)}/><Row l="Closing (3%)" v={$(m.cc)}/><Row l="DPA Applied" v={`(${$(totalDPA)})`} green/><Row l="Your Cash" v={$(m.oop)} bold/></div>
                      <div><Row l="P&I" v={$(m.pi)}/><Row l="Tax + Ins + MIP" v={$(m.tax+m.ins+m.mip+m.pmi)}/><Separator className="my-1"/><Row l="Total" v={$(m.total)} bold/></div>
                    </div>
                    {!affordable&&<div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">This home is over your buying power ({$(buyingPower.totalPower)}). Consider reducing debt by {$(Math.round((sel.price-buyingPower.totalPower)*0.006))}/mo or selecting additional DPA programs.</div>}
                    {sel.url&&<a href={sel.url} target="_blank" rel="noopener"><Button className="w-full brand-btn text-white">View Full Listing on Zillow ↗</Button></a>}
                  </div>
                </div>);
              })():(
                <div className="flex items-center justify-center h-[500px] text-muted-foreground text-center px-8"><div><img src={logoImg} alt="" className="mx-auto w-16 opacity-20 mb-4"/><p className="text-lg font-bold mb-1">Select a property to analyze</p><p className="text-sm">Click any listing to see instant DTI, monthly payment, and DPA coverage.</p>{buyingPower.totalPower>0&&<p className="text-sm mt-2">Your buying power: <strong style={{color:"var(--brand-green)"}}>{$(buyingPower.totalPower)}</strong></p>}</div></div>
              )}
            </CardContent></Card>
          </div>)}

          {/* ═══ MILESTONES ═══ */}
          {view==="checklist"&&(<div className="grid lg:grid-cols-2 gap-4 fade-in">
            <Card><CardHeader className="pb-2"><CardTitle className="text-base font-bold">Homebuying Milestones</CardTitle><CardDescription className="text-xs">{checks.size}/{CHECKLIST.length} complete</CardDescription></CardHeader><CardContent className="space-y-1">
              {CHECKLIST.map((item,i)=>(<div key={item.id} className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${checks.has(item.id)?"bg-emerald-50":"hover:bg-muted/50"}`}><Checkbox checked={checks.has(item.id)} onCheckedChange={v=>{setChecks(prev=>{const n=new Set(prev);v?n.add(item.id):n.delete(item.id);return n;});}}/><div><p className={`text-sm ${checks.has(item.id)?"line-through text-muted-foreground":"font-medium"}`}><span className="text-muted-foreground mr-1">{i+1}.</span>{item.label}</p><p className="text-[10px] text-muted-foreground">{item.tip}</p></div></div>))}
              <div className="mt-4"><Progress value={(checks.size/CHECKLIST.length)*100} className="h-2"/></div>
            </CardContent></Card>
            <div className="space-y-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Lender Document Checklist</CardTitle></CardHeader><CardContent className="space-y-1 text-xs">
                {["2 years W-2 forms","2 years federal tax returns (1040)","2 months bank statements","30 days recent paystubs","Photo ID","Social Security card or ITIN","Business license (if self-employed)","2 years business returns (if self-employed)","YTD profit & loss (if self-employed)","Gift letter (if receiving gift funds)"].map(d=>(<div key={d} className="flex items-center gap-2 py-1 text-muted-foreground"><span className="opacity-30">☐</span>{d}</div>))}
              </CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Key Contacts</CardTitle></CardHeader><CardContent className="space-y-2">
                {[{o:"NeighborWorks Home Partners",p:"651-292-8710",n:"Welcome Home DPA. Somali/Spanish/Hmong."},{o:"Dakota County CDA",p:"651-675-4472",n:"Home Stretch education."},{o:"Minnesota Housing",p:"mnhousing.gov",n:"Start Up / Step Up."},{o:"MMCDC",p:"firstgendpa.org",n:"First-Gen DPA Fund."},{o:"MN Homeownership Center",p:"hocmn.org",n:"Education & advisors."}].map(c=>(<div key={c.o} className="p-2.5 rounded-lg border"><p className="text-xs font-semibold">{c.o}</p><p className="text-xs" style={{color:"var(--brand-green)"}}>{c.p}</p><p className="text-[10px] text-muted-foreground">{c.n}</p></div>))}
              </CardContent></Card>
            </div>
          </div>)}

          {/* ═══ AI COACH ═══ */}
          {view==="checklist"&&(
            <div className="mt-4">
              <AIChatbot buyerProfile={{annualIncome: p.income, creditScore: p.fico, isFirstGen: p.firstGen, targetCity: p.county, monthlyDebt: p.debt}} />
            </div>
          )}

          {/* FOOTER */}
          <div className="text-center py-3 space-y-1">
            <p className="text-[10px] text-muted-foreground">Educational tool. Not financial, legal, or tax advice. Verify all details with program administrators.</p>
            <p className="text-[11px] text-muted-foreground font-medium">Built by Mohamud Omar</p>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
