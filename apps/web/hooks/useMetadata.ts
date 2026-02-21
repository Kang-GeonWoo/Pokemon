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
                    const fallbackPokemon: Record<string, string> = {
                        "ironbundle": "무쇠보따리",
                        "ironvaliant": "무쇠무인",
                        "ironhands": "무쇠손",
                        "ironmoth": "무쇠독나방",
                        "ironjugulis": "무쇠머리",
                        "ironthorns": "무쇠가시",
                        "irontreads": "무쇠바퀴",
                        "ironleaves": "무쇠잎새",
                        "ironboulder": "무쇠암석",
                        "ironcrown": "무쇠보루",
                        "ironhorn": "무쇠뿔", // 예외 등
                        "greattusk": "위대한엄니",
                        "screamtail": "우렁찬꼬리",
                        "brutebonnet": "사나운버섯",
                        "fluttermane": "날개치는머리",
                        "slitherwing": "땅을기는날개",
                        "sandyshocks": "모래털가죽",
                        "roaringmoon": "고대활공",
                        "walkingwake": "굽이치는물결",
                        "gougingfire": "꿰뚫는화염",
                        "ragingbolt": "날뛰는우레",
                        "tinglu": "딩루",
                        "chienpao": "파오젠",
                        "wochien": "총지엔",
                        "chiyu": "위유이",
                        "ogerpon": "오거폰",
                        "ogerponwellspring": "오거폰(우물)",
                        "ogerponhearthflame": "오거폰(화덕)",
                        "ogerponcornerstone": "오거폰(주춧돌)",
                        "urshifu": "우라오스",
                        "urshifurapidstrike": "우라오스(연격)",
                        "urshifusinglestrike": "우라오스(일격)",
                        "tornadustherian": "토네로스(영물)",
                        "thundurustherian": "볼트로스(영물)",
                        "landorustherian": "랜드로스(영물)",
                        "enamorustherian": "러브로스(영물)",
                        "bloodmoon": "다투곰(블러드문)",
                        "ursalunabloodmoon": "다투곰(블러드문)",
                        "calyrexice": "백마렉스",
                        "calyrexshadow": "흑마렉스",
                        "zaciancrowned": "자시안(왕)",
                        "zamazentacrowned": "자마젠타(왕)",
                        "ogerpontealtera": "오거폰",
                        "terapagos": "테라파고스",
                        "terapagosstellar": "테라파고스(스텔라)",
                        "amoonguss": "뽀록나",
                        "corviknight": "아머까오"
                    };

                    const mergedPokemon = { ...data.pokemon, ...fallbackPokemon };

                    const reversePokemon: Record<string, string> = {};
                    const reverseMoves: Record<string, string> = {};
                    const reverseAbilities: Record<string, string> = {};
                    const reverseItems: Record<string, string> = {};
                    const reverseNatures: Record<string, string> = {};
                    const reverseTypes: Record<string, string> = {};

                    Object.entries(mergedPokemon).forEach(([k, v]) => { reversePokemon[v as string] = k; });
                    Object.entries(data.moves).forEach(([k, v]) => { reverseMoves[v as string] = k; });
                    Object.entries(data.abilities).forEach(([k, v]) => { reverseAbilities[v as string] = k; });
                    Object.entries(data.items).forEach(([k, v]) => { reverseItems[v as string] = k; });
                    Object.entries(data.natures).forEach(([k, v]) => { reverseNatures[v as string] = k; });
                    Object.entries(data.types).forEach(([k, v]) => { reverseTypes[v as string] = k; });

                    const result = {
                        pokemon: mergedPokemon,
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
