import { apiClient } from "@/api/client";

export interface AgentCitation {
  file_path: string;
  function_name: string | null;
  class_name: string | null;
  start_line: number;
  end_line: number;
  snippet: string;
  source: string;
  score: number;
}

export interface AgentChatRequest {
  repo_id: string;
  question: string;
  session_id?: string;
}

export interface AgentChatResponse {
  repo_id: string;
  session_id: string;
  question: string;
  answer: string;
  confidence: number;
  reasoning_steps: string[];
  plan: string[];
  tools_used: string[];
  citations: AgentCitation[];
}

export async function chatWithAgent(body: AgentChatRequest): Promise<AgentChatResponse> {
  const { data } = await apiClient.post<AgentChatResponse>("/agent/chat", body, {
    timeout: 180_000,
  });
  return data;
}
