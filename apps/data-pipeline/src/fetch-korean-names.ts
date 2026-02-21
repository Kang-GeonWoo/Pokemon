
import axios from 'axios';
import { prisma } from 'db';
import path from 'path';
import dotenv from 'dotenv';
import { toId } from './utils';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const NAMU_WIKI_POKEMON_URL = 'https://librewiki.net/wiki/%ED%8F%AC%EC%BC%93%EB%AA%AC%EC%8A%A4%ED%84%B0_%EB%AA%A9%EB%A1%9D/1-9%EC%84%B8%EB%8C%80';

async function fetchKoreanPokemonNames() {
    console.log('Fetching Korean Pokemon Names from LibreWiki/NamuWiki mirror...');

    // Fallback: Hardcoded critical ones if scraping fails or for initial MVP
    // Ideally we scrape a table: No, Idx, Name(Ko), Name(En), etc.
    // For now, let's try a direct approach using PokeAPI as it's cleaner.
    // Scraping wiki is flaky.

    console.log('Switching to PokeAPI for reliability...');
    const POKEAPI_SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species?limit=2000';

    try {
        const { data } = await axios.get(POKEAPI_SPECIES_URL);
        const results = data.results;

        console.log(`Found ${results.length} species. Processing...`);

        let count = 0;

        // Batch process to avoid rate limits? PokeAPI is usually fine.
        // We'll process in chunks of 50.
        const CHUNK_SIZE = 50;

        for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (p: any) => {
                try {
                    const speciesId = p.name; // 'bulbasaur'

                    // Fetch details
                    const detailRes = await axios.get(p.url);
                    const names = detailRes.data.names;
                    const koNameObj = names.find((n: any) => n.language.name === 'ko');

                    if (koNameObj) {
                        const koName = koNameObj.name;

                        // Manual upsert to avoid null issues in composite key with Prisma
                        const existing = await prisma.pokemonName.findFirst({
                            where: {
                                speciesId: speciesId,
                                formId: null,
                                lang: 'ko'
                            }
                        });

                        if (existing) {
                            await prisma.pokemonName.update({
                                where: { id: existing.id },
                                data: { name: koName }
                            });
                        } else {
                            await prisma.pokemonName.create({
                                data: {
                                    speciesId: speciesId,
                                    formId: null,
                                    name: koName,
                                    lang: 'ko'
                                }
                            });
                        }
                        process.stdout.write('.');
                        count++;
                        /*
                        await prisma.pokemonName.upsert({
                            ...
                        });
                        */
                    }
                } catch (err) {
                    console.error(`Failed to fetch ${p.name}:`, err);
                }
            }));
            console.log(`\nProcessed ${i + chunk.length}/${results.length}`);
        }

        console.log(`Successfully seeded ${count} Korean Pokemon names.`);

    } catch (e) {
        console.error('Error fetching Korean names:', e);
    }
}

// Moves are harder via API as "move-names" in showdown might not 1:1 match PokeAPI names (dashes etc)
// But we can try 'https://pokeapi.co/api/v2/move?limit=1000'

async function fetchKoreanMoveNames() {
    console.log('Fetching Korean Move Names from PokeAPI...');
    const POKEAPI_MOVE_URL = 'https://pokeapi.co/api/v2/move?limit=1000';

    try {
        const { data } = await axios.get(POKEAPI_MOVE_URL);
        const results = data.results;
        console.log(`Found ${results.length} moves.`);

        let count = 0;
        const CHUNK_SIZE = 50;

        for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);

            await Promise.all(chunk.map(async (m: any) => {
                try {
                    const moveId = m.name; // 'pound'
                    // Showdown IDs usually remove dashes: 'pound', 'thunderbolt'
                    // PokeAPI has 'thunder-shock'. Showdown 'thundershock'.
                    // We need to normalize.

                    const detailRes = await axios.get(m.url);
                    const names = detailRes.data.names;
                    const koNameObj = names.find((n: any) => n.language.name === 'ko');

                    if (koNameObj) {
                        const koName = koNameObj.name;
                        const showdownId = toId(moveId); // normalize

                        // Manual upsert
                        const existing = await prisma.moveName.findUnique({
                            where: {
                                moveId_lang: {
                                    moveId: showdownId,
                                    lang: 'ko'
                                }
                            }
                        });

                        if (existing) {
                            await prisma.moveName.update({
                                where: { id: existing.id },
                                data: { name: koName }
                            });
                        } else {
                            await prisma.moveName.create({
                                data: {
                                    moveId: showdownId,
                                    name: koName,
                                    lang: 'ko'
                                }
                            });
                        }
                        count++;
                    }
                } catch (err) {
                    // ignore
                }
            }));
            console.log(`\nProcessed ${i + chunk.length}/${results.length} moves`);
        }
        console.log(`Successfully seeded ${count} Korean Move names.`);

    } catch (e) {
        console.error('Error fetching move names:', e);
    }
}


async function fetchKoreanAbilityNames() {
    console.log('Fetching Korean Ability Names from PokeAPI...');
    const POKEAPI_ABILITY_URL = 'https://pokeapi.co/api/v2/ability?limit=500';

    try {
        const { data } = await axios.get(POKEAPI_ABILITY_URL);
        const results = data.results;
        let count = 0;
        const CHUNK_SIZE = 50;

        for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (a: any) => {
                try {
                    const detailRes = await axios.get(a.url);
                    const koNameObj = detailRes.data.names.find((n: any) => n.language.name === 'ko');
                    if (koNameObj) {
                        const abilityId = toId(a.name);
                        const koName = koNameObj.name;

                        const existing = await prisma.abilityName.findUnique({
                            where: { abilityId_lang: { abilityId, lang: 'ko' } }
                        });

                        if (existing) {
                            await prisma.abilityName.update({ where: { id: existing.id }, data: { name: koName } });
                        } else {
                            await prisma.abilityName.create({ data: { abilityId, name: koName, lang: 'ko' } });
                        }
                        count++;
                    }
                } catch (err) { }
            }));
            console.log(`Processed ${i + chunk.length}/${results.length} abilities`);
        }
        console.log(`Successfully seeded ${count} Korean Ability names.`);
    } catch (e) {
        console.error('Error fetching ability names:', e);
    }
}

async function fetchKoreanItemNames() {
    console.log('Fetching Korean Item Names from PokeAPI...');
    const POKEAPI_ITEM_URL = 'https://pokeapi.co/api/v2/item?limit=2100';

    try {
        const { data } = await axios.get(POKEAPI_ITEM_URL);
        const results = data.results;
        let count = 0;
        const CHUNK_SIZE = 50;

        for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(async (item: any) => {
                try {
                    const detailRes = await axios.get(item.url);
                    const koNameObj = detailRes.data.names.find((n: any) => n.language.name === 'ko');
                    if (koNameObj) {
                        const itemId = toId(item.name);
                        const koName = koNameObj.name;

                        const existing = await prisma.itemName.findUnique({
                            where: { itemId_lang: { itemId, lang: 'ko' } }
                        });

                        if (existing) {
                            await prisma.itemName.update({ where: { id: existing.id }, data: { name: koName } });
                        } else {
                            await prisma.itemName.create({ data: { itemId, name: koName, lang: 'ko' } });
                        }
                        count++;
                    }
                } catch (err) { }
            }));
            console.log(`Processed ${i + chunk.length}/${results.length} items`);
        }
        console.log(`Successfully seeded ${count} Korean Item names.`);
    } catch (e) {
        console.error('Error fetching item names:', e);
    }
}

async function fetchKoreanNatureNames() {
    console.log('Fetching Korean Nature Names from PokeAPI...');
    const POKEAPI_NATURE_URL = 'https://pokeapi.co/api/v2/nature?limit=50';

    try {
        const { data } = await axios.get(POKEAPI_NATURE_URL);
        const results = data.results;
        let count = 0;

        await Promise.all(results.map(async (n: any) => {
            try {
                const detailRes = await axios.get(n.url);
                const koNameObj = detailRes.data.names.find((name: any) => name.language.name === 'ko');
                if (koNameObj) {
                    const natureId = toId(n.name);
                    const koName = koNameObj.name;

                    const existing = await prisma.natureName.findUnique({
                        where: { natureId_lang: { natureId, lang: 'ko' } }
                    });

                    if (existing) {
                        await prisma.natureName.update({ where: { id: existing.id }, data: { name: koName } });
                    } else {
                        await prisma.natureName.create({ data: { natureId, name: koName, lang: 'ko' } });
                    }
                    count++;
                }
            } catch (err) { }
        }));
        console.log(`Successfully seeded ${count} Korean Nature names.`);
    } catch (e) {
        console.error('Error fetching nature names:', e);
    }
}

async function fetchKoreanTypeNames() {
    console.log('Fetching Korean Type Names from PokeAPI...');
    const POKEAPI_TYPE_URL = 'https://pokeapi.co/api/v2/type?limit=50';

    try {
        const { data } = await axios.get(POKEAPI_TYPE_URL);
        const results = data.results;
        let count = 0;

        await Promise.all(results.map(async (t: any) => {
            try {
                const detailRes = await axios.get(t.url);
                const koNameObj = detailRes.data.names.find((name: any) => name.language.name === 'ko');
                if (koNameObj) {
                    const typeId = toId(t.name);
                    const koName = koNameObj.name;

                    const existing = await prisma.typeName.findUnique({
                        where: { typeId_lang: { typeId, lang: 'ko' } }
                    });

                    if (existing) {
                        await prisma.typeName.update({ where: { id: existing.id }, data: { name: koName } });
                    } else {
                        await prisma.typeName.create({ data: { typeId, name: koName, lang: 'ko' } });
                    }
                    count++;
                }
            } catch (err) { }
        }));
        console.log(`Successfully seeded ${count} Korean Type names.`);
    } catch (e) {
        console.error('Error fetching type names:', e);
    }
}

async function main() {
    await fetchKoreanPokemonNames();
    await fetchKoreanMoveNames();
    await fetchKoreanAbilityNames();
    await fetchKoreanItemNames();
    await fetchKoreanNatureNames();
    await fetchKoreanTypeNames();
    process.exit(0);
}

main();
