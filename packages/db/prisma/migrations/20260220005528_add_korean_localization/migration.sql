-- CreateTable
CREATE TABLE "pokemon_names" (
    "id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "form_id" TEXT,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "pokemon_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "move_names" (
    "id" TEXT NOT NULL,
    "move_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'ko',

    CONSTRAINT "move_names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_names_species_id_form_id_lang_key" ON "pokemon_names"("species_id", "form_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "move_names_move_id_lang_key" ON "move_names"("move_id", "lang");
