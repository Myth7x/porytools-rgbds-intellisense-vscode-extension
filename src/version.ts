export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (version: string) => version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/)?.slice(1, 4).map(Number);
  const left = parse(latest);
  const right = parse(current);
  if (!left || !right) return false;

  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index];
  }
  return false;
}
