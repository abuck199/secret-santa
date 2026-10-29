CREATE TABLE "santa_exclusions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"user_a" uuid NOT NULL,
	"user_b" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "santa_exclusions_household_id_user_a_user_b_unique" UNIQUE("household_id","user_a","user_b")
);
--> statement-breakpoint
ALTER TABLE "households" ADD COLUMN "santa_announced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "santa_exclusions" ADD CONSTRAINT "santa_exclusions_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santa_exclusions" ADD CONSTRAINT "santa_exclusions_user_a_user_id_fk" FOREIGN KEY ("user_a") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "santa_exclusions" ADD CONSTRAINT "santa_exclusions_user_b_user_id_fk" FOREIGN KEY ("user_b") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Draws made before announcements existed were already visible: keep them so.
UPDATE "households" SET "santa_announced_at" = now() WHERE "id" IN (SELECT DISTINCT "household_id" FROM "assignments");