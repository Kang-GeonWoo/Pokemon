"use client";

import { useEffect, useState } from "react";
import { apiBase } from "../lib/api";

type Metadata = {
    pokemon: Record<string, string>; // speciesId -> Korean Name
    moves: Record<string, string>;   // moveId -> Korean Name
    abilities: Record<string, string>;
    items: Record<string, string>;
    natures: Record<string, string>;
    types: Record<string, string>;
    reversePokemon: Record<string, string>;
    reverseMoves: Record<string, string>;
    reverseAbilities: Record<string, string>;
    reverseItems: Record<string, string>;
    reverseNatures: Record<string, string>;
    reverseTypes: Record<string, string>;
};

let cachedMetadata: Metadata | null = null;
let fetchPromise: Promise<Metadata> | null = null;

export function useMetadata() {
    const [metadata, setMetadata] = useState<Metadata | null>(cachedMetadata);

    useEffect(() => {
        if (cachedMetadata) {
            setMetadata(cachedMetadata);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = fetch(`${apiBase()}/api/metadata/names?lang=ko`)
                .then((res) => res.json())
                .then((data) => {
                    const reversePokemon: Record<string, string> = {};
                    const reverseMoves: Record<string, string> = {};
                    const reverseAbilities: Record<string, string> = {};
                    const reverseItems: Record<string, string> = {};
                    const reverseNatures: Record<string, string> = {};
                    const reverseTypes: Record<string, string> = {};

                    Object.entries(data.pokemon).forEach(([k, v]) => { reversePokemon[v as string] = k; });
                    Object.entries(data.moves).forEach(([k, v]) => { reverseMoves[v as string] = k; });
                    Object.entries(data.abilities).forEach(([k, v]) => { reverseAbilities[v as string] = k; });
                    Object.entries(data.items).forEach(([k, v]) => { reverseItems[v as string] = k; });
                    Object.entries(data.natures).forEach(([k, v]) => { reverseNatures[v as string] = k; });
                    Object.entries(data.types).forEach(([k, v]) => { reverseTypes[v as string] = k; });

                    const result = {
                        pokemon: data.pokemon,
                        moves: data.moves,
                        abilities: data.abilities,
                        items: data.items,
                        natures: data.natures,
                        types: data.types,
                        reversePokemon,
                        reverseMoves,
                        reverseAbilities,
                        reverseItems,
                        reverseNatures,
                        reverseTypes
                    };
                    cachedMetadata = result;
                    return result;
                })
                .catch((err) => {
                    console.error("Failed to load metadata:", err);
                    fetchPromise = null; // retry on failure
                    throw err;
                });
        }

        fetchPromise.then((data) => setMetadata(data)).catch(() => { });
    }, []);

    return metadata;
}
