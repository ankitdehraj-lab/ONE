export type NetworkId = "human" | "action" | "knowledge" | "opportunity" | "experience" | "ai" | "collective";
export type Post = {
  id: string; user_id: string; title: string; body: string | null;
  network: NetworkId; post_type: string; created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null; username: string | null } | null;
  reactions?: { count: number }[];
};
export const NETWORKS: {id: NetworkId; icon: string; name: string; description: string; detail: string}[] = [
  {id:"human",icon:"◉",name:"Human Network",description:"Meet people through shared interests, skills and goals.",detail:"Build meaningful connections around what matters to you. Discover people by shared interests, complementary skills and the things you want to achieve."},
  {id:"action",icon:"↗",name:"Action Network",description:"Turn ideas into projects and shared action.",detail:"Move from talking to doing. Create projects, invite collaborators, set milestones and make progress together."},
  {id:"knowledge",icon:"▤",name:"Knowledge Network",description:"Learn, teach, ask and solve problems together.",detail:"Exchange practical expertise, ask questions and build collective knowledge with people and AI."},
  {id:"opportunity",icon:"◇",name:"Opportunity Network",description:"Connect skills with jobs, clients and partners.",detail:"Discover opportunities that match your skills and ambitions, and help others find the people they need."},
  {id:"experience",icon:"⌖",name:"Experience Network",description:"Discover events, places and things to do.",detail:"Connect digital discovery to real life through events, local activities, travel and shared experiences."},
  {id:"ai",icon:"✳",name:"Personal AI",description:"An intelligent assistant across your journey.",detail:"Get help planning goals, learning topics, organizing projects and connecting ideas."},
  {id:"collective",icon:"◎",name:"Collective World",description:"Build communities and shared initiatives.",detail:"Create shared spaces where groups develop resources, projects and long-term initiatives."}
];
