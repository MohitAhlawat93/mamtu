import { buildMamtuKnowledge, retrieveMamtuKnowledge } from "./mamtu-knowledge.js";

export const DEFAULT_EMBEDDING_MODEL="@cf/qwen/qwen3-embedding-0.6b";

function cosineSimilarity(left=[],right=[]){
  const length=Math.min(left.length,right.length);
  let dot=0,leftMagnitude=0,rightMagnitude=0;
  for(let index=0;index<length;index++){
    dot+=left[index]*right[index];
    leftMagnitude+=left[index]*left[index];
    rightMagnitude+=right[index]*right[index];
  }
  if(!leftMagnitude||!rightMagnitude)return 0;
  return dot/(Math.sqrt(leftMagnitude)*Math.sqrt(rightMagnitude));
}

function embeddingVectors(result){
  if(Array.isArray(result?.data)&&Array.isArray(result.data[0]))return result.data;
  if(Array.isArray(result?.data?.data)&&Array.isArray(result.data.data[0]))return result.data.data;
  return [];
}

function documentForEmbedding(chunk){
  const tags=Array.isArray(chunk.tags)?chunk.tags.join(", "):"";
  return ("Passage title: "+chunk.title+"\nTopics: "+tags+"\nPassage: "+chunk.text).slice(0,16000);
}

function fuseRankings(knowledge,lexical,semantic,page,limit){
  const scores=new Map(knowledge.map(chunk=>[chunk.id,0]));
  lexical.forEach((chunk,index)=>scores.set(chunk.id,(scores.get(chunk.id)||0)+1.4/(60+index+1)));
  semantic.forEach(({chunk,similarity},index)=>scores.set(chunk.id,(scores.get(chunk.id)||0)+1.4/(60+index+1)+Math.max(0,similarity)*0.04));
  if(page)for(const chunk of knowledge)if(chunk.path===page)scores.set(chunk.id,(scores.get(chunk.id)||0)+0.001);
  return [...knowledge]
    .sort((left,right)=>(scores.get(right.id)||0)-(scores.get(left.id)||0))
    .slice(0,limit);
}

export async function retrieveHybridMamtuKnowledge(query,limit,data,{page="",ai,model=DEFAULT_EMBEDDING_MODEL}={}){
  const lexical=retrieveMamtuKnowledge(query,limit,data,{page});
  if(!ai)return lexical;

  const knowledge=buildMamtuKnowledge(data);
  const texts=[
    "Instruct: Retrieve public Mamtu website passages that answer the visitor's question.\nQuery: "+query,
    ...knowledge.map(documentForEmbedding)
  ];

  try{
    const result=await ai.run(model,{text:texts});
    const vectors=embeddingVectors(result);
    if(vectors.length!==texts.length)throw new Error("Unexpected embedding result size");
    const queryVector=vectors[0];
    const semantic=knowledge
      .map((chunk,index)=>({chunk,similarity:cosineSimilarity(queryVector,vectors[index+1])}))
      .sort((left,right)=>right.similarity-left.similarity);
    return fuseRankings(knowledge,lexical,semantic,page,limit);
  }catch(error){
    console.error("Mamtu Assistant embedding fallback:",error?.message||error);
    return lexical;
  }
}
