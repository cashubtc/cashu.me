#!/usr/bin/env node
import 'fake-indexeddb/auto';
import { createPinia, setActivePinia } from 'pinia';
import { fetchNutzapProfile, useNostrStore } from '../src/stores/nostr';
import { useSettingsStore } from '../src/stores/settings';

async function main() {
  const npub = process.argv[2];
  if (!npub) {
    console.error('Usage: verifyNutzapProfile <npub>');
    process.exit(1);
  }

  setActivePinia(createPinia());
  useSettingsStore();
  const nostr = useNostrStore();
  await nostr.initNdkReadOnly();

  const profile = await fetchNutzapProfile(npub);
  console.log(JSON.stringify(profile, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
