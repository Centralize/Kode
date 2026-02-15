import Store from 'electron-store';

const store = new Store({
  defaults: {
    entries: [],
    vaults: ['Default'],
    masterHash: null,
  },
});

export function getEntries() {
  return store.get('entries');
}

export function setEntries(entries) {
  store.set('entries', entries);
}

export function getVaults() {
  return store.get('vaults');
}

export function setVaults(vaults) {
  store.set('vaults', vaults);
}

export function getMasterHash() {
  return store.get('masterHash');
}

export function setMasterHash(hash) {
  store.set('masterHash', hash);
}
