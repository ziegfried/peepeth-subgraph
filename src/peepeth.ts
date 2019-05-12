import { Peepeth } from '../generated/schema';

export function getGlobalStats(): Peepeth {
  let global = 'global';
  let peepeth = Peepeth.load(global);
  if (peepeth === null) {
    peepeth = new Peepeth(global);
    peepeth.numberOfAccounts = 0;
    peepeth.numberOfPeeps = 0;
  }
  return peepeth!;
}
