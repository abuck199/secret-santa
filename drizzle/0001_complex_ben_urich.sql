ALTER TABLE "invites" DROP CONSTRAINT "invites_accepted_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "accepted_by";--> statement-breakpoint
ALTER TABLE "invites" DROP COLUMN "accepted_at";