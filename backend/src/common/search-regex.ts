// Cada letra se reemplaza por un grupo con sus variantes con tilde,
// así "camion" encuentra "camión" y "camión" encuentra "camion".
const ACCENT_GROUPS: Record<string, string> = {
  a: '[aáàäâ]',
  e: '[eéèëê]',
  i: '[iíìïî]',
  o: '[oóòöô]',
  u: '[uúùüû]',
  n: '[nñ]',
};

export function buildSearchRegex(text: string): RegExp {
  const plain = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quita las tildes que escribió el usuario (y la ñ pasa a n)
  const escaped = plain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/[aeioun]/gi, (letter) => ACCENT_GROUPS[letter.toLowerCase()]);
  return new RegExp(pattern, 'i');
}
