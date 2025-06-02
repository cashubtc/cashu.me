<template>
  <div :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'q-pa-md flex flex-center']">
    <q-card class="q-pa-md" style="max-width:400px; width:100%">
      <q-card-section class="text-h6">{{ $t('CreatorHub.login.title') }}</q-card-section>
      <q-card-actions vertical>
        <q-btn color="primary" @click="loginNip07">{{ $t('CreatorHub.login.nip07') }}</q-btn>
        <q-input v-model="nsec" type="password" :label="$t('CreatorHub.login.nsec')" class="q-mt-md" />
        <div class="text-negative text-caption q-mt-sm">{{ $t('CreatorHub.login.nsec_warning') }}</div>
        <q-btn color="primary" flat @click="loginNsec" class="q-mt-md">{{ $t('CreatorHub.login.nsec_button') }}</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useCreatorHubStore } from 'stores/creatorHub';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CreatorLoginPage',
  setup() {
    const store = useCreatorHubStore();
    const router = useRouter();
    const nsec = ref('');
    const loginNip07 = async () => {
      await store.loginWithNip07();
      if (store.loggedInNpub) {
        router.push('/creator/dashboard');
      }
    };
    const loginNsec = async () => {
      if (!nsec.value) return;
      await store.loginWithNsec(nsec.value);
      if (store.loggedInNpub) {
        router.push('/creator/dashboard');
      }
    };
    return { nsec, loginNip07, loginNsec };
  }
});
</script>
