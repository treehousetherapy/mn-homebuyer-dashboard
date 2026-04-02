import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ━━━━━━━━━━━━━━━━━ TYPES ━━━━━━━━━━━━━━━━━
interface BuyerProfile {
  name: string;
  annualIncome: number;
  ficoScore: number;
  monthlyDebt: number;
  isFirstTimeBuyer: boolean;
  isFirstGenBuyer: boolean;
  county: string;
  householdSize: number;
  hasCompletedEducation: boolean;
  liquidAssets: number;
  employmentYears: number;
}

interface DPAProgram {
  id: string; name: string; short: string;
  maxAmount: number; pctCap?: number;
  type: "forgivable"|"deferred"|"monthly"|"loan-product";
  forgiveYears?: number; rate: number;
  incomeLimit: number; ficoMin: number; purchaseLimit: number;
  status: "open"|"closed"|"limited";
  stackable: boolean; coverage: string;
  url: string; phone: string; notes: string;
  firstTimeOnly: boolean; firstGenOnly: boolean;
  educationRequired: boolean; minContribution?: number;
}

interface Listing {
  id: number; name: string; price: number;
  beds: number; baths: number; sqft: number;
  city: string; builder: string; url: string;
  isNew: boolean;
}

// ━━━━━━━━━━━━━━━━━ DATA ━━━━━━━━━━━━━━━━━
const PROGRAMS: DPAProgram[] = [
  { id:"firstgen", name:"First-Generation Homebuyers Community DPA Fund", short:"First-Gen DPA",
    maxAmount:32000, pctCap:10, type:"forgivable", forgiveYears:5, rate:0,
    incomeLimit:132400, ficoMin:0, purchaseLimit:515200,
    status:"closed", stackable:true, coverage:"Statewide (11-county metro limits)",
    url:"firstgendpa.org", phone:"Via firstgendpa.org",
    notes:"0% interest, forgiven 20%/yr over 5 years. Sharia-compliant mortgages accepted. Portal currently closed — sign up for reopening alerts.",
    firstTimeOnly:false, firstGenOnly:true, educationRequired:true },
  { id:"welcome", name:"Welcome Home Down Payment Assistance", short:"Welcome Home",
    maxAmount:50000, pctCap:30, type:"forgivable", forgiveYears:10, rate:0,
    incomeLimit:160000, ficoMin:0, purchaseLimit:766550,
    status:"open", stackable:true, coverage:"Statewide",
    url:"nwhomepartners.org", phone:"651-292-8710",
    notes:"Up to 30% of purchase price, capped at $50K. Must use approved financing partners. Somali, Spanish, Hmong speakers available.",
    firstTimeOnly:true, firstGenOnly:false, educationRequired:true, minContribution:1000 },
  { id:"startup", name:"MHFA Start Up + Deferred Payment Loan", short:"MHFA Start Up",
    maxAmount:18000, type:"deferred", rate:0,
    incomeLimit:152200, ficoMin:640, purchaseLimit:659550,
    status:"open", stackable:true, coverage:"Statewide",
    url:"mnhousing.gov", phone:"mnhousing.gov",
    notes:"Below-market rate first mortgage + up to $18K DPA. Deferred, 0% interest, repaid at sale/refi.",
    firstTimeOnly:true, firstGenOnly:false, educationRequired:true, minContribution:1000 },
  { id:"dakotacda", name:"Dakota County CDA First Time Homebuyer", short:"Dakota CDA",
    maxAmount:8500, type:"deferred", rate:0,
    incomeLimit:103900, ficoMin:640, purchaseLimit:515300,
    status:"open", stackable:true, coverage:"Dakota County",
    url:"dakotacda.org", phone:"651-675-4472",
    notes:"Includes Mortgage Credit Certificate (MCC) — up to $2,000/yr federal tax credit. Income $90,400 (1-2 person) / $103,900 (3+).",
    firstTimeOnly:true, firstGenOnly:false, educationRequired:true },
  { id:"commkeys", name:"Community Keys Plus Impact", short:"Community Keys+",
    maxAmount:20000, type:"deferred", rate:0,
    incomeLimit:120000, ficoMin:0, purchaseLimit:515200,
    status:"open", stackable:true, coverage:"Hennepin, Ramsey, Washington, Dakota, Anoka",
    url:"nwhomepartners.org", phone:"651-292-8710",
    notes:"Selected census tracts only. Two equal loans from NWHP + MHFA. MHFA portion can cover FHA 3.5%.",
    firstTimeOnly:false, firstGenOnly:false, educationRequired:true },
  { id:"stepup", name:"MHFA Step Up Program", short:"MHFA Step Up",
    maxAmount:14000, type:"monthly", rate:0,
    incomeLimit:170000, ficoMin:640, purchaseLimit:659550,
    status:"open", stackable:true, coverage:"Statewide",
    url:"mnhousing.gov", phone:"mnhousing.gov",
    notes:"For buyers exceeding Start Up limits. Monthly payment DPA up to $14K, 10-year term.",
    firstTimeOnly:false, firstGenOnly:false, educationRequired:true, minContribution:1000 },
  { id:"chenoa", name:"Chenoa Fund DPA", short:"Chenoa Fund",
    maxAmount:20000, pctCap:3.5, type:"forgivable", forgiveYears:3, rate:0,
    incomeLimit:999999, ficoMin:620, purchaseLimit:552000,
    status:"open", stackable:false, coverage:"Nationwide",
    url:"chenoafund.org", phone:"chenoafund.org",
    notes:"Covers FHA 3.5% down payment as forgivable or repayable second mortgage.",
    firstTimeOnly:false, firstGenOnly:false, educationRequired:false },
  { id:"naf", name:"New American Funding DPA", short:"NAF DPA",
    maxAmount:6000, type:"deferred", rate:0,
    incomeLimit:999999, ficoMin:620, purchaseLimit:766550,
    status:"open", stackable:true, coverage:"Nationwide",
    url:"newamericanfunding.com", phone:"newamericanfunding.com",
    notes:"Combinable with MN Housing DPA programs.",
    firstTimeOnly:false, firstGenOnly:false, educationRequired:false },
];

const LISTINGS: Listing[] = [
  { id:1, name:"Mercer Plan, Meadowview Preserve", price:489990, beds:3, baths:3, sqft:2500, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375621_zpid/", isNew:true },
  { id:2, name:"Ivy Plan, Meadowview Preserve", price:509990, beds:3, baths:3, sqft:2800, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375651_zpid/", isNew:true },
  { id:3, name:"Continental Plan, Meadowview Preserve", price:519990, beds:4, baths:3, sqft:3000, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/community/meadowview-preserve/442375649_zpid/", isNew:true },
  { id:4, name:"Vanderbilt Plan, Amelia Meadows", price:549990, beds:4, baths:3, sqft:2200, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/amelia-meadows-amelia-meadows-landmark/460901813_zpid/", isNew:true },
  { id:5, name:"Sequoia Plan, Voyageur Farms", price:515990, beds:5, baths:3, sqft:2500, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/voyageur-farms/2056470147_zpid/", isNew:true },
  { id:6, name:"Vanderbilt Plan, Cedar Hills", price:537990, beds:4, baths:3, sqft:2200, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/cedar-hills-discovery-collection/2067647389_zpid/", isNew:true },
  { id:7, name:"19289 Everfield Ave", price:602990, beds:3, baths:3, sqft:2800, city:"Farmington", builder:"Pulte", url:"https://www.zillow.com/homedetails/19289-Everfield-Ave-Farmington-MN-55024/459962118_zpid/", isNew:true },
  { id:8, name:"Lewis Plan, Caslano", price:600990, beds:4, baths:3, sqft:2600, city:"Lakeville", builder:"Lennar", url:"https://www.zillow.com/community/caslano/2055879828_zpid/", isNew:true },
];

const COUNTIES = ["Anoka","Carver","Chisago","Dakota","Hennepin","Isanti","Ramsey","Scott","Sherburne","Washington","Wright","Other MN County"];

// ━━━━━━━━━━━━━━━━━ HELPERS ━━━━━━━━━━━━━━━━━
const $ = (n:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const pmt = (p:number,r:number,y:number) => { const mr=r/100/12, n=y*12; return mr===0?p/n:(p*mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1); };
const clamp = (v:number,lo:number,hi:number) => Math.min(hi,Math.max(lo,v));

function getApproval(fico:number, dti:number, income:number, price:number) {
  let s=0;
  if(fico>=740)s+=28;else if(fico>=700)s+=24;else if(fico>=680)s+=20;else if(fico>=660)s+=16;else if(fico>=640)s+=12;else if(fico>=620)s+=8;else if(fico>=580)s+=4;
  if(dti<=36)s+=30;else if(dti<=43)s+=24;else if(dti<=45)s+=18;else if(dti<=50)s+=10;else if(dti<=55)s+=4;
  if(income>=120000)s+=15;else if(income>=100000)s+=12;else if(income>=80000)s+=8;else s+=4;
  if(price<=515200)s+=12;else if(price<=552000)s+=8;else if(price<=660000)s+=4;
  s+=10; // baseline for applying
  const p=clamp(s,5,96);
  return { pct:p, label:p>=75?"Strong":p>=55?"Moderate":p>=35?"Challenging":"Unlikely",
    color:p>=75?"#16a34a":p>=55?"#ca8a04":p>=35?"#ea580c":"#dc2626" };
}

function checkEligibility(prog: DPAProgram, buyer: BuyerProfile): {eligible:boolean; reason:string} {
  if(prog.firstGenOnly && !buyer.isFirstGenBuyer) return {eligible:false, reason:"First-generation buyers only"};
  if(prog.firstTimeOnly && !buyer.isFirstTimeBuyer) return {eligible:false, reason:"First-time buyers only"};
  if(buyer.annualIncome > prog.incomeLimit && prog.incomeLimit < 900000) return {eligible:false, reason:`Income exceeds ${$(prog.incomeLimit)} limit`};
  if(buyer.ficoScore < prog.ficoMin && prog.ficoMin > 0) return {eligible:false, reason:`FICO below ${prog.ficoMin} minimum`};
  return {eligible:true, reason:"Likely eligible"};
}

// ━━━━━━━━━━━━━━━━━ MICRO COMPONENTS ━━━━━━━━━━━━━━━━━
function Gauge({value,max=100,label,color,size=130}:{value:number;max?:number;label:string;color:string;size?:number}) {
  const pct=Math.min(value/max,1);
  const r=size*0.4, cx=size/2, cy=size/2+4;
  const circ=2*Math.PI*r;
  const arc=circ*0.75;
  const off=arc-pct*arc;
  const trackColor="rgba(15,45,94,0.08)";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size*0.8} viewBox={`0 0 ${size} ${size*0.82}`}>
        {/* Glow backdrop */}
        <circle cx={cx} cy={cy} r={r*0.72} fill={color+"12"} />
        {/* Track */}
        <path d={`M ${cx-r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)} A ${r} ${r} 0 1 1 ${cx+r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)}`}
          fill="none" stroke={trackColor} strokeWidth={size*0.065} strokeLinecap="round"/>
        {/* Fill */}
        <path d={`M ${cx-r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)} A ${r} ${r} 0 1 1 ${cx+r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)}`}
          fill="none" stroke={color} strokeWidth={size*0.065} strokeLinecap="round"
          strokeDasharray={arc} strokeDashoffset={off} className="gauge-anim"
          style={{filter:`drop-shadow(0 0 ${size*0.03}px ${color}88)`}}/>
        <text x={cx} y={cy-2} textAnchor="middle" style={{fontSize:size*0.215,fontWeight:800,fill:"hsl(var(--foreground))",fontFamily:"var(--font-sans)"}}>{value}{max===100?"%":""}</text>
        <text x={cx} y={cy+size*0.13} textAnchor="middle" style={{fontSize:size*0.088,fill:"hsl(var(--muted-foreground))",fontFamily:"var(--font-sans)",fontWeight:500}}>{label}</text>
      </svg>
    </div>
  );
}

function MetricCard({label,value,sub,color}:{label:string;value:string;sub?:string;color?:string}) {
  const c = color || "hsl(var(--primary))";
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 card-premium">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{background:c}}/>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 pl-1">{label}</p>
      <p className="text-2xl font-bold leading-tight number-pop pl-1" style={{color:c}}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1 pl-1">{sub}</p>}
    </div>
  );
}

function Row({label,value,bold,green}:{label:string;value:string;bold?:boolean;green?:boolean}) {
  return (
    <div className={`flex justify-between py-1.5 ${bold?"font-semibold":""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs ${green?"text-emerald-600":"text-foreground"} ${bold?"text-sm font-bold":""}`}>{value}</span>
    </div>
  );
}

const statusStyle = (s:string) => s==="open"?"bg-emerald-50 text-emerald-700 border-emerald-200":s==="closed"?"bg-red-50 text-red-700 border-red-200":"bg-amber-50 text-amber-700 border-amber-200";
const eligStyle = (e:boolean) => e?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700";

// ━━━━━━━━━━━━━━━━━ MAIN APP ━━━━━━━━━━━━━━━━━
export default function App() {
  const [profile, setProfile] = useState<BuyerProfile>({
    name:"", annualIncome:90000, ficoScore:640, monthlyDebt:800,
    isFirstTimeBuyer:true, isFirstGenBuyer:false, county:"Dakota",
    householdSize:1, hasCompletedEducation:false, liquidAssets:10000, employmentYears:2
  });
  const [started, setStarted] = useState(false);
  const [price, setPrice] = useState(475000);
  const [rate, setRate] = useState(7.0);
  const [downPct, setDownPct] = useState(3.5);
  const [debtAdj, setDebtAdj] = useState(0);
  const [selectedProgs, setSelectedProgs] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<number|null>(null);
  const [tab, setTab] = useState("simulator");
  const [zillowUrl, setZillowUrl] = useState("");
  const [activeZillowUrl, setActiveZillowUrl] = useState("");
  const [customPrice, setCustomPrice] = useState<number>(0);

  const handleZillowSearch = useCallback(() => {
    const q = zillowUrl.trim();
    if(!q) return;
    if(q.startsWith("http")) {
      setActiveZillowUrl(q);
    } else {
      const slug = q.replace(/[,]/g,"").replace(/\s+/g,"-");
      setActiveZillowUrl(`https://www.zillow.com/homes/${slug}_rb/`);
    }
    setSelectedListing(null);
  }, [zillowUrl]);

  const effectiveDebt = Math.max(0, profile.monthlyDebt - debtAdj);

  const eligiblePrograms = useMemo(() => {
    return PROGRAMS.map(p => ({...p, ...checkEligibility(p, profile)}));
  }, [profile]);

  // Auto-select eligible programs on start
  useEffect(() => {
    if(started) {
      const autoSelect = new Set<string>();
      eligiblePrograms.forEach(p => { if(p.eligible && p.status !== "closed") autoSelect.add(p.id); });
      setSelectedProgs(autoSelect);
    }
  }, [started]);

  const totalDPA = useMemo(() => {
    let t=0;
    selectedProgs.forEach(id => {
      const p=PROGRAMS.find(pp=>pp.id===id);
      if(!p) return;
      let a = p.maxAmount;
      if(p.pctCap) a = Math.min(a, price * p.pctCap/100);
      t+=a;
    });
    return t;
  }, [selectedProgs, price]);

  const mort = useMemo(() => {
    const dp = price * downPct/100;
    const cc = price * 0.03;
    const cashNeeded = dp + cc;
    const oop = Math.max(0, cashNeeded - totalDPA);
    const loan = price - dp;
    const mipUp = loan * 0.0175;
    const totalLoan = loan + mipUp;
    const pi = pmt(totalLoan, rate, 30);
    const tax = (price * 0.012)/12;
    const ins = 200;
    const mip = (loan * 0.0055)/12;
    const total = pi+tax+ins+mip;
    const mi = profile.annualIncome/12;
    const fDTI = (total/mi)*100;
    const bDTI = ((total+effectiveDebt)/mi)*100;
    return {dp,cc,cashNeeded,oop,loan,totalLoan,pi,tax,ins,mip,total,fDTI,bDTI};
  }, [price,rate,downPct,profile.annualIncome,effectiveDebt,totalDPA]);

  const approval = useMemo(() => getApproval(profile.ficoScore, mort.bDTI, profile.annualIncome, price), [profile.ficoScore, mort.bDTI, profile.annualIncome, price]);

  const toggleProg = useCallback((id:string) => {
    setSelectedProgs(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }, []);

  // ━━━ ONBOARDING ━━━
  if(!started) return (
    <TooltipProvider>
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8"
      style={{background:"radial-gradient(ellipse 100% 80% at 60% -10%,#0f2d5e22 0%,transparent 60%), radial-gradient(ellipse 80% 60% at -10% 110%,#0d948822 0%,transparent 60%), linear-gradient(160deg,#eef3f9 0%,#e6efed 55%,#edf2ee 100%)"}}>
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden fade-in bg-white">

        {/* ── Hero panel ── */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden"
          style={{background:"linear-gradient(150deg,#0f2d5e 0%,#0d4a7a 55%,#0d9488 100%)"}}>
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{background:"radial-gradient(circle,white,transparent)"}}/>
          <div className="absolute bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{background:"radial-gradient(circle,white,transparent)"}}/>
          <div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{background:"rgba(255,255,255,.15)"}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h1 className="font-display text-3xl font-bold leading-snug mb-3">Minnesota<br/>Homebuyer Dashboard</h1>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">Your personalized gateway to Minnesota down-payment assistance, mortgage pre-approval, and curated listings — all in one place.</p>
          </div>
          <div className="space-y-3">
            {[
              ["Pre-Approval Simulator","Model scenarios with live mortgage math"],
              ["DPA Program Finder","Up to $50K in Minnesota grant programs"],
              ["Zillow Home Search","Browse + analyze listings instantly"],
              ["Homeownership Roadmap","Month-by-month action plan"],
            ].map(([title,desc])=>(
              <div key={title} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{background:"rgba(255,255,255,.18)"}}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-4">For educational purposes only. Not financial advice.</p>
        </div>

        {/* ── Form panel ── */}
        <div className="p-8 lg:p-10 space-y-5 overflow-y-auto max-h-screen">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-white" style={{background:"linear-gradient(135deg,#0f2d5e,#0d9488)"}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h2 className="font-display text-xl font-bold">MN Homebuyer Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-1">Pre-approval simulator, DPA finder &amp; home search.</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="font-display text-xl font-bold" style={{color:"#0f2d5e"}}>Build your profile</h2>
            <p className="text-xs text-muted-foreground mt-1">Enter your financial details to personalize your dashboard.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium">Your Name</Label><Input placeholder="First name" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} className="mt-1 h-10"/></div>
            <div><Label className="text-xs font-medium">County</Label>
              <Select value={profile.county} onValueChange={v=>setProfile(p=>({...p,county:v}))}>
                <SelectTrigger className="mt-1 h-10"><SelectValue/></SelectTrigger>
                <SelectContent>{COUNTIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium">Annual Gross Income</Label><Input type="number" value={profile.annualIncome} onChange={e=>setProfile(p=>({...p,annualIncome:+e.target.value}))} className="mt-1 h-10"/></div>
            <div><Label className="text-xs font-medium">FICO Score</Label><Input type="number" value={profile.ficoScore} onChange={e=>setProfile(p=>({...p,ficoScore:clamp(+e.target.value,300,850)}))} className="mt-1 h-10"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium">Monthly Debt Payments</Label><Input type="number" value={profile.monthlyDebt} onChange={e=>setProfile(p=>({...p,monthlyDebt:+e.target.value}))} className="mt-1 h-10"/></div>
            <div><Label className="text-xs font-medium">Household Size</Label><Input type="number" value={profile.householdSize} onChange={e=>setProfile(p=>({...p,householdSize:clamp(+e.target.value,1,10)}))} className="mt-1 h-10"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-medium">Liquid Assets / Savings</Label><Input type="number" value={profile.liquidAssets} onChange={e=>setProfile(p=>({...p,liquidAssets:+e.target.value}))} className="mt-1 h-10"/></div>
            <div><Label className="text-xs font-medium">Years at Current Job</Label><Input type="number" value={profile.employmentYears} onChange={e=>setProfile(p=>({...p,employmentYears:+e.target.value}))} className="mt-1 h-10"/></div>
          </div>
          <Separator/>
          <div className="space-y-3">
            {([
              ["isFirstTimeBuyer","First-time homebuyer","haven't owned in 3+ years"],
              ["isFirstGenBuyer","First-generation buyer","neither I nor my parents owned a home"],
              ["hasCompletedEducation","Completed homebuyer education",""],
            ] as [keyof BuyerProfile,string,string][]).map(([k,label,hint])=>(
              <div key={k} className="flex items-center justify-between gap-3 py-1">
                <Label className="text-xs font-medium cursor-pointer">
                  {label}
                  {hint && <span className="font-normal text-muted-foreground ml-1">({hint})</span>}
                </Label>
                <Switch checked={profile[k] as boolean} onCheckedChange={v=>setProfile(p=>({...p,[k]:v}))} />
              </div>
            ))}
          </div>
          <Button className="w-full h-12 text-sm font-semibold rounded-xl mt-1 tracking-wide"
            style={{background:"linear-gradient(135deg,#0f2d5e 0%,#0d9488 100%)",boxShadow:"0 4px 18px rgba(15,45,94,.35)"}}
            onClick={()=>setStarted(true)}>
            Launch My Dashboard →
          </Button>
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">For educational purposes only. Not financial advice. Verify all program details with administrators.</p>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );

  // ━━━ MAIN DASHBOARD ━━━
  return (
    <TooltipProvider>
    <div className="min-h-screen" style={{background:"radial-gradient(ellipse 90% 60% at 70% -5%,#0f2d5e14 0%,transparent 55%), radial-gradient(ellipse 70% 50% at -5% 90%,#0d948814 0%,transparent 55%), linear-gradient(170deg,#eef3f8 0%,#e6efed 55%,#edf2ec 100%)"}}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b" style={{boxShadow:"0 1px 20px rgba(15,45,94,0.08)"}}>
        {/* gradient top stripe */}
        <div className="h-0.5" style={{background:"linear-gradient(90deg,#0f2d5e,#0d9488,#0f2d5e)"}}/>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{background:"linear-gradient(135deg,#0f2d5e,#0d9488)"}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-[15px] font-bold leading-none" style={{color:"#0f2d5e"}}>MN Homebuyer Dashboard</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">{profile.name ? `${profile.name} · ` : ""}{profile.county} County · {profile.isFirstGenBuyer ? "First-Gen" : profile.isFirstTimeBuyer ? "First-Time" : "Buyer"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Approval</p>
              <p className="text-[15px] font-bold leading-none mt-0.5" style={{color:approval.color}}>{approval.pct}% <span className="text-[11px] font-medium">{approval.label}</span></p>
            </div>
            <div className="w-px h-8 bg-border hidden md:block"/>
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">DPA Available</p>
              <p className="text-[15px] font-bold leading-none mt-0.5" style={{color:"#0d9488"}}>{$(totalDPA)}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200 hover:border-slate-300" onClick={()=>setStarted(false)}>Edit Profile</Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="FICO Score" value={profile.ficoScore.toString()} color={profile.ficoScore>=640?"#059669":profile.ficoScore>=580?"#d97706":"#e11d48"} sub={profile.ficoScore>=740?"Excellent":profile.ficoScore>=670?"Good":profile.ficoScore>=640?"Fair":"Needs Work"}/>
          <MetricCard label="Income" value={$(profile.annualIncome)} sub={`${$(profile.annualIncome/12)}/mo gross`}/>
          <MetricCard label="Target Price" value={$(price)} color={price<=515200?"#059669":"#ea580c"} sub={price<=515200?"Under DPA limit":"Over $515K limit"}/>
          <MetricCard label="DPA Available" value={$(totalDPA)} color="#0d9488" sub={`${selectedProgs.size} program(s)`}/>
          <MetricCard label="Out of Pocket" value={$(mort.oop)} color={mort.oop===0?"#059669":"#0f2d5e"} sub={mort.oop===0?"Fully covered by DPA":"After DPA applied"}/>
          <MetricCard label="Back-End DTI" value={`${mort.bDTI.toFixed(1)}%`} color={mort.bDTI<=43?"#059669":mort.bDTI<=50?"#d97706":"#e11d48"} sub={mort.bDTI<=43?"Qualifies":mort.bDTI<=50?"Borderline":"Over limit"}/>
        </div>

        {/* TABS */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="glass border w-full justify-start gap-0.5 p-1 h-auto flex-wrap rounded-2xl">
            {[["simulator","📊 Pre-Approval"],["programs","🏦 DPA Programs"],["homes","🏠 Home Search"],["timeline","📅 Timeline"]].map(([k,v])=>(
              <TabsTrigger key={k} value={k} className="tab-pill text-xs sm:text-sm rounded-xl px-4 py-2 transition-all">{v}</TabsTrigger>
            ))}
          </TabsList>

          {/* ━━━ SIMULATOR ━━━ */}
          <TabsContent value="simulator" className="space-y-4 fade-in mt-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <Card className="lg:col-span-2 card-premium border-slate-100">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base" style={{color:"#0f2d5e"}}>Adjust Scenario</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {([
                    ["Purchase Price", price, setPrice, 200000, 700000, 5000, $(price), price>515200?"text-destructive text-[10px] mt-0.5":"hidden", "Exceeds $515,200 First-Gen DPA limit"],
                    ["FICO Score", profile.ficoScore, (v:number)=>setProfile(p=>({...p,ficoScore:v})), 500, 850, 1, profile.ficoScore.toString()],
                    ["Annual Income", profile.annualIncome, (v:number)=>setProfile(p=>({...p,annualIncome:v})), 30000, 250000, 1000, $(profile.annualIncome)],
                    ["Interest Rate", rate, setRate, 4.5, 9.5, 0.125, `${rate}%`],
                    ["Down Payment", downPct, setDownPct, 0, 20, 0.5, `${downPct}%`],
                    ["Monthly Non-Housing Debt", effectiveDebt, (_:number)=>{}, 0, 5000, 50, $(effectiveDebt)],
                  ] as [string,number,(v:number)=>void,number,number,number,string,string?,string?][]).map(([label,val,setter,min,max,step,display,warnClass,warnText])=>(
                    <div key={label}>
                      <div className="flex justify-between"><Label className="text-xs font-medium">{label}</Label><span className="text-xs font-bold" style={{color:"#0f2d5e"}}>{display}</span></div>
                      <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v])=>setter(v)} className="mt-2"/>
                      {warnClass && warnText && <p className={warnClass}>{warnText}</p>}
                    </div>
                  ))}
                  <Separator/>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Debt Reduction Scenarios</p>
                    {[["Remove $500/mo debt",500],["Remove $926/mo (e.g. auto loan)",926],["Remove $1,705/mo (e.g. two autos)",1705],["No adjustment",0]].map(([label,amt])=>(
                      <label key={label as string} className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-colors ${debtAdj===amt?"bg-[#0f2d5e]/8 font-semibold text-[#0f2d5e]":"hover:bg-muted/60"}`}>
                        <input type="radio" name="debtadj" checked={debtAdj===amt} onChange={()=>setDebtAdj(amt as number)} className="accent-[#0d9488]"/>
                        {label as string}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 card-premium border-slate-100">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base" style={{color:"#0f2d5e"}}>Pre-Approval Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    <Gauge value={approval.pct} label={approval.label} color={approval.color}/>
                    <Gauge value={Math.round(mort.fDTI)} max={55} label="Front DTI" color={mort.fDTI<=31?"#059669":mort.fDTI<=40?"#d97706":"#e11d48"}/>
                    <Gauge value={Math.round(mort.bDTI)} max={55} label="Back DTI" color={mort.bDTI<=43?"#059669":mort.bDTI<=50?"#d97706":"#e11d48"}/>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Monthly Payment</h4>
                      <Row label="Principal & Interest" value={$(mort.pi)}/>
                      <Row label="Property Tax" value={$(mort.tax)}/>
                      <Row label="Insurance" value={$(mort.ins)}/>
                      <Row label="FHA MIP" value={$(mort.mip)}/>
                      <Separator className="my-1.5"/>
                      <Row label="Total PITI + MIP" value={$(mort.total)} bold/>
                    </div>
                    <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Cash to Close</h4>
                      <Row label={`Down Payment (${downPct}%)`} value={$(mort.dp)}/>
                      <Row label="Closing Costs (3%)" value={$(mort.cc)}/>
                      <Row label="Total Needed" value={$(mort.cashNeeded)}/>
                      <Row label="DPA Applied" value={`(${$(totalDPA)})`} green/>
                      <Separator className="my-1.5"/>
                      <Row label="Your Out-of-Pocket" value={$(mort.oop)} bold/>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 space-y-2" style={{background:"linear-gradient(135deg,rgba(15,45,94,.05),rgba(13,148,136,.06))",border:"1px solid rgba(15,45,94,.08)"}}>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{color:"#0f2d5e"}}>Assessment</h4>
                    {mort.bDTI>50 && <p className="text-xs text-destructive font-medium flex gap-1.5 items-start"><span>⚠</span> DTI exceeds 50%. Reduce monthly debt to qualify.</p>}
                    {mort.bDTI > 43 && mort.bDTI <= 50 && <p className="text-xs text-amber-700 font-medium flex gap-1.5 items-start"><span>⚡</span> DTI is 43–50%. FHA may approve with compensating factors (stable job, reserves).</p>}
                    {mort.bDTI<=43 && <p className="text-xs text-emerald-700 font-medium flex gap-1.5 items-start"><span>✓</span> DTI under 43%. Clean FHA qualification.</p>}
                    {profile.ficoScore<640 && <p className="text-xs text-muted-foreground flex gap-1.5 items-start"><span>↑</span> FICO below 640 limits DPA program access. Focus on utilization paydown for fastest improvement.</p>}
                    {mort.oop===0 && <p className="text-xs text-emerald-700 flex gap-1.5 items-start"><span>✓</span> DPA covers all cash-to-close. Potential $0 out of pocket.</p>}
                    {price>515200 && <p className="text-xs text-destructive flex gap-1.5 items-start"><span>⚠</span> Price exceeds $515,200. Reduce to qualify for First-Gen DPA ($32K).</p>}
                    {!profile.hasCompletedEducation && <p className="text-xs text-muted-foreground flex gap-1.5 items-start"><span>📋</span> Most DPA programs require homebuyer education before purchase agreement.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ━━━ PROGRAMS ━━━ */}
          <TabsContent value="programs" className="space-y-4 fade-in mt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">{selectedProgs.size} selected — <span className="font-bold" style={{color:"#0d9488"}}>{$(totalDPA)}</span> total DPA</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200" onClick={()=>{const s=new Set<string>();eligiblePrograms.forEach(p=>{if(p.eligible)s.add(p.id)});setSelectedProgs(s);}}>Select All Eligible</Button>
                <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200" onClick={()=>setSelectedProgs(new Set())}>Clear All</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {eligiblePrograms.map(p => (
                <div key={p.id}
                  className={`group relative overflow-hidden rounded-2xl border cursor-pointer card-premium transition-all bg-white ${selectedProgs.has(p.id)?"ring-2 ring-[#0d9488] shadow-lg":"hover:ring-1 hover:ring-[#0d9488]/30"} ${!p.eligible?"opacity-60":""}`}
                  onClick={()=>toggleProg(p.id)}>
                  {/* Selection indicator strip */}
                  {selectedProgs.has(p.id) && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:"linear-gradient(90deg,#0f2d5e,#0d9488)"}}/>}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <h4 className="font-bold text-sm" style={{color:"#0f2d5e"}}>{p.short}</h4>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${statusStyle(p.status)}`}>{p.status}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{p.name}</p>
                      </div>
                      <Switch checked={selectedProgs.has(p.id)} onCheckedChange={()=>toggleProg(p.id)} onClick={e=>e.stopPropagation()} className="shrink-0"/>
                    </div>

                    {/* DPA Amount */}
                    <div className="rounded-xl px-3 py-2" style={{background:"linear-gradient(135deg,rgba(13,148,136,.07),rgba(15,45,94,.07))"}}>
                      <p className="text-2xl font-bold" style={{color:"#0d9488"}}>{$(p.maxAmount)}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">Max assistance</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <span className="text-muted-foreground">Type</span><span className="font-semibold capitalize">{p.type}{p.forgiveYears?` (${p.forgiveYears}yr)`:""}</span>
                      <span className="text-muted-foreground">Income Limit</span><span className="font-semibold">{p.incomeLimit>900000?"None":$(p.incomeLimit)}</span>
                      <span className="text-muted-foreground">FICO Min</span><span className="font-semibold">{p.ficoMin||"None"}</span>
                      <span className="text-muted-foreground">Max Price</span><span className="font-semibold">{$(p.purchaseLimit)}</span>
                    </div>
                    <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${eligStyle(p.eligible)}`}>
                      {p.eligible ? "✓ Likely Eligible" : `✗ ${p.reason}`}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-2">{p.notes}</p>
                    <div className="flex items-center justify-between">
                      <a href={`https://${p.url}`} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline font-medium" onClick={e=>e.stopPropagation()}>{p.url}</a>
                      <span className="text-[10px] text-muted-foreground">{p.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ━━━ HOME SEARCH ━━━ */}
          <TabsContent value="homes" className="space-y-4 fade-in mt-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 space-y-3">
                {/* BROWSE ZILLOW */}
                <Card className="card-premium border-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-base" style={{color:"#0f2d5e"}}>Browse Zillow</CardTitle>
                    <CardDescription className="text-xs">Search by city/zip or paste a listing URL. Enter the listing price to run your analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search or paste URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="e.g. Farmington MN, 55024, or full Zillow URL..." value={zillowUrl} onChange={e=>setZillowUrl(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter") handleZillowSearch(); }} className="text-xs h-9"/>
                        <Button size="sm" className="h-9 text-xs shrink-0 px-4 rounded-lg" style={{background:"linear-gradient(135deg,#0f2d5e,#0d9488)"}} onClick={handleZillowSearch}>Search</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Listing price (for analysis)</Label>
                      <div className="flex gap-2 mt-1 items-center">
                        <span className="text-sm font-medium text-muted-foreground">$</span>
                        <Input type="number" placeholder="475000" value={customPrice || ""} onChange={e=>setCustomPrice(+e.target.value)} className="text-xs h-9"/>
                        <Button variant="outline" size="sm" className="h-9 text-xs shrink-0 border-slate-200" disabled={!customPrice}
                          onClick={()=>{ if(customPrice) setPrice(customPrice); }}>Apply</Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Enter the price of any home you find, then click Apply to update your approval analysis.</p>
                    </div>
                    <Separator/>
                    <div>
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Quick searches</Label>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        {[
                          {label:"Farmington New Builds",q:"Farmington-MN/new-construction/"},
                          {label:"Lakeville New Builds",q:"Lakeville-MN/new-construction/"},
                          {label:"Rosemount New Builds",q:"Rosemount-MN/new-construction/"},
                          {label:"Apple Valley",q:"Apple-Valley-MN/"},
                          {label:"Eagan Homes",q:"Eagan-MN/"},
                          {label:"Burnsville",q:"Burnsville-MN/"},
                          {label:"Under $500K Metro",q:"twin-cities-mn/?searchQueryState=%7B%22filterState%22%3A%7B%22price%22%3A%7B%22max%22%3A500000%7D%7D%7D"},
                          {label:"All Dakota County",q:"dakota-county-mn/"},
                        ].map(q=>(
                          <Button key={q.label} variant="outline" size="sm" className="text-[10px] h-7 justify-start border-slate-200 hover:border-[#0d9488]/30 hover:text-[#0d9488] transition-colors"
                            onClick={()=>{setActiveZillowUrl(`https://www.zillow.com/${q.q}`);setZillowUrl(q.label);setSelectedListing(null);}}>
                            {q.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* CURATED LISTINGS */}
                <Card className="card-premium border-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold" style={{color:"#0f2d5e"}}>Curated Listings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {LISTINGS.map(l => {
                      const ok = l.price <= 515200;
                      const sel = selectedListing === l.id;
                      return (
                        <div key={l.id} className={`p-3 rounded-xl border cursor-pointer transition-all ${sel?"ring-2 ring-[#0d9488] bg-[#0d9488]/5 border-[#0d9488]/20":"hover:bg-muted/40 border-transparent hover:border-slate-100"}`}
                          onClick={()=>{setSelectedListing(l.id);setPrice(l.price);setActiveZillowUrl(l.url);setZillowUrl(l.name);setCustomPrice(l.price);}}>
                          <div className="flex justify-between items-start">
                            <h5 className="font-bold text-[11px] leading-snug pr-2" style={{color:"#0f2d5e"}}>{l.name}</h5>
                            <span className="text-xs font-bold whitespace-nowrap" style={{color:"#0d9488"}}>{$(l.price)}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{l.beds}bd · {l.baths}ba · {l.sqft.toLocaleString()}sf · {l.city}</p>
                          <div className="flex gap-1 mt-1.5">
                            <Badge variant="outline" className="text-[8px] py-0 h-3.5 border-slate-200">{l.builder}</Badge>
                            <Badge className={`text-[8px] py-0 h-3.5 border ${ok?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"}`}>{ok?"Under DPA":"Over limit"}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
              {/* RIGHT PANEL */}
              <Card className="lg:col-span-3 card-premium border-slate-100 overflow-hidden">
                <CardContent className="p-0">
                  {activeZillowUrl ? (() => {
                    const a = getApproval(profile.ficoScore, mort.bDTI, profile.annualIncome, price);
                    return (
                      <div>
                        <div className="relative" style={{height:"400px"}}>
                          <iframe src={activeZillowUrl} className="w-full h-full" title="Zillow" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" style={{border:"none"}}/>
                        </div>
                        <div className="p-5 space-y-4 bg-white">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-base font-bold" style={{color:"#0f2d5e"}}>Analysis for {$(price)} home</h3>
                            <Badge className={`${price<=515200?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"} border text-[10px]`}>{price<=515200?"Under DPA limit":"Over $515K limit"}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-2xl" style={{background:`${a.color}12`,border:`1px solid ${a.color}25`}}>
                              <p className="text-3xl font-bold" style={{color:a.color}}>{a.pct}%</p>
                              <p className="text-[10px] font-semibold mt-0.5" style={{color:a.color}}>{a.label}</p>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                              <p className="text-xl font-bold" style={{color:"#0f2d5e"}}>{$(mort.total)}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Monthly Payment</p>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                              <p className="text-xl font-bold" style={{color:mort.oop===0?"#059669":"#0f2d5e"}}>{$(mort.oop)}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Out of Pocket</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><Row label={`Down (${downPct}%)`} value={$(mort.dp)}/><Row label="Closing (3%)" value={$(mort.cc)}/><Row label="DPA Applied" value={`(${$(totalDPA)})`} green/></div>
                            <div><Row label="P&I" value={$(mort.pi)}/><Row label="Tax+Ins+MIP" value={$(mort.tax+mort.ins+mort.mip)}/><Row label="DTI" value={`${mort.bDTI.toFixed(1)}%`}/></div>
                          </div>
                          <a href={activeZillowUrl} target="_blank" rel="noopener">
                            <Button className="w-full rounded-xl font-semibold" style={{background:"linear-gradient(135deg,#0f2d5e,#0d9488)",boxShadow:"0 4px 14px rgba(15,45,94,.3)"}}>Open Full Page on Zillow ↗</Button>
                          </a>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                      <div className="text-center px-8">
                        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(15,45,94,.06),rgba(13,148,136,.06))"}}>
                          <svg className="opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f2d5e" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                        <p className="font-display text-lg font-semibold mb-1" style={{color:"#0f2d5e"}}>Search for homes</p>
                        <p className="text-sm max-w-xs mx-auto">Use the quick search buttons, type a city or zip, or select a curated listing to browse Zillow right here.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ━━━ TIMELINE ━━━ */}
          <TabsContent value="timeline" className="fade-in mt-4">
            <Card className="card-premium border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-base" style={{color:"#0f2d5e"}}>Roadmap to Homeownership</CardTitle>
                <CardDescription className="text-xs">Your month-by-month action plan from today to your keys.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-10">
                  {/* connector line */}
                  <div className="absolute left-[18px] top-3 bottom-3 w-0.5 rounded-full" style={{background:"linear-gradient(180deg,#0f2d5e 0%,#0d9488 100%)"}}/>
                  {[
                    {m:"Month 1",t:"Foundation",c:"#0f2d5e",items:["Register for homebuyer education (Home Stretch or Framework online)","Sign up at firstgendpa.org for DPA reopening alerts","Address credit utilization — pay revolving balances below 10%","Begin pay-for-delete negotiations on small collections"]},
                    {m:"Month 2–3",t:"Credit Lift",c:"#1d4ed8",items:["Complete homebuyer education course","Continue collection deletion strategy","If applicable, begin auto loan refinance to reduce DTI","Request credit limit increases on existing cards"]},
                    {m:"Month 4–5",t:"DTI Optimization",c:"#0891b2",items:["Confirm DTI is within FHA limits (43–50%)","Pull mortgage-specific FICO scores via myFICO.com","Engage DPA-approved mortgage broker","Verify all DPA program eligibility with broker"]},
                    {m:"Month 6–7",t:"Pre-Approval",c:"#059669",items:["Get FHA pre-approval letter","Apply to DPA programs (First-Gen when portal reopens, Welcome Home, MHFA)","Reserve DPA funds (typically 90-day window)","Begin home search in target price range"]},
                    {m:"Month 8–10",t:"Home Search & Contract",c:"#0d9488",items:["Tour homes in target communities","Negotiate with builders on pricing and incentives","Execute purchase agreement (education must be complete BEFORE)","DPA funds applied to closing package"]},
                    {m:"Month 11+",t:"Close & Move In",c:"#7c3aed",items:["Complete final walkthrough","Close on your home","File homestead exemption with county (reduces property taxes)","Begin 5-year DPA forgiveness clock"]},
                  ].map((phase,i) => (
                    <div key={phase.m} className="relative pb-8 slide-up" style={{animationDelay:`${i*0.07}s`}}>
                      {/* dot */}
                      <div className="absolute -left-[30px] w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{background:phase.c,top:"3px"}}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/70"/>
                      </div>
                      <div className="rounded-2xl border border-slate-100 p-4 bg-white/80 hover:shadow-md transition-shadow" style={{borderLeftColor:phase.c+"30",borderLeftWidth:"3px"}}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{background:phase.c}}>{phase.m}</span>
                          <h4 className="text-sm font-bold" style={{color:phase.c}}>{phase.t}</h4>
                        </div>
                        <ul className="space-y-1.5">
                          {phase.items.map(item => (
                            <li key={item} className="text-xs text-muted-foreground flex gap-2 leading-relaxed items-start">
                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{background:phase.c}}/>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CONTACTS */}
        <div className="rounded-2xl glass border border-white/60 p-5" style={{boxShadow:"0 2px 12px rgba(15,45,94,.07)"}}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{color:"#0f2d5e"}}>Key Contacts</p>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-5 text-xs">
            {[
              {o:"NeighborWorks Home Partners",p:"651-292-8710",n:"Welcome Home, Community Keys. Somali/Spanish/Hmong speakers."},
              {o:"Dakota County CDA",p:"651-675-4472",n:"Home Stretch education, local DPA programs."},
              {o:"Minnesota Housing",p:"mnhousing.gov",n:"Start Up / Step Up mortgages, find approved lenders."},
              {o:"MMCDC (First-Gen DPA)",p:"firstgendpa.org",n:"First-Generation DPA Fund administration."},
              {o:"MN Homeownership Center",p:"hocmn.org",n:"Education workshops, advisor directory."},
            ].map(c=>(
              <div key={c.o} className="space-y-0.5">
                <p className="font-bold text-[11px]" style={{color:"#0f2d5e"}}>{c.o}</p>
                <p className="font-semibold" style={{color:"#0d9488"}}>{c.p}</p>
                <p className="text-muted-foreground leading-relaxed">{c.n}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground py-4">For educational purposes only. Not financial, legal, or tax advice. Verify all program details with administrators. Program availability subject to change.</p>
      </main>
    </div>
    </TooltipProvider>
  );
}
