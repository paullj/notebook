ALTER TABLE "cell" ALTER COLUMN "rank" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "cell" DROP COLUMN IF EXISTS "index";--> statement-breakpoint
ALTER TABLE "cell" ADD CONSTRAINT "cell_rank_unique" UNIQUE("rank");