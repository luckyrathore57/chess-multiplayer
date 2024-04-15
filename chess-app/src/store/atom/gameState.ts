import {  Color, Move } from "chess.js";
import { atom } from "recoil";

interface GameState{
    position:string[],
    moves:Move[],
    player:Color
}

const gameState = atom<GameState>({
    key: 'gameState', // unique ID (with respect to other atoms/selectors)
    default: 
    {position:[],
        moves:[],
        player:"w"
    }, // default value (aka initial value)
});

export default gameState;