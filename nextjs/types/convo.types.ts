import { Json } from "@/types_db";

export type Convo = {
  id?: string | null;
  userId: string | null;
  content: Json | null;
  title: string | "Untitled";
};