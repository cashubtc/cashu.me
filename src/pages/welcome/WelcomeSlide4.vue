<!-- src/components/WelcomeSlide4.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center" style="max-width: 600px; width: 100%">
      <q-icon name="gavel" size="4em" color="primary" class="q-mb-md" />
      <h2 class="text-center">Terms and Conditions</h2>
      <div
        class="text-left q-mt-sm"
        style="
          max-height: 300px;
          max-width: 90%;
          overflow-y: auto;
          margin: 0 auto;
        "
      >
        <p>
          <!-- Filler text to simulate EULA -->
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          scelerisque aliquam odio et faucibus. Nulla rhoncus feugiat eros quis
          consectetur. Morbi neque ex, condimentum dapibus congue et, vulputate
          ut ligula. Vestibulum sit amet urna turpis. Praesent sit amet
          tristique urna. Nulla facilisi. Pellentesque et mi orci. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac
          turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus
          et ultrices posuere cubilia curae; Nulla facilisi. Donec aliquet,
          tortor nec commodo ultricies, lacus quam interdum libero, et
          pellentesque felis lorem nec dui. Nulla facilisi. Duis aliquet egestas
          purus in blandit. Curabitur vulputate, ligula lacinia scelerisque
          tempor, lacus lacus ornare ante, ac egestas est urna sit amet arcu.
        </p>
        <p>
          <!-- Filler text to simulate EULA -->
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          scelerisque aliquam odio et faucibus. Nulla rhoncus feugiat eros quis
          consectetur. Morbi neque ex, condimentum dapibus congue et, vulputate
          ut ligula. Vestibulum sit amet urna turpis. Praesent sit amet
          tristique urna. Nulla facilisi. Pellentesque et mi orci. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac
          turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus
          et ultrices posuere cubilia curae; Nulla facilisi. Donec aliquet,
          tortor nec commodo ultricies, lacus quam interdum libero, et
          pellentesque felis lorem nec dui. Nulla facilisi. Duis aliquet egestas
          purus in blandit. Curabitur vulputate, ligula lacinia scelerisque
          tempor, lacus lacus ornare ante, ac egestas est urna sit amet arcu.
        </p>
        <p>
          <!-- Filler text to simulate EULA -->
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          scelerisque aliquam odio et faucibus. Nulla rhoncus feugiat eros quis
          consectetur. Morbi neque ex, condimentum dapibus congue et, vulputate
          ut ligula. Vestibulum sit amet urna turpis. Praesent sit amet
          tristique urna. Nulla facilisi. Pellentesque et mi orci. Pellentesque
          habitant morbi tristique senectus et netus et malesuada fames ac
          turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus
          et ultrices posuere cubilia curae; Nulla facilisi. Donec aliquet,
          tortor nec commodo ultricies, lacus quam interdum libero, et
          pellentesque felis lorem nec dui. Nulla facilisi. Duis aliquet egestas
          purus in blandit. Curabitur vulputate, ligula lacinia scelerisque
          tempor, lacus lacus ornare ante, ac egestas est urna sit amet arcu.
        </p>
        <!-- Repeat or add more paragraphs as needed -->
      </div>
      <q-checkbox
        v-model="welcomeStore.termsAccepted"
        label="I agree to the Terms and Conditions"
        class="q-mt-md"
      />
      <q-btn
        flat
        label="Accept and Continue"
        color="primary"
        class="full-width q-mt-sm"
        :disable="!welcomeStore.termsAccepted"
        @click="acceptTerms"
      />
    </div>
  </div>
</template>

<script>
import { useWelcomeStore } from "src/stores/welcome";
import { useQuasar } from "quasar";

export default {
  name: "WelcomeSlide4",
  setup() {
    const welcomeStore = useWelcomeStore();
    const $q = useQuasar();

    const acceptTerms = () => {
      welcomeStore.acceptTerms();
      welcomeStore.closeWelcome();
    };

    return {
      welcomeStore,
      acceptTerms,
    };
  },
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
</style>
