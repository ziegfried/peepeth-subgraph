import { Peepeth } from '../generated/schema';

/**
 * Retrieves the singleton Peepeth instance containing some global stats.
 * If it doesn't exist is initializes it with some seed values.
 */
export function getGlobalStats(): Peepeth {
  let global = 'global';
  let peepeth = Peepeth.load(global);
  if (peepeth === null) {
    peepeth = new Peepeth(global);
    peepeth.numberOfAccounts = 0;
    peepeth.numberOfPeeps = 0;
    peepeth.numberOfPeepsNotFound = 0;
  }
  return peepeth!;
}
