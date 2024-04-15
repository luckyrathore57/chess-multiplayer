import { useRecoilState, useRecoilValue } from "recoil";
import Board from "../components/chessboard/Board";
import gameState from "../store/atom/gameState";

export default function TwoPlayerGame(){
    // const [game,setGame]=useRecoilState(gameState);
    // console.log(game.ascii());
    let game=useRecoilValue(gameState);
    console.clear();
    console.log(game);
    
    
    return (
        <Board/>
    )
}