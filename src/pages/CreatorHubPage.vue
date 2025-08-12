<template>
  <q-page class="bg-grey-10 flex justify-center">
    <q-card
      class="q-pa-lg q-mt-md q-mb-md bg-grey-9 shadow-4"
      style="max-width: 1200px; width: 100%"
    >
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h5">Creator Hub</div>
        <ThemeToggle />
      </div>
      <div v-if="!loggedIn" class="q-mt-lg q-mb-lg">
        <q-btn color="primary" class="full-width q-mb-md" @click="loginNip07"
          >Login with Browser Signer</q-btn
        >
        <q-input
          v-model="nsec"
          type="password"
          label="nsec"
          outlined
          dense
          class="q-mb-sm"
        />
        <div class="text-negative text-caption q-mb-sm">
          Keep your nsec secret – it never leaves your browser.
        </div>
        <q-btn color="primary" outline class="full-width" @click="loginNsec"
          >Login with nsec</q-btn
        >
      </div>
      <div v-else>
        <div class="text-center q-mb-md">
          Logged in as <span class="text-primary">{{ npub }}</span>
          <q-btn
            flat
            dense
            color="primary"
            class="q-ml-sm"
            to="/creator-subscribers"
          >
            Subscribers
          </q-btn>
          <q-btn flat dense color="primary" class="q-ml-sm" @click="logout"
            >Logout</q-btn
          >
        </div>
        <q-splitter v-if="!isMobile" v-model="splitterModel">
          <template #before>
            <q-card class="section-card">
              <CreatorProfileForm />
            </q-card>
          </template>
          <template #after>
            <q-card class="section-card">
              <div>
                <div class="text-h6 q-mb-md">Subscription Tiers</div>
                <Draggable
                  v-model="draggableTiers"
                  item-key="id"
                  handle=".drag-handle"
                  @end="updateOrder"
                >
                  <template #item="{ element }">
                    <div class="q-mb-md">
                      <TierItem
                        :tier-data="element"
                        @edit="editTier(element.id)"
                        @delete="confirmDelete(element.id)"
                      />
                    </div>
                  </template>
                </Draggable>
                <div class="text-center q-mt-md">
                  <q-btn color="primary" flat @click="addTier">Add Tier</q-btn>
                </div>
              </div>
            </q-card>
          </template>
        </q-splitter>
        <div v-else>
          <q-tabs v-model="tab" no-caps align="justify" class="q-mb-md">
            <q-tab name="profile" label="Profile" />
            <q-tab name="tiers" label="Subscription Tiers" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="profile">
              <q-card class="section-card">
                <CreatorProfileForm />
              </q-card>
            </q-tab-panel>
            <q-tab-panel name="tiers">
              <q-card class="section-card">
                <div>
                  <div class="text-h6 q-mb-md">Subscription Tiers</div>
                  <Draggable
                    v-model="draggableTiers"
                    item-key="id"
                    handle=".drag-handle"
                    @end="updateOrder"
                  >
                    <template #item="{ element }">
                      <div class="q-mb-md">
                        <TierItem
                          :tier-data="element"
                          @edit="editTier(element.id)"
                          @delete="confirmDelete(element.id)"
                        />
                      </div>
                    </template>
                  </Draggable>
                  <div class="text-center q-mt-md">
                    <q-btn color="primary" flat @click="addTier"
                      >Add Tier</q-btn
                    >
                  </div>
                </div>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <DeleteModal v-model="deleteDialog" @confirm="performDelete" />
        <AddTierDialog
          v-model="showTierDialog"
          :tier="currentTier"
          @save="refreshTiers"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import Draggable from "vuedraggable";

import { useCreatorHub } from "src/composables/useCreatorHub";
import CreatorProfileForm from "components/CreatorProfileForm.vue";
import TierItem from "components/TierItem.vue";
import AddTierDialog from "components/AddTierDialog.vue";
import DeleteModal from "components/DeleteModal.vue";
import ThemeToggle from "components/ThemeToggle.vue";

const {
  nsec,
  isMobile,
  splitterModel,
  tab,
  loggedIn,
  draggableTiers,
  deleteDialog,
  deleteId,
  showTierDialog,
  currentTier,
  npub,
  loginNip07,
  loginNsec,
  logout,
  publishFullProfile,
  addTier,
  editTier,
  confirmDelete,
  updateOrder,
  refreshTiers,
  performDelete,
} = useCreatorHub();
</script>

<style lang="scss" src="../css/creator-hub.scss" scoped></style>
