-- CreateTable
CREATE TABLE "ability_names" (
    "id" TEXT NOT NULL,
    "ability_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "ability_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_names" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "item_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nature_names" (
    "id" TEXT NOT NULL,
    "nature_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "nature_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_names" (
    "id" TEXT NOT NULL,
    "type_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "type_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ability_names_ability_id_lang_key" ON "ability_names"("ability_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "item_names_item_id_lang_key" ON "item_names"("item_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "nature_names_nature_id_lang_key" ON "nature_names"("nature_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "type_names_type_id_lang_key" ON "type_names"("type_id", "lang");
