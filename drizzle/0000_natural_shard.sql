CREATE TABLE "login_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"window_start" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"owner" text NOT NULL,
	"id" text NOT NULL,
	"data" text NOT NULL,
	"deleted" integer DEFAULT 0 NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "songs_owner_id_pk" PRIMARY KEY("owner","id")
);
