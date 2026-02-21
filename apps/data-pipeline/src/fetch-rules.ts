import axios from 'axios';
import { prisma, Format, RulesetSnapshot, FormatRulesetMap } from 'db';
import { toId } from './utils';
import vm from 'vm';
import path from 'path';
import dotenv from 'dotenv';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const FORMATS_URL = 'https://play.pokemonshowdown.com/data/formats.js';

// Type definitions for Showdown format data
interface ShowdownFormat {
    name: string;
    section?: string;
    column?: number;
    ruleset?: string[];
    banlist?: string[];
    unbanlist?: string[];
    restricted?: string[];
    checkLearnset?: boolean;
    timer?: boolean;
    minLevel?: number;
    maxLevel?: number;
    defaultLevel?: number;
    team?: string;
    searchShow?: boolean;
    tournamentShow?: boolean;
    challengeShow?: boolean;
    threads?: string[];
}

async function fetchRules() {
    console.log(`Fetching formats from Showdown (${FORMATS_URL})...`);
    try {
        const response = await axios.get(FORMATS_URL);
        const scriptContent = response.data;

        // 1. Parse JS using VM Sandbox
        // formats.js structure: "export const Formats = [ ... ];"
        // We need to simulate a context where "exports" or "export const" works, 
        // or just strip the prefix.

        const sandbox = { exports: { Formats: [] as ShowdownFormat[] } };

        // Quick cleanup to make it VM-friendly if needed. 
        // Showdown file usually has "exports.Formats = [...]" in older versions 
        // or "export const Formats = [...]" in newer.
        // Let's try a safe generic approach: 
        // Regex to extract the array content might be safer than executing unknown code,
        // but VM is requested.

        // Heuristic: Replace "export const Formats =" with "exports.Formats ="
        let safeScript = scriptContent
            .replace('export const Formats =', 'exports.Formats =');

        vm.createContext(sandbox);
        vm.runInContext(safeScript, sandbox);

        const rawFormats = sandbox.exports.Formats;

        if (!Array.isArray(rawFormats)) {
            throw new Error('Parsed data is not an array.');
        }

        console.log(`Fetched and parsed ${rawFormats.length} formats.`);

        // --- QUALITY CHECK ---
        const MIN_FORMATS_COUNT = 50;
        const REQUIRED_FORMAT_ID = 'gen9ou';

        const hasMinCount = rawFormats.length >= MIN_FORMATS_COUNT;
        const hasRequiredFormat = rawFormats.some(f => toId(f.name) === REQUIRED_FORMAT_ID);

        if (!hasMinCount || !hasRequiredFormat) {
            console.error(`Quality Check FAILED! Count: ${rawFormats.length}, Has ${REQUIRED_FORMAT_ID}: ${hasRequiredFormat}`);
            console.error('Aborting DB update to prevent corruption.');
            process.exit(1);
        }

        console.log('Quality Check PASSED. Proceeding to DB update.');

        // 2. Transact: Create Snapshot -> Upsert Formats -> Link
        await prisma.$transaction(async (tx) => {
            // A. Create Snapshot
            const snapshot = await tx.rulesetSnapshot.create({
                data: {
                    snapshotDate: new Date(),
                    rawJson: rawFormats as any,
                },
            });
            console.log(`Created RulesetSnapshot ID: ${snapshot.id}`);

            let activeSection = '';
            let count = 0;

            for (const item of rawFormats) {
                if (item.section) {
                    activeSection = item.section;
                    continue;
                }
                if (!item.name) continue;

                const name = item.name;
                const id = toId(name);

                // Upsert Format
                // We mark it active if it's in the list.
                const format = await tx.format.upsert({
                    where: { formatId: id },
                    update: {
                        name: name,
                        isActive: true,
                    },
                    create: {
                        formatId: id,
                        name: name,
                        isActive: true,
                    },
                });

                // Link to Snapshot (Prevent duplicates if run multiple times? Snapshot ID is new, so it's fine)
                await tx.formatRulesetMap.create({
                    data: {
                        formatId: format.id,
                        rulesetSnapshotId: snapshot.id,
                    },
                });

                count++;
            }
            console.log(`Successfully synced ${count} formats to ACTIVE state.`);
        });

    } catch (error) {
        console.error('Error in fetchRules:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fetchRules();
