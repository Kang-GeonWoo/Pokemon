-- CreateEnum
CREATE TYPE "StatsStatus" AS ENUM ('STAGING', 'ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('SET', 'TEAM');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'BOOKMARK');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'COMMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruleset_snapshots" (
    "id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "raw_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ruleset_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formats" (
    "id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "format_ruleset_map" (
    "format_id" TEXT NOT NULL,
    "ruleset_snapshot_id" TEXT NOT NULL,

    CONSTRAINT "format_ruleset_map_pkey" PRIMARY KEY ("format_id","ruleset_snapshot_id")
);

-- CreateTable
CREATE TABLE "stats_versions" (
    "id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "status" "StatsStatus" NOT NULL DEFAULT 'STAGING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stats_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species_mappings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "species_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_usage" (
    "id" TEXT NOT NULL,
    "stats_version_id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "usage_rank" INTEGER NOT NULL,
    "usage_rate" DOUBLE PRECISION NOT NULL,
    "raw_json" JSONB NOT NULL,

    CONSTRAINT "pokemon_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_usage" (
    "id" TEXT NOT NULL,
    "stats_version_id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "move_id" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "move_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_usage" (
    "id" TEXT NOT NULL,
    "stats_version_id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "item_id" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "item_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "ruleset_snapshot_id" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_versions" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "ruleset_snapshot_id" TEXT NOT NULL,
    "stats_version_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_opponent_slots" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,

    CONSTRAINT "battle_opponent_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_opponent_moves" (
    "id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "move_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_opponent_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "title" TEXT NOT NULL,
    "body_md" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "ruleset_snapshot_id" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_snapshots" (
    "id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "ability_id" TEXT,
    "item_id" TEXT,
    "nature" TEXT,
    "tera_type" TEXT,
    "ev_json" JSONB NOT NULL,
    "iv_json" JSONB NOT NULL,
    "moves_json" JSONB NOT NULL,
    "notes_md" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_snapshots" (
    "id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "ruleset_snapshot_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_slots" (
    "id" TEXT NOT NULL,
    "team_snapshot_id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "set_snapshot_id" TEXT NOT NULL,

    CONSTRAINT "team_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_set_links" (
    "post_id" TEXT NOT NULL,
    "set_snapshot_id" TEXT NOT NULL,

    CONSTRAINT "post_set_links_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "post_team_links" (
    "post_id" TEXT NOT NULL,
    "team_snapshot_id" TEXT NOT NULL,

    CONSTRAINT "post_team_links_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "formats_format_id_key" ON "formats"("format_id");

-- CreateIndex
CREATE UNIQUE INDEX "stats_versions_format_id_month_key" ON "stats_versions"("format_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "species_mappings_key_key" ON "species_mappings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "battle_opponent_slots_session_id_slot_key" ON "battle_opponent_slots"("session_id", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_user_id_post_id_type_key" ON "reactions"("user_id", "post_id", "type");

-- AddForeignKey
ALTER TABLE "format_ruleset_map" ADD CONSTRAINT "format_ruleset_map_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "format_ruleset_map" ADD CONSTRAINT "format_ruleset_map_ruleset_snapshot_id_fkey" FOREIGN KEY ("ruleset_snapshot_id") REFERENCES "ruleset_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stats_versions" ADD CONSTRAINT "stats_versions_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_usage" ADD CONSTRAINT "pokemon_usage_stats_version_id_fkey" FOREIGN KEY ("stats_version_id") REFERENCES "stats_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "move_usage" ADD CONSTRAINT "move_usage_stats_version_id_fkey" FOREIGN KEY ("stats_version_id") REFERENCES "stats_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_usage" ADD CONSTRAINT "item_usage_stats_version_id_fkey" FOREIGN KEY ("stats_version_id") REFERENCES "stats_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_ruleset_snapshot_id_fkey" FOREIGN KEY ("ruleset_snapshot_id") REFERENCES "ruleset_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_versions" ADD CONSTRAINT "team_versions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_ruleset_snapshot_id_fkey" FOREIGN KEY ("ruleset_snapshot_id") REFERENCES "ruleset_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_stats_version_id_fkey" FOREIGN KEY ("stats_version_id") REFERENCES "stats_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_opponent_slots" ADD CONSTRAINT "battle_opponent_slots_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "battle_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_opponent_moves" ADD CONSTRAINT "battle_opponent_moves_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "battle_opponent_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_ruleset_snapshot_id_fkey" FOREIGN KEY ("ruleset_snapshot_id") REFERENCES "ruleset_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_snapshots" ADD CONSTRAINT "team_snapshots_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_snapshots" ADD CONSTRAINT "team_snapshots_ruleset_snapshot_id_fkey" FOREIGN KEY ("ruleset_snapshot_id") REFERENCES "ruleset_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_slots" ADD CONSTRAINT "team_slots_team_snapshot_id_fkey" FOREIGN KEY ("team_snapshot_id") REFERENCES "team_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_slots" ADD CONSTRAINT "team_slots_set_snapshot_id_fkey" FOREIGN KEY ("set_snapshot_id") REFERENCES "set_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_set_links" ADD CONSTRAINT "post_set_links_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_set_links" ADD CONSTRAINT "post_set_links_set_snapshot_id_fkey" FOREIGN KEY ("set_snapshot_id") REFERENCES "set_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_team_links" ADD CONSTRAINT "post_team_links_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_team_links" ADD CONSTRAINT "post_team_links_team_snapshot_id_fkey" FOREIGN KEY ("team_snapshot_id") REFERENCES "team_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
