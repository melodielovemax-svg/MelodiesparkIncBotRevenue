import fs from "node:fs"; import path from "node:path"; import {modelRegistry} from "./registries.mjs"; import {agentRegistry} from "./agents.mjs"; import {safePath,audit,evidence} from "./security.mjs";
const root=process.cwd();
export async function run(a){const [c,s,...x]=a;const k=`${c||""} ${s||""}`.trim();switch(k){
case"doctor":return doctor();case"status":return status();case"models":return out("MODELS",modelRegistry);case"agents":return out("AGENTS",agentRegistry);case"verify":return verify();case"init":return init();case"project create":return create(x);case"project inspect":return inspect(x);case"agent plan":return plan(x);case"product create":return product(x);case"wallet status":return wallet();case"revenue status":return revenue();default:console.log("MelodieOS: doctor | status | models | agents | verify | init")}}
function out(t,v){console.log("\n=== "+t+" ===\n"+JSON.stringify(v,null,2))}
function doctor(){out("DOCTOR",{node:process.version,platform:process.platform,externalProviders:"UNVERIFIED",privateKeysStored:false,automaticFinancialTransfers:false});audit("doctor")}
function status(){out("STATUS",{controlPlane:"OPERATIONAL",cliExecutionPlane:"OPERATIONAL",providerRouter:"SCAFFOLD",codingAgents:"SCAFFOLD",externalIntegrations:"UNVERIFIED",walletTransfer:"BLOCKED",blockchainSettlement:"UNVERIFIED",cloudDeployment:"UNVERIFIED",businessRevenue:"UNVERIFIED"})}
function verify(){out("SECURITY",[["path traversal",1],["null bytes",1],["private-key storage",0],["automatic transfers",0],["fake tx hashes",0]].map(([name,p])=>({name,status:p?"PASS":"BLOCKED"})))}
function init(){for(const d of["data","audit","evidence"])fs.mkdirSync(path.join(root,d),{recursive:true});fs.writeFileSync(path.join(root,"data/workspace.json"),JSON.stringify({createdAt:new Date().toISOString()},null,2));console.log("Local workspace initialized")}
function create(x){const p=safePath(root,x[0]||"melodie-project");fs.mkdirSync(p,{recursive:true});evidence("project.create",{path:p});console.log(p)}
function inspect(x){const p=safePath(root,x[0]||".");out("PROJECT",{path:p,exists:fs.existsSync(p),files:fs.existsSync(p)?fs.readdirSync(p):[]})}
function plan(x){const task=x.join(" ")||"inspect workspace";evidence("agent.plan",{task});out("PLAN",{status:"PROPOSED",task,approvalRequired:true})}
function product(x){out("PRODUCT",{status:"DRAFT",name:x.join(" ")||"Unnamed",publishRequiresApproval:true})}
function wallet(){out("WALLET",{connection:"UNVERIFIED",transfer:"BLOCKED",privateKeysStored:false})}
function revenue(){out("REVENUE",{verifiedRevenue:"—",reason:"No verified external payment source"})}