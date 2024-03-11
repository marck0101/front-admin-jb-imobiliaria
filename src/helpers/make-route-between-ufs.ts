const BORDERS = {
  AC: ['AM', 'RO'],
  AL: ['PE', 'SE'],
  AM: ['AC', 'AP', 'MT', 'PA', 'RO', 'RR', 'TO'],
  AP: ['AM', 'PA'],
  BA: ['AL', 'ES', 'GO', 'MG', 'PI', 'SE', 'TO'],
  CE: ['PB', 'PE', 'PI', 'RN'],
  DF: ['GO'],
  ES: ['BA', 'MG', 'RJ'],
  GO: ['BA', 'DF', 'MG', 'MS', 'MT', 'TO'],
  MA: ['PA', 'PI', 'TO'],
  MG: ['BA', 'DF', 'ES', 'GO', 'MS', 'RJ', 'SP'],
  MS: ['GO', 'MG', 'MT', 'PR', 'SP'],
  MT: ['AM', 'GO', 'MS', 'PA', 'RO', 'TO'],
  PA: ['AM', 'AP', 'MA', 'MT', 'TO'],
  PB: ['CE', 'PE', 'RN'],
  PE: ['AL', 'CE', 'PB'],
  PI: ['BA', 'CE', 'MA', 'TO'],
  PR: ['SC', 'SP', 'MS'],
  RJ: ['ES', 'MG', 'SP'],
  RN: ['CE', 'PB'],
  RO: ['AC', 'AM', 'MT'],
  RR: ['AM'],
  RS: ['SC'],
  SC: ['PR', 'RS'],
  SE: ['AL', 'BA'],
  SP: ['MG', 'PR', 'RJ'],
  TO: ['AM', 'GO', 'MA', 'MT', 'PA', 'PI'],
} as const;

export const makeRouteBetweenUFs = (
  uf: keyof typeof BORDERS,
  to: keyof typeof BORDERS,
  route: Array<keyof typeof BORDERS> = [],
): undefined | Array<keyof typeof BORDERS> => {
  if (uf == to) return [uf];

  if (!BORDERS[uf]) throw new Error();
  const borders = BORDERS[uf];

  if (borders.includes(to)) {
    return [...route, uf, to];
  }

  for (const border of borders) {
    if (!route.includes(border)) {
      const newPath = makeRouteBetweenUFs(border, to, [...route, uf]);
      if (newPath) {
        return newPath;
      }
    }
  }

  return undefined;
};
