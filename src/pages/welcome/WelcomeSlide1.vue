<!-- src/components/WelcomeSlide1.vue -->
<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <transition appear enter-active-class="animated bounce">
        <img
          src="/clean.png"
          alt="Clean Icon"
          class="q-my-lg"
          style="width: 80px; height: 80px"
        />
      </transition>
      <h2 class="q-mt-md">{{ $t("WelcomeSlide1.title") }}</h2>
      <div class="text-left">
        <p class="q-mt-sm">{{ $t("WelcomeSlide1.text") }}</p>
        <div class="q-mt-lg">
          <p>{{ $t("WelcomeSlide1.features.title") }}</p>
          <ul class="q-pl-md">
            <li>
              <router-link to="/creator-hub">
                {{ $t("WelcomeSlide1.features.creatorHub") }}
              </router-link>
              -
              {{ $t("WelcomeSlide1.features.creatorHubDesc") }}
            </li>
            <li>
              <router-link to="/subscriptions">
                {{ $t("WelcomeSlide1.features.subscriptions") }}
              </router-link>
              -
              {{ $t("WelcomeSlide1.features.subscriptionsDesc") }}
            </li>
          </ul>
        </div>
        <q-expansion-item
          dense
          dense-toggle
          class="text-left q-mt-lg"
          :label="$t('WelcomeSlide1.actions.more.label')"
        >
          <i18n-t keypath="WelcomeSlide1.p1.text" tag="p" class="q-mt-md">
            <template v-slot:link>
              <a href="https://cashu.space" target="_blank">{{
                $t("WelcomeSlide1.p1.link.text")
              }}</a>
            </template>
          </i18n-t>
          <i18n-t keypath="WelcomeSlide1.p2.text" tag="p" class="q-mt-md" />
          <i18n-t keypath="WelcomeSlide1.p3.text" tag="p" class="q-mt-md" />
          <i18n-t keypath="WelcomeSlide1.p4.text" tag="p" class="q-mt-md" />
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WelcomeSlide1",
};
</script>

<style scoped>
h2 {
  font-weight: bold;
}
p {
  font-size: large;
}
</style>
