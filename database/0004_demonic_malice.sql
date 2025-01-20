ALTER TABLE "cell" DROP CONSTRAINT "cell_rank_unique";--> statement-breakpoint
ALTER TABLE "cell" ADD CONSTRAINT "cell_rank_notebook_id_unique" UNIQUE("rank","notebook_id");