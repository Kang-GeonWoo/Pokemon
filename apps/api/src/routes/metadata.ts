import { Router } from "express";
import { prisma } from "db";

const router: Router = Router();

// GET /api/metadata/names?lang=ko
router.get("/names", async (req, res) => {
    try {
        const lang = (req.query.lang as string) || "ko";

        const [pokemonNames, moveNames, abilityNames, itemNames, natureNames, typeNames] = await Promise.all([
            prisma.pokemonName.findMany({ where: { lang } }),
            prisma.moveName.findMany({ where: { lang } }),
            prisma.abilityName.findMany({ where: { lang } }),
            prisma.itemName.findMany({ where: { lang } }),
            prisma.natureName.findMany({ where: { lang } }),
            prisma.typeName.findMany({ where: { lang } }),
        ]);

        const pokemonMap: Record<string, string> = {};
        pokemonNames.forEach((p: any) => {
            pokemonMap[p.speciesId] = p.name;
        });

        const moveMap: Record<string, string> = {};
        moveNames.forEach((m: any) => {
            moveMap[m.moveId] = m.name;
        });

        const abilityMap: Record<string, string> = {};
        abilityNames.forEach((a: any) => {
            abilityMap[a.abilityId] = a.name;
        });

        const itemMap: Record<string, string> = {};
        itemNames.forEach((i: any) => {
            itemMap[i.itemId] = i.name;
        });

        const natureMap: Record<string, string> = {};
        natureNames.forEach((n: any) => {
            natureMap[n.natureId] = n.name;
        });

        const typeMap: Record<string, string> = {};
        typeNames.forEach((t: any) => {
            typeMap[t.typeId] = t.name;
        });

        res.json({
            pokemon: pokemonMap,
            moves: moveMap,
            abilities: abilityMap,
            items: itemMap,
            natures: natureMap,
            types: typeMap,
        });
    } catch (error) {
        console.error("Error fetching metadata:", error);
        res.status(500).json({ error: "Failed to fetch metadata" });
    }
});

export default router;
