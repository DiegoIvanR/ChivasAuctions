import { jerseys } from "./jerseys.js";

export const matches = {
    america_15_05_2025: {
        id: 1,
        date: "15-05-2025",
        team: "America",
        local: true,
        league: "Liga MX",
        season: "25/25",
        active: true,
        jerseys: [jerseys.javier_hernandez_15_05_2025, 
            jerseys.mateo_chavez_15_05_2025,
            jerseys.fernando_gonzalez_15_05_2025,
            jerseys.fernando_beltran_15_05_2025,
            jerseys.roberto_alvarado_15_05_2025]
    },
    pumas_16_05_2025: {
        id: 2,
        date: "16-05-2025",
        team: "Pumas",
        local: false,
        league: "Liguilla",
        season: "25/26",
        active: true,
        jerseys: []
    },
    rayados_17_05_2025: {
        id: 3,
        date: "17-05-2025",
        team: "Rayados",
        local: true,
        league: "Liga MX",
        season: "25/27",
        active: true,
        jerseys: []
    },
}
