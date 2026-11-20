import assert from "node:assert/strict";
import { MAMTU_DATA } from "../data/mamtu-data.js";
import { retrieveMamtuKnowledge } from "../lib/mamtu-knowledge.js";
import { retrieveHybridMamtuKnowledge, DEFAULT_EMBEDDING_MODEL } from "../lib/semantic-retrieval.js";

const query="Where can I explore her visual memories?";
const ai={
  async run(model,{text}){
    assert.equal(model,DEFAULT_EMBEDDING_MODEL);
    return {data:text.map((item,index)=>index===0||item.includes("Mamtu — growing gallery")?[1,0]:[0,1])};
  }
};

const hybrid=await retrieveHybridMamtuKnowledge(query,8,MAMTU_DATA,{page:"/",ai});
assert.equal(hybrid[0].id,"gallery","Semantic retrieval should promote the conceptually relevant gallery passage");

const lexical=retrieveMamtuKnowledge(query,8,MAMTU_DATA,{page:"/"});
const fallback=await retrieveHybridMamtuKnowledge(query,8,MAMTU_DATA,{page:"/",ai:{run:async()=>{throw new Error("simulated embedding failure")}}});
assert.deepEqual(fallback.map(item=>item.id),lexical.map(item=>item.id),"Embedding failure should preserve lexical retrieval");

console.log("PASS: semantic retrieval and lexical fallback");
