"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, Compass, House, MessageCircle, Plus, Search, Sparkles, UserRound, Users, Rocket, BookOpen, BriefcaseBusiness, MapPin, Globe2, Menu, X, Heart, MessageSquare, Send, LogOut, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NETWORKS, type NetworkId, type Post } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  human:<Users/>, action:<Rocket/>, knowledge:<BookOpen/>, opportunity:<BriefcaseBusiness/>, experience:<MapPin/>, ai:<Sparkles/>, collective:<Globe2/>
};
const demoPosts = [
 {id:"demo-1",title:"Building a climate-friendly neighbourhood map",body:"Looking for people interested in mapping local repair shops, refill stations and community gardens. Starting with one neighbourhood and learning as we go.",network:"action",post_type:"project",created_at:new Date().toISOString(),profiles:{display_name:"Aarav Mehta",username:"aarav",avatar_url:null}},
 {id:"demo-2",title:"A small learning circle for practical AI",body:"We are sharing one useful AI workflow every week and trying it in a real project. Beginners and experienced builders are welcome.",network:"knowledge",post_type:"learning",created_at:new Date(Date.now()-3600000).toISOString(),profiles:{display_name:"Sara Khan",username:"sara",avatar_url:null}},
 {id:"demo-3",title:"Seeking a design collaborator",body:"I am exploring a public-interest service directory and would love to meet someone who enjoys thoughtful product design.",network:"opportunity",post_type:"collaboration",created_at:new Date(Date.now()-7200000).toISOString(),profiles:{display_name:"Rohan Verma",username:"rohan",avatar_url:null}}
] as unknown as Post[];

export function Dashboard() {
 const [page,setPage]=useState<"home"|"discover"|"messages"|"ai"|"profile"|"network">("home");
 const [network,setNetwork]=useState<NetworkId>("human");
 const [posts,setPosts]=useState<Post[]>(demoPosts);
 const [user,setUser]=useState<any>(null);
 const [profile,setProfile]=useState<any>(null);
 const [query,setQuery]=useState("");
 const [modal,setModal]=useState(false);
 const [mobileNav,setMobileNav]=useState(false);
 const [loading,setLoading]=useState(false);
 const [toast,setToast]=useState("");
 const [aiPrompt,setAiPrompt]=useState("");
 const [aiAnswer,setAiAnswer]=useState("");
 const [aiLoading,setAiLoading]=useState(false);
 const [form,setForm]=useState({title:"",body:"",network:"action" as NetworkId,post_type:"project"});
 const supabase=useMemo(()=>{try{return createClient()}catch{return null}},[]);
 useEffect(()=>{if(!supabase)return;let alive=true;
   supabase.auth.getUser().then(({data})=>{if(!alive)return;setUser(data.user);if(data.user){supabase.from("profiles").select("*").eq("id",data.user.id).maybeSingle().then(({data:p})=>setProfile(p));}});
   const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null)});
   loadPosts();return()=>{alive=false;listener.subscription.unsubscribe()};
 },[supabase]);
 async function loadPosts(){if(!supabase)return;const {data,error}=await supabase.from("posts").select("id,user_id,title,body,network,post_type,created_at,profiles(display_name,username,avatar_url)").eq("visibility","public").order("created_at",{ascending:false}).limit(30);if(!error&&data?.length)setPosts(data as any);}
 function notify(s:string){setToast(s);setTimeout(()=>setToast(""),2600)}
 async function createPost(e:React.FormEvent){e.preventDefault();if(!user){notify("Sign in to publish to the live network.");return}if(!supabase)return;setLoading(true);
   const {error}=await supabase.from("posts").insert({...form,user_id:user.id,visibility:"public"});
   setLoading(false);if(error){notify(error.message);return}setModal(false);setForm({title:"",body:"",network:"action",post_type:"project"});await loadPosts();notify("Published to your world.");}
 async function signIn(){if(!supabase){notify("Configure Supabase environment variables first.");return}const email=prompt("Enter your email address");if(!email)return;const password=prompt("Enter your password (minimum 8 characters)");if(!password)return;const {error}=await supabase.auth.signInWithPassword({email,password});if(error)notify(error.message);else notify("Signed in.");}
 async function signUp(){if(!supabase){notify("Configure Supabase environment variables first.");return}const email=prompt("Email address");if(!email)return;const password=prompt("Create a password (minimum 8 characters)");if(!password)return;const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin}});if(error)notify(error.message);else notify("Check your email to confirm your account.");}
 async function signOut(){await supabase?.auth.signOut();setUser(null);setProfile(null);notify("Signed out.");}
 async function askAI(e:React.FormEvent){e.preventDefault();if(!aiPrompt.trim())return;setAiLoading(true);setAiAnswer("");try{const res=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:aiPrompt})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Assistant request failed");setAiAnswer(data.answer)}catch(err:any){setAiAnswer(err.message+" — Configure OPENAI_API_KEY on the server to activate the assistant.")}finally{setAiLoading(false)}}
 const visiblePosts=posts.filter(p=>(p.title+" "+(p.body||"")+" "+p.network).toLowerCase().includes(query.toLowerCase()));
 function goNetwork(id:NetworkId){setNetwork(id);setPage(id==="ai"?"ai":"network");setMobileNav(false)}
 const activeNetwork=NETWORKS.find(n=>n.id===network)!;
 return <div className="shell">
  <aside className={`sidebar ${mobileNav?"open":""}`}>
   <div className="brand"><div className="brand-mark">◎</div><div><b>ONE WORLD</b><small>THE HUMAN INTERNET</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
   <div className="nav-label">YOUR SPACE</div>
   <nav>
    <button className={page==="home"?"selected":""} onClick={()=>{setPage("home");setMobileNav(false)}}><House/>Home</button>
    <button className={page==="discover"?"selected":""} onClick={()=>{setPage("discover");setMobileNav(false)}}><Compass/>Discover</button>
    {NETWORKS.filter(n=>n.id!=="ai").map(n=><button key={n.id} className={page==="network"&&network===n.id?"selected":""} onClick={()=>goNetwork(n.id)}>{iconMap[n.id]}{n.name}</button>)}
    <button className={page==="ai"?"selected":""} onClick={()=>{setPage("ai");setMobileNav(false)}}><Sparkles/>Personal AI</button>
    <button className={page==="messages"?"selected":""} onClick={()=>{setPage("messages");setMobileNav(false)}}><MessageCircle/>Messages</button>
   </nav>
   <div className="sidebar-bottom">{user?<><div className="user-mini"><div className="avatar">{(profile?.display_name||user.email||"U").slice(0,1).toUpperCase()}</div><div><b>{profile?.display_name||"Your profile"}</b><small>{user.email}</small></div></div><button className="signout" onClick={signOut}><LogOut size={15}/> Sign out</button></>:<div className="auth-mini"><p>Join the connected world.</p><button className="btn primary full" onClick={signUp}>Create account</button><button className="btn secondary full" onClick={signIn}>Sign in</button></div>}</div>
  </aside>
  <main>
   <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people, ideas, projects or opportunities..."/></div><div className="top-actions"><button className="icon-button" title="Notifications" onClick={()=>notify("You're all caught up.")}><Bell/></button><button className="btn primary create-top" onClick={()=>setModal(true)}><Plus size={16}/> Create</button>{user?<button className="profile-dot" onClick={()=>setPage("profile")}>{(profile?.display_name||user.email||"U").slice(0,1).toUpperCase()}</button>:<button className="btn secondary" onClick={signIn}>Sign in</button>}</div></header>
   {page==="home"&&<><section className="hero"><div className="eyebrow">A new kind of digital world</div><h1>Your world is bigger<br/>when it's connected.</h1><p>Meet people, build things, learn together and discover opportunities. One connected space for the things that move life forward.</p><div className="hero-actions"><button className="btn primary" onClick={()=>setPage("discover")}>Explore your world <span>→</span></button><button className="btn secondary" onClick={()=>setModal(true)}><Plus size={16}/> Start something</button></div><div className="hero-stats"><span><b>7</b> connected networks</span><span><b>1</b> shared identity</span><span><b>∞</b> ways to grow</span></div><div className="orbit orbit-one"/><div className="orbit orbit-two"/></section>
    <div className="section-title"><div><h2>Explore your networks</h2><p>Seven ways to connect your world.</p></div></div>
    <div className="network-grid">{NETWORKS.map(n=><button className="network-card" key={n.id} onClick={()=>goNetwork(n.id)}><span className="network-icon">{iconMap[n.id]}</span><span className="network-arrow">↗</span><b>{n.name}</b><small>{n.description}</small></button>)}</div>
    <div className="lower-grid"><section className="panel"><div className="section-title compact"><div><h2>Your world today</h2><p>Activity from across your networks.</p></div><button className="text-button" onClick={loadPosts}>↻ Refresh</button></div><Feed posts={visiblePosts} notify={notify}/></section><aside className="panel side-panel"><h3>Start with a meaningful connection</h3><p>Find people who share your curiosity, goals or skills. Real profiles and recommendations appear as the community grows.</p><button className="btn secondary full" onClick={()=>goNetwork("human")}>Explore people →</button><div className="prompt-card"><Sparkles/><b>Today's prompt</b><p>What could you learn or create this week that would make your future easier?</p><button className="text-button" onClick={()=>setPage("ai")}>Think it through with AI →</button></div></aside></div>
   </>}
   {page==="discover"&&<><div className="eyebrow">Explore beyond your circle</div><h1>Discover your next thing.</h1><p className="muted">Find ideas, people, projects and experiences that match your curiosity.</p><div className="section-title"><div><h2>Explore all seven networks</h2><p>Start anywhere. Everything connects.</p></div></div><div className="network-grid">{NETWORKS.map(n=><button className="network-card" key={n.id} onClick={()=>goNetwork(n.id)}><span className="network-icon">{iconMap[n.id]}</span><b>{n.name}</b><small>{n.description}</small></button>)}</div><section className="panel discover-panel"><h2>Community activity</h2><Feed posts={visiblePosts} notify={notify}/></section></>}
   {page==="network"&&<><div className="eyebrow">Explore network</div><section className="network-hero"><div className="big-network-icon">{iconMap[network]}</div><h1>{activeNetwork.name}</h1><p>{activeNetwork.detail}</p><button className="btn primary" onClick={()=>setModal(true)}><Plus size={16}/> Create in this network</button></section><div className="section-title"><div><h2>Activity and ideas</h2><p>Posts tagged in this network.</p></div></div><Feed posts={visiblePosts.filter(p=>p.network===network)} notify={notify}/>{visiblePosts.filter(p=>p.network===network).length===0&&<div className="empty-state">No posts here yet. Start the first conversation.</div>}</>}
   {page==="ai"&&<><div className="eyebrow">Your personal intelligence layer</div><h1>Meet your AI companion.</h1><p className="muted">A helpful assistant that can turn questions and ambitions into practical next steps.</p><section className="ai-card"><div className="ai-emblem"><Sparkles/></div><h2>What are we working on?</h2><p>Ask for a plan, a brainstorm, a learning path or help connecting the dots.</p><form className="ai-form" onSubmit={askAI}><input value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="e.g. Help me find collaborators for my app idea"/><button className="btn primary" disabled={aiLoading}>{aiLoading?<LoaderCircle className="spin"/>:<Send size={16}/>} Ask</button></form>{aiAnswer&&<div className="ai-answer">{aiAnswer}</div>}</section><div className="section-title"><div><h2>Quick starts</h2><p>Give your next step some structure.</p></div></div><div className="network-grid">{["Create a 30-day learning plan","Validate a startup idea","Find collaborators for a project","Explore opportunities based on my skills"].map((s,i)=><button className="network-card" key={s} onClick={()=>setAiPrompt(s)}><span className="network-icon">{[<BookOpen/>,<Rocket/>,<Users/>,<BriefcaseBusiness/>][i]}</span><b>{s}</b><small>Use AI to map a practical next step.</small></button>)}</div></>}
   {page==="messages"&&<><div className="eyebrow">Stay in touch</div><h1>Messages</h1><p className="muted">Private conversations with people across your networks.</p><div className="empty-state">Messaging is scaffolded in the database. Open a conversation after connecting with another member. Real-time chat UI is the next integration milestone.</div></>}
   {page==="profile"&&<><div className="eyebrow">Your identity</div><h1>Your profile</h1><div className="panel profile-panel"><div className="avatar large">{(profile?.display_name||user?.email||"U").slice(0,1).toUpperCase()}</div><h2>{profile?.display_name||"New ONE WORLD member"}</h2><p className="muted">{user?.email}</p><p className="muted">Your profile becomes the shared identity across all seven networks.</p></div></>}
   <footer>ONE WORLD · The Human Internet <span>Prototype MVP · Built for iteration</span></footer>
  </main>
  {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={createPost}><div className="modal-head"><div><div className="eyebrow">Share with your world</div><h2>Create something new</h2></div><button type="button" className="close" onClick={()=>setModal(false)}>×</button></div><label>What are you creating?<select value={form.post_type} onChange={e=>setForm({...form,post_type:e.target.value})}><option value="project">Project</option><option value="community">Community</option><option value="learning">Learning circle</option><option value="event">Event or experience</option><option value="opportunity">Opportunity</option><option value="question">Question</option></select></label><label>Title<input required maxLength={140} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Give your idea a clear title"/></label><label>Description<textarea maxLength={4000} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="What are you trying to do? Who would you like to join?"/></label><label>Network<select value={form.network} onChange={e=>setForm({...form,network:e.target.value as NetworkId})}>{NETWORKS.filter(n=>n.id!=="ai").map(n=><option value={n.id} key={n.id}>{n.name}</option>)}</select></label><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn primary" disabled={loading}>{loading?<LoaderCircle className="spin"/>:"Publish"}</button></div>{!user&&<p className="form-note">You can explore the demo without signing in. Create an account to publish to the live database.</p>}</form></div>}
  {toast&&<div className="toast">{toast}</div>}
 </div>
}

function Feed({posts,notify}:{posts:Post[];notify:(s:string)=>void}) {
 if(!posts.length)return <div className="empty-state">Nothing here yet. Start a conversation or create the first project.</div>;
 return <div className="feed-list">{posts.map(p=><article className="feed-item" key={p.id}><div className="feed-author"><div className="avatar">{(p.profiles?.display_name||"M").slice(0,1).toUpperCase()}</div><div><b>{p.profiles?.display_name||"ONE WORLD member"}</b><small>{new Date(p.created_at).toLocaleString()} · {NETWORKS.find(n=>n.id===p.network)?.name||p.network}</small></div><span className="pill">{p.post_type}</span></div><h3>{p.title}</h3><p>{p.body}</p><div className="feed-controls"><button onClick={()=>notify("Sign in and connect reactions to interact.")}><Heart size={15}/> Appreciate</button><button onClick={()=>notify("Comments interface is planned for the next release.")}><MessageSquare size={15}/> Discuss</button><button onClick={()=>notify("Share link copied when browser permissions allow.")}>↗ Share</button></div></article>)}</div>;
}
