import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import {
  Piece,
  PromotionPieceOption,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { useRecoilState } from "recoil";
import gameState from "../../store/atom/gameState";

export default function Board() {
  // console.log("board");
  const [gameSt, setGameSt] = useRecoilState(gameState);
  const [game] = useState(new Chess());
  const [optionSquares, setOptionSquares] = useState({});
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState<Square>();
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [moveTo, setMoveTo] = useState<Square>();
  const [showPromotionDialog, setShowPromotionDialog] =
    useState<boolean>(false);
  const chessBoardRef = useRef(null);
  const [isDrag, setIsDrag] = useState(false);

  useEffect(() => {
    game.load(
      gameSt.position[gameSt.position.length - 1]
        ? gameSt.position[gameSt.position.length - 1]
        : game.fen(),
    );
    setGamePosition(gameSt.position[gameSt.position.length - 1]);
  }, [gameSt]);

  // console.log("board");
  // console.log(game.move);
  // console.log(game.moves);
  // console.log(game.ascii);

  const getMoveOptions = (square: Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });

    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };

    setOptionSquares(newSquares);
    return true;
  };

  const onPieceDragBegin = (piece: Piece, square: Square) => {
    getMoveOptions(square);
    setIsDrag(true);
  };

  const onPieceDrop = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => {
    // move logic here to pass

    // console.log(sourceSquare,targetSquare,piece);
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      // console.log(move);
      // console.log(game.ascii());

      // illegal move
      if (move === null) return false;

      console.log(move);
      setGameSt((gameSt) => ({
        position: [...gameSt.position, game.fen()],
        moves: [...gameSt.moves, move],
        player: gameSt.player,
      }));
      setGamePosition(game.fen());
      setOptionSquares({});
      setIsDrag(false);

      // exit if the game is over
      if (game.isGameOver() || game.isDraw()) return false;

      // setGame({...game});
      // setGame(game);
      return true;
    } catch (e) {
      console.error();
      setOptionSquares({});
      return false;
    }
  };

  const onSquareClick = (square: Square) => {
    setIsDrag(false);
    setRightClickedSquares({});

    // from square
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
      return;
    }

    // to square
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square,
      );
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : undefined);
        return;
      }

      // valid move

      setMoveTo(square);

      // if promotion move
      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }

      // is normal move
      // const gameCopy = { ...game };
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      //move logic here to pass

      // console.log(moveFrom,square);
      // console.log("turn")
      // setGame(game);
      setGameSt((gameSt) => ({
        position: [...gameSt.position, game.fen()],
        moves: [...gameSt.moves, move],
        player: gameSt.player,
      }));
      setGamePosition(game.fen());
      setMoveFrom(undefined);
      setMoveTo(undefined);
      setOptionSquares({});
      return;
    }
  };

  function onPromotionPieceSelect(piece?: PromotionPieceOption) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      const move = game.move({
        from: moveFrom ? moveFrom : "",
        to: moveTo ? moveTo : "",
        promotion: piece[1].toLowerCase() ?? "q",
      });
      if (move) {
        setGameSt((gameSt) => ({
          position: [...gameSt.position, game.fen()],
          moves: [...gameSt.moves, move],
          player: gameSt.player,
        }));
      }
      setGamePosition(game.fen());
    }

    setMoveFrom(undefined);
    setMoveTo(undefined);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  return (
    <div style={{ width: "800px" }}>
      <Chessboard
        position={gamePosition}
        arePiecesDraggable={game.turn() === gameSt.player}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onPieceDrop}
        onSquareClick={game.turn() == gameSt.player ? onSquareClick : undefined}
        onPromotionPieceSelect={!isDrag ? onPromotionPieceSelect : undefined}
        onSquareRightClick={onSquareRightClick}
        arePremovesAllowed={true}
        showPromotionDialog={!isDrag ? showPromotionDialog : undefined}
        promotionToSquare={!isDrag ? moveTo : undefined}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        allowDragOutsideBoard={false}
        ref={chessBoardRef}
      />
    </div>
  );
}

