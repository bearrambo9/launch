export type TreeItem = {
  name: string;
  isDir: boolean;
  path: string;
  children?: TreeItem[];
};

export type Draft = {
  parentPath: string | null;
  isDir: boolean;
};
