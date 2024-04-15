import { useState } from "react";
import Board from "./components/chessboard/Board";
import { Chess } from "chess.js";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import TwoPlayerGame from "./pages/TwoPlayerGame";


export default function App(){

const router = createBrowserRouter([
  {
    path: "/",
    element:<TwoPlayerGame/>,
  },
]);

  const [move,setMove]=useState();
  const [game,setGame]=useState(new Chess());
  return (
  <RecoilRoot>
      <RouterProvider router={router} />
  </RecoilRoot>
  )

}