-- Drop old messages table and create new structure
DROP TABLE IF EXISTS "message_attachments";
DROP TABLE IF EXISTS "messages";

-- Create conversations table
CREATE TABLE "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create new messages table
CREATE TABLE "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL REFERENCES "conversations"("id") ON DELETE cascade,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);