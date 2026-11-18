/// <reference lib="webworker" />
import { chooseMove } from './engine';

/** 수 계산은 브라우저 백그라운드 스레드에서 한다. 계산하는 동안에도 화면이 멈추지 않는다 */
self.onmessage = (event: MessageEvent<{ id: number; fen: string }>) => {
  const { id, fen } = event.data;
  self.postMessage({ id, move: chooseMove(fen) });
};
