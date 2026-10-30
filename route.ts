import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ prompt: z.string().trim().min(2).max(4000) });
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to use the personal AI assistant." }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({error:"AI is not configured yet. Add OPENAI_API_KEY to the server environment."},{status:503});

    const client = new OpenAI({apiKey:key});
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "You are ONE WORLD's practical, constructive assistant. Help people learn, collaborate, create projects and find responsible next steps. Be concise, specific and honest. Do not claim to have performed actions or accessed private platform data.",
      input: body.prompt,
      max_output_tokens: 700
    });
    return NextResponse.json({answer:response.output_text});
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({error:"Please enter a prompt between 2 and 4,000 characters."},{status:400});
    return NextResponse.json({error:"The assistant could not complete this request."},{status:500});
  }
}
