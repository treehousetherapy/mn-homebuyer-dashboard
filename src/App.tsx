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
  return (
    <svg width={size} height={size*0.8} viewBox={`0 0 ${size} ${size*0.82}`}>
      <path d={`M ${cx-r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)} A ${r} ${r} 0 1 1 ${cx+r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)}`}
        fill="none" stroke="hsl(var(--muted))" strokeWidth={size*0.065} strokeLinecap="round"/>
      <path d={`M ${cx-r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)} A ${r} ${r} 0 1 1 ${cx+r*Math.cos(Math.PI*0.125)} ${cy+r*Math.sin(Math.PI*0.125)}`}
        fill="none" stroke={color} strokeWidth={size*0.065} strokeLinecap="round"
        strokeDasharray={arc} strokeDashoffset={off} className="gauge-anim"/>
      <text x={cx} y={cy-4} textAnchor="middle" style={{fontSize:size*0.2,fontWeight:700,fill:"hsl(var(--foreground))",fontFamily:"var(--font-sans)"}}>{value}{max===100?"%":""}</text>
      <text x={cx} y={cy+size*0.12} textAnchor="middle" style={{fontSize:size*0.085,fill:"hsl(var(--muted-foreground))",fontFamily:"var(--font-sans)"}}>{label}</text>
    </svg>
  );
}

function MetricCard({label,value,sub,color}:{label:string;value:string;sub?:string;color?:string}) {
  return (
    <div className="rounded-xl bg-card border p-4 hover:shadow-md transition-shadow">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold leading-tight number-pop" style={{color:color||"hsl(var(--foreground))"}}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
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
      setActiveZillowUrl(`https://www.zillow.com/homes/${slug}/`);
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:"linear-gradient(170deg,#eef2f6 0%,#e4ece8 50%,#f0ece4 100%)"}}>
      <Card className="w-full max-w-xl shadow-2xl border-0 fade-in">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white text-xl font-bold" style={{background:"linear-gradient(135deg,#1a3a5c,#2d7d7d)"}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <CardTitle className="font-display text-2xl">Minnesota Homebuyer Dashboard</CardTitle>
          <CardDescription className="text-sm mt-1">Pre-approval simulator, DPA program finder, and home search — all in one place.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8 px-8">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Your Name</Label><Input placeholder="First name" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} className="mt-1"/></div>
            <div><Label className="text-xs">County</Label>
              <Select value={profile.county} onValueChange={v=>setProfile(p=>({...p,county:v}))}>
                <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                <SelectContent>{COUNTIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Annual Gross Income</Label><Input type="number" value={profile.annualIncome} onChange={e=>setProfile(p=>({...p,annualIncome:+e.target.value}))} className="mt-1"/></div>
            <div><Label className="text-xs">FICO Score</Label><Input type="number" value={profile.ficoScore} onChange={e=>setProfile(p=>({...p,ficoScore:clamp(+e.target.value,300,850)}))} className="mt-1"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Monthly Debt Payments</Label><Input type="number" value={profile.monthlyDebt} onChange={e=>setProfile(p=>({...p,monthlyDebt:+e.target.value}))} className="mt-1"/></div>
            <div><Label className="text-xs">Household Size</Label><Input type="number" value={profile.householdSize} onChange={e=>setProfile(p=>({...p,householdSize:clamp(+e.target.value,1,10)}))} className="mt-1"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Liquid Assets / Savings</Label><Input type="number" value={profile.liquidAssets} onChange={e=>setProfile(p=>({...p,liquidAssets:+e.target.value}))} className="mt-1"/></div>
            <div><Label className="text-xs">Years at Current Job</Label><Input type="number" value={profile.employmentYears} onChange={e=>setProfile(p=>({...p,employmentYears:+e.target.value}))} className="mt-1"/></div>
          </div>
          <Separator/>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">I'm a first-time homebuyer <span className="text-muted-foreground">(haven't owned in 3+ years)</span></Label>
              <Switch checked={profile.isFirstTimeBuyer} onCheckedChange={v=>setProfile(p=>({...p,isFirstTimeBuyer:v}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">I'm a first-generation buyer <span className="text-muted-foreground">(neither I nor my parents owned a home)</span></Label>
              <Switch checked={profile.isFirstGenBuyer} onCheckedChange={v=>setProfile(p=>({...p,isFirstGenBuyer:v}))} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">I've completed homebuyer education</Label>
              <Switch checked={profile.hasCompletedEducation} onCheckedChange={v=>setProfile(p=>({...p,hasCompletedEducation:v}))} />
            </div>
          </div>
          <Button className="w-full h-12 text-base font-semibold mt-2" style={{background:"linear-gradient(135deg,#1a3a5c,#2d7d7d)"}}
            onClick={()=>setStarted(true)}>
            Launch Dashboard →
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">For educational purposes only. Not financial advice. Verify all program details with administrators.</p>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );

  // ━━━ MAIN DASHBOARD ━━━
  return (
    <TooltipProvider>
    <div className="min-h-screen" style={{background:"linear-gradient(170deg,#eef2f6 0%,#e8ede9 50%,#f0ece6 100%)"}}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b" style={{boxShadow:"0 1px 16px rgba(0,0,0,0.05)"}}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{background:"linear-gradient(135deg,#1a3a5c,#2d7d7d)"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-base font-semibold leading-tight" style={{color:"#1a3a5c"}}>MN Homebuyer Dashboard</h1>
              <p className="text-[10px] text-muted-foreground">{profile.name ? `${profile.name} · ` : ""}{profile.county} County · {profile.isFirstGenBuyer ? "First-Gen" : profile.isFirstTimeBuyer ? "First-Time" : "Buyer"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Approval</p>
              <p className="text-base font-bold" style={{color:approval.color}}>{approval.pct}%</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">DPA Total</p>
              <p className="text-base font-bold" style={{color:"#2d7d7d"}}>{$(totalDPA)}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={()=>setStarted(false)}>Edit Profile</Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 lg:px-6 py-5 space-y-5">
        {/* METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="FICO Score" value={profile.ficoScore.toString()} color={profile.ficoScore>=640?"#16a34a":profile.ficoScore>=580?"#ca8a04":"#dc2626"} sub={profile.ficoScore>=740?"Excellent":profile.ficoScore>=670?"Good":profile.ficoScore>=640?"Fair":"Needs Work"}/>
          <MetricCard label="Income" value={$(profile.annualIncome)} sub={`${$(profile.annualIncome/12)}/mo gross`}/>
          <MetricCard label="Target Price" value={$(price)} color={price<=515200?"#16a34a":"#ea580c"} sub={price<=515200?"Under DPA limit":"Over $515K limit"}/>
          <MetricCard label="DPA Available" value={$(totalDPA)} color="#2d7d7d" sub={`${selectedProgs.size} program(s)`}/>
          <MetricCard label="Out of Pocket" value={$(mort.oop)} color={mort.oop===0?"#16a34a":"#1a3a5c"} sub={mort.oop===0?"Fully covered by DPA":"After DPA applied"}/>
          <MetricCard label="Back-End DTI" value={`${mort.bDTI.toFixed(1)}%`} color={mort.bDTI<=43?"#16a34a":mort.bDTI<=50?"#ca8a04":"#dc2626"} sub={mort.bDTI<=43?"Qualifies":mort.bDTI<=50?"Borderline":"Over limit"}/>
        </div>

        {/* TABS */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/70 backdrop-blur border w-full justify-start gap-0.5 p-1 h-auto flex-wrap">
            {[["simulator","Pre-Approval Sim"],["programs","DPA Programs"],["homes","Home Search"],["timeline","Timeline"]].map(([k,v])=>(
              <TabsTrigger key={k} value={k} className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">{v}</TabsTrigger>
            ))}
          </TabsList>

          {/* ━━━ SIMULATOR ━━━ */}
          <TabsContent value="simulator" className="space-y-4 fade-in mt-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3"><CardTitle className="font-display text-base">Adjust Scenario</CardTitle></CardHeader>
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
                      <div className="flex justify-between"><Label className="text-xs">{label}</Label><span className="text-xs font-semibold">{display}</span></div>
                      <Slider min={min} max={max} step={step} value={[val]} onValueChange={([v])=>setter(v)} className="mt-2"/>
                      {warnClass && warnText && <p className={warnClass}>{warnText}</p>}
                    </div>
                  ))}
                  <Separator/>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Debt Reduction Scenarios</p>
                    {[["Remove $500/mo debt",500],["Remove $926/mo (e.g. auto loan)",926],["Remove $1,705/mo (e.g. two autos)",1705],["No adjustment",0]].map(([label,amt])=>(
                      <label key={label as string} className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-xs transition-colors ${debtAdj===amt?"bg-primary/10 font-medium":"hover:bg-muted/50"}`}>
                        <input type="radio" name="debtadj" checked={debtAdj===amt} onChange={()=>setDebtAdj(amt as number)} className="accent-[#2d7d7d]"/>
                        {label as string}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader className="pb-3"><CardTitle className="font-display text-base">Pre-Approval Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    <Gauge value={approval.pct} label={approval.label} color={approval.color}/>
                    <Gauge value={Math.round(mort.fDTI)} max={55} label="Front DTI" color={mort.fDTI<=31?"#16a34a":mort.fDTI<=40?"#ca8a04":"#dc2626"}/>
                    <Gauge value={Math.round(mort.bDTI)} max={55} label="Back DTI" color={mort.bDTI<=43?"#16a34a":mort.bDTI<=50?"#ca8a04":"#dc2626"}/>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Monthly Payment</h4>
                      <Row label="Principal & Interest" value={$(mort.pi)}/>
                      <Row label="Property Tax" value={$(mort.tax)}/>
                      <Row label="Insurance" value={$(mort.ins)}/>
                      <Row label="FHA MIP" value={$(mort.mip)}/>
                      <Separator className="my-1"/>
                      <Row label="Total PITI + MIP" value={$(mort.total)} bold/>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Cash to Close</h4>
                      <Row label={`Down Payment (${downPct}%)`} value={$(mort.dp)}/>
                      <Row label="Closing Costs (3%)" value={$(mort.cc)}/>
                      <Row label="Total Needed" value={$(mort.cashNeeded)}/>
                      <Row label="DPA Applied" value={`(${$(totalDPA)})`} green/>
                      <Separator className="my-1"/>
                      <Row label="Your Out-of-Pocket" value={$(mort.oop)} bold/>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 space-y-1.5" style={{background:"linear-gradient(135deg,rgba(45,125,125,0.06),rgba(26,58,92,0.06))"}}>
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{color:"#1a3a5c"}}>Assessment</h4>
                    {mort.bDTI>50 && <p className="text-xs text-destructive font-medium">⚠ DTI exceeds 50%. Reduce monthly debt to qualify.</p>}
                    {mort.bDTI>43&&mort.bDTI<=50 && <p className="text-xs text-amber-600 font-medium">⚡ DTI is 43-50%. FHA may approve with compensating factors (stable job, reserves).</p>}
                    {mort.bDTI<=43 && <p className="text-xs text-emerald-600 font-medium">✓ DTI under 43%. Clean FHA qualification.</p>}
                    {profile.ficoScore<640 && <p className="text-xs text-muted-foreground">↑ FICO below 640 limits DPA program access. Focus on utilization paydown for fastest improvement.</p>}
                    {mort.oop===0 && <p className="text-xs text-emerald-600">✓ DPA covers all cash-to-close. Potential $0 out of pocket.</p>}
                    {price>515200 && <p className="text-xs text-destructive">⚠ Price exceeds $515,200. Reduce to qualify for First-Gen DPA ($32K).</p>}
                    {!profile.hasCompletedEducation && <p className="text-xs text-muted-foreground">📋 Most DPA programs require homebuyer education before purchase agreement.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ━━━ PROGRAMS ━━━ */}
          <TabsContent value="programs" className="space-y-4 fade-in mt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">{selectedProgs.size} selected — <span className="font-bold" style={{color:"#2d7d7d"}}>{$(totalDPA)}</span> total DPA</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>{const s=new Set<string>();eligiblePrograms.forEach(p=>{if(p.eligible)s.add(p.id)});setSelectedProgs(s);}}>Select All Eligible</Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={()=>setSelectedProgs(new Set())}>Clear All</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {eligiblePrograms.map(p => (
                <Card key={p.id} className={`cursor-pointer transition-all hover:shadow-lg ${selectedProgs.has(p.id)?"ring-2 ring-[#2d7d7d] shadow-md":"hover:ring-1 hover:ring-border"} ${!p.eligible?"opacity-60":""}`} onClick={()=>toggleProg(p.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-sm">{p.short}</h4>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${statusStyle(p.status)}`}>{p.status}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{p.name}</p>
                      </div>
                      <Switch checked={selectedProgs.has(p.id)} onCheckedChange={()=>toggleProg(p.id)} onClick={e=>e.stopPropagation()}/>
                    </div>
                    <p className="text-xl font-bold" style={{color:"#2d7d7d"}}>{$(p.maxAmount)}</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mt-2">
                      <span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{p.type}{p.forgiveYears?` (${p.forgiveYears}yr)`:""}</span>
                      <span className="text-muted-foreground">Income Limit</span><span className="font-medium">{p.incomeLimit>900000?"None":$(p.incomeLimit)}</span>
                      <span className="text-muted-foreground">FICO</span><span className="font-medium">{p.ficoMin||"None"}</span>
                      <span className="text-muted-foreground">Max Price</span><span className="font-medium">{$(p.purchaseLimit)}</span>
                    </div>
                    <div className={`mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${eligStyle(p.eligible)}`}>
                      {p.eligible ? "✓ Likely Eligible" : `✗ ${p.reason}`}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed border-t pt-2">{p.notes}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <a href={`https://${p.url}`} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline" onClick={e=>e.stopPropagation()}>{p.url}</a>
                      <span className="text-[10px] text-muted-foreground">{p.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ━━━ HOME SEARCH ━━━ */}
          <TabsContent value="homes" className="space-y-4 fade-in mt-4">
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 space-y-3">
                {/* BROWSE ZILLOW */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-base">Browse Zillow</CardTitle>
                    <CardDescription className="text-xs">Search by city/zip or paste a listing URL. Enter the listing price to run your analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Search or paste URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="e.g. Farmington MN, 55024, or full Zillow URL..." value={zillowUrl} onChange={e=>setZillowUrl(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter") handleZillowSearch(); }} className="text-xs h-9"/>
                        <Button size="sm" className="h-9 text-xs shrink-0 px-4" style={{background:"linear-gradient(135deg,#1a3a5c,#2d7d7d)"}} onClick={handleZillowSearch}>Search</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Listing price (for analysis)</Label>
                      <div className="flex gap-2 mt-1 items-center">
                        <span className="text-sm font-medium text-muted-foreground">$</span>
                        <Input type="number" placeholder="475000" value={customPrice || ""} onChange={e=>setCustomPrice(+e.target.value)} className="text-xs h-9"/>
                        <Button variant="outline" size="sm" className="h-9 text-xs shrink-0" disabled={!customPrice}
                          onClick={()=>{ if(customPrice) setPrice(customPrice); }}>Apply</Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Enter the price of any home you find, then click Apply to update your approval analysis.</p>
                    </div>
                    <Separator/>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quick searches</Label>
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
                          <Button key={q.label} variant="outline" size="sm" className="text-[10px] h-7 justify-start"
                            onClick={()=>{setActiveZillowUrl(`https://www.zillow.com/${q.q}`);setZillowUrl(q.label);setSelectedListing(null);}}>
                            {q.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* CURATED LISTINGS */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Curated Listings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {LISTINGS.map(l => {
                      const ok = l.price <= 515200;
                      const sel = selectedListing === l.id;
                      return (
                        <div key={l.id} className={`p-2.5 rounded-lg border cursor-pointer transition-all ${sel?"ring-2 ring-[#2d7d7d] bg-[#2d7d7d]/5":"hover:bg-muted/50"}`}
                          onClick={()=>{setSelectedListing(l.id);setPrice(l.price);setActiveZillowUrl(l.url);setZillowUrl(l.name);setCustomPrice(l.price);}}>
                          <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-[11px] leading-tight pr-2">{l.name}</h5>
                            <span className="text-xs font-bold whitespace-nowrap" style={{color:"#2d7d7d"}}>{$(l.price)}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{l.beds}bd · {l.baths}ba · {l.sqft.toLocaleString()}sf · {l.city}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-[8px] py-0 h-3.5">{l.builder}</Badge>
                            <Badge className={`text-[8px] py-0 h-3.5 border ${ok?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"}`}>{ok?"Under DPA":"Over limit"}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
              {/* RIGHT PANEL */}
              <Card className="lg:col-span-3">
                <CardContent className="p-0">
                  {activeZillowUrl ? (() => {
                    const a = getApproval(profile.ficoScore, mort.bDTI, profile.annualIncome, price);
                    return (
                      <div className="space-y-0">
                        <div className="border-b relative" style={{height:"400px"}}>
                          <iframe src={activeZillowUrl} className="w-full h-full" title="Zillow" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" style={{border:"none"}}/>
                        </div>
                        <div className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-base font-semibold">Analysis for {$(price)} home</h3>
                            <Badge className={`${price<=515200?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"} border`}>{price<=515200?"Under DPA limit":"Over $515K limit"}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-xl" style={{background:`${a.color}10`}}>
                              <p className="text-3xl font-bold" style={{color:a.color}}>{a.pct}%</p>
                              <p className="text-[10px] font-semibold" style={{color:a.color}}>{a.label}</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <p className="text-xl font-bold">{$(mort.total)}</p>
                              <p className="text-[10px] text-muted-foreground">Monthly Payment</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-muted/50">
                              <p className="text-xl font-bold" style={{color:mort.oop===0?"#16a34a":"#1a3a5c"}}>{$(mort.oop)}</p>
                              <p className="text-[10px] text-muted-foreground">Out of Pocket</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div><Row label={`Down (${downPct}%)`} value={$(mort.dp)}/><Row label="Closing (3%)" value={$(mort.cc)}/><Row label="DPA Applied" value={`(${$(totalDPA)})`} green/></div>
                            <div><Row label="P&I" value={$(mort.pi)}/><Row label="Tax+Ins+MIP" value={$(mort.tax+mort.ins+mort.mip)}/><Row label="DTI" value={`${mort.bDTI.toFixed(1)}%`}/></div>
                          </div>
                          <a href={activeZillowUrl} target="_blank" rel="noopener">
                            <Button className="w-full" style={{background:"linear-gradient(135deg,#1a3a5c,#2d7d7d)"}}>Open Full Page on Zillow ↗</Button>
                          </a>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                      <div className="text-center px-8">
                        <svg className="mx-auto mb-4 opacity-20" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <p className="font-display text-lg mb-1">Search for homes</p>
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
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Roadmap to Homeownership</CardTitle></CardHeader>
              <CardContent>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border"/>
                  {[
                    {m:"Month 1",t:"Foundation",c:"#dc2626",items:["Register for homebuyer education (Home Stretch or Framework online)","Sign up at firstgendpa.org for DPA reopening alerts","Address credit utilization — pay revolving balances below 10%","Begin pay-for-delete negotiations on small collections"]},
                    {m:"Month 2-3",t:"Credit Lift",c:"#ea580c",items:["Complete homebuyer education course","Continue collection deletion strategy","If applicable, begin auto loan refinance to reduce DTI","Request credit limit increases on existing cards"]},
                    {m:"Month 4-5",t:"DTI Optimization",c:"#ca8a04",items:["Confirm DTI is within FHA limits (43-50%)","Pull mortgage-specific FICO scores via myFICO.com","Engage DPA-approved mortgage broker","Verify all DPA program eligibility with broker"]},
                    {m:"Month 6-7",t:"Pre-Approval",c:"#16a34a",items:["Get FHA pre-approval letter","Apply to DPA programs (First-Gen when portal reopens, Welcome Home, MHFA)","Reserve DPA funds (typically 90-day window)","Begin home search in target price range"]},
                    {m:"Month 8-10",t:"Home Search & Contract",c:"#2563eb",items:["Tour homes in target communities","Negotiate with builders on pricing and incentives","Execute purchase agreement (education must be complete BEFORE)","DPA funds applied to closing package"]},
                    {m:"Month 11+",t:"Close & Move In",c:"#7c3aed",items:["Complete final walkthrough","Close on your home","File homestead exemption with county (reduces property taxes)","Begin 5-year DPA forgiveness clock"]},
                  ].map((phase,i) => (
                    <div key={phase.m} className="relative pb-7 slide-up" style={{animationDelay:`${i*0.08}s`}}>
                      <div className="absolute -left-5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{background:phase.c,top:"5px"}}/>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className="text-[10px] font-semibold" style={{background:phase.c}}>{phase.m}</Badge>
                        <h4 className="text-sm font-semibold">{phase.t}</h4>
                      </div>
                      <ul className="space-y-1 ml-1">
                        {phase.items.map(item => (
                          <li key={item} className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{background:phase.c}}/>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CONTACTS */}
        <Card className="bg-white/60 backdrop-blur border">
          <CardContent className="py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Key Contacts</p>
            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
              {[
                {o:"NeighborWorks Home Partners",p:"651-292-8710",n:"Welcome Home, Community Keys. Somali/Spanish/Hmong speakers."},
                {o:"Dakota County CDA",p:"651-675-4472",n:"Home Stretch education, local DPA programs."},
                {o:"Minnesota Housing",p:"mnhousing.gov",n:"Start Up / Step Up mortgages, find approved lenders."},
                {o:"MMCDC (First-Gen DPA)",p:"firstgendpa.org",n:"First-Generation DPA Fund administration."},
                {o:"MN Homeownership Center",p:"hocmn.org",n:"Education workshops, advisor directory."},
              ].map(c=>(
                <div key={c.o}>
                  <p className="font-semibold">{c.o}</p>
                  <p className="font-medium" style={{color:"#2d7d7d"}}>{c.p}</p>
                  <p className="text-muted-foreground">{c.n}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground py-3">For educational purposes only. Not financial, legal, or tax advice. Verify all program details with administrators. Program availability subject to change.</p>
      </main>
    </div>
    </TooltipProvider>
  );
}
