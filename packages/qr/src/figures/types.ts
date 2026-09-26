export interface FigureBox {
  x: number;
  y: number;
  size: number;
}

export interface DotFigureArgs extends FigureBox {
  neighbor: (dx: number, dy: number) => boolean;
  random: () => number;
}

export interface FinderFigureArgs extends FigureBox {
  rotation: number;
}

export type DotFigure = (args: DotFigureArgs) => string;

export type FinderFigure = (args: FinderFigureArgs) => string;
