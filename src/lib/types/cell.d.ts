type CellType = "python" | "markdown";

interface CellData {
  id: string;
  type: CellType;
  content: string;
}

export type { CellType, CellData }