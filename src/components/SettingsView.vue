<template>
  <div style="max-width: 800px; margin: 0 auto">
    <!-- BACKUP & RESTORE SECTION -->
    <div class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.backup_restore") }}
      </div>
      <div class="divider-line"></div>
    </div>

    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.backup_restore.backup_seed.title")
            }}</q-item-label>
            <q-item-label caption
              >{{ $t("Settings.backup_restore.backup_seed.description") }}
            </q-item-label>
            <div class="row q-pt-md">
              <div class="col-12">
                <q-input
                  outlined
                  readonly
                  v-model="hiddenMnemonic"
                  :label="
                    $t('Settings.backup_restore.backup_seed.seed_phrase_label')
                  "
                  class="seed-phrase"
                  autogrow
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="visibility"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="toggleMnemonicVisibility"
                      aria-label="Toggle visibility"
                      title="Toggle visibility"
                    ></q-btn>
                    <q-btn
                      flat
                      dense
                      icon="content_copy"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="copy(mnemonic)"
                      :aria-label="$t('global.actions.copy.label')"
                      :title="$t('global.actions.copy.label')"
                    ></q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- restore -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.backup_restore.restore_ecash.title")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Settings.backup_restore.restore_ecash.description") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            size="sm"
            rounded
            outline
            to="/restore"
            >{{ $t("Settings.backup_restore.restore_ecash.button") }}</q-btn
          >
        </q-item>
      </q-list>
    </div>

    <!-- LIGHTNING ADDRESS SECTION -->
    <div class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.lightning_address") }}
      </div>
      <div class="divider-line"></div>
    </div>
    <!-- nostr -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.lightning_address.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.lightning_address.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-px-md">
          <q-item-section class="q-mx-none q-pl-none">
            <!-- toggle to turn Lightning address on and off in new row -->
            <div class="row q-pt-md">
              <q-toggle v-model="npcEnabled" color="primary" />
              <q-item-section>
                <q-item-label title>{{
                  $t("Settings.lightning_address.enable.toggle")
                }}</q-item-label>
                <q-item-label caption>
                  {{ $t("Settings.lightning_address.enable.description") }}
                </q-item-label>
              </q-item-section>
            </div>
          </q-item-section>
        </q-item>
        <div v-if="npcEnabled" class="q-px-xs">
          <q-item v-if="npcEnabled">
            <div class="row">
              <div class="col-12">
                <q-input outlined v-model="npcAddress" dense rounded readonly>
                  <template v-slot:append>
                    <q-spinner-hourglass size="sm" v-if="npcLoading" />
                    <q-icon
                      name="content_copy"
                      @click="copy(npcAddress)"
                      size="xs"
                      color="grey"
                      class="q-mr-sm cursor-pointer"
                      :aria-label="
                        $t('Settings.lightning_address.address.copy_tooltip')
                      "
                      :title="
                        $t('Settings.lightning_address.address.copy_tooltip')
                      "
                    >
                      <q-tooltip>{{
                        $t("Settings.lightning_address.address.copy_tooltip")
                      }}</q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="row q-pt-md">
                <q-toggle v-model="automaticClaim" color="primary" />
                <q-item-section>
                  <q-item-label title>{{
                    $t("Settings.lightning_address.automatic_claim.toggle")
                  }}</q-item-label>
                  <q-item-label caption
                    >{{
                      $t(
                        "Settings.lightning_address.automatic_claim.description"
                      )
                    }}
                  </q-item-label>
                </q-item-section>
              </div>
            </div>
          </q-item>

          <!-- NOSTR KEYS SECTION -->
          <div class="section-divider q-my-md">
            <div class="divider-line"></div>
            <div class="divider-text">
              {{ $t("Settings.sections.nostr_keys") }}
            </div>
            <div class="divider-line"></div>
          </div>

          <q-item>
            <q-item-section>
              <q-item-label overline>{{
                $t("Settings.nostr_keys.title")
              }}</q-item-label>
              <q-item-label caption>{{
                $t("Settings.nostr_keys.description")
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <!-- initWalletSeedPrivateKeySigner -->
          <q-item
            :active="signerType === 'SEED'"
            active-class="text-weight-bold text-primary"
            clickable
          >
            <q-item-section avatar>
              <q-icon
                :color="signerType === 'SEED' ? 'primary' : 'grey'"
                :name="
                  signerType === 'SEED'
                    ? 'check_circle'
                    : 'radio_button_unchecked'
                "
                @click="handleSeedClick"
                class="cursor-pointer"
              />
            </q-item-section>
            <q-item-section
              lines="1"
              class="cursor-pointer"
              style="word-break: break-word"
            >
              <q-item-label title>{{
                $t("Settings.nostr_keys.wallet_seed.title")
              }}</q-item-label>
              <q-item-label caption
                >{{ $t("Settings.nostr_keys.wallet_seed.description") }}
              </q-item-label>
              <q-item-label
                caption
                v-if="signerType === 'SEED' && seedSignerPrivateKeyNsecComputed"
              >
                <q-badge
                  class="cursor-pointer q-mt-xs"
                  @click="copy(seedSignerPrivateKeyNsecComputed)"
                  outline
                  color="grey"
                >
                  <q-icon
                    name="content_copy"
                    size="0.8em"
                    color="grey"
                    class="q-mr-xs"
                  ></q-icon
                  >{{ $t("Settings.nostr_keys.wallet_seed.copy_nsec") }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
          <!-- Nip46Signer -->
          <q-item
            :active="signerType === 'NIP46'"
            active-class="text-weight-bold text-primary"
            clickable
            v-if="false"
          >
            <q-item-section avatar>
              <q-icon
                :color="signerType === 'NIP46' ? 'primary' : 'grey'"
                :name="
                  signerType === 'NIP46'
                    ? 'check_circle'
                    : 'radio_button_unchecked'
                "
                @click="handleBunkerClick"
                class="cursor-pointer"
              />
            </q-item-section>
            <q-item-section
              lines="1"
              class="cursor-pointer"
              style="word-break: break-word"
            >
              <q-item-label title>{{
                $t("Settings.nostr_keys.nsec_bunker.title")
              }}</q-item-label>
              <q-item-label caption
                >{{ $t("Settings.nostr_keys.nsec_bunker.description") }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="signerType === 'NIP46'">
              <q-icon
                name="delete_outline"
                @click="handleResetNip46Signer"
                class="cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_keys.nsec_bunker.delete_tooltip")
                }}</q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
          <q-item
            :active="signerType === 'PRIVATEKEY'"
            active-class="text-weight-bold text-primary"
            clickable
          >
            <q-item-section avatar>
              <q-icon
                :color="signerType === 'PRIVATEKEY' ? 'primary' : 'grey'"
                :name="
                  signerType === 'PRIVATEKEY'
                    ? 'check_circle'
                    : 'radio_button_unchecked'
                "
                @click="handleNsecClick"
                class="cursor-pointer"
              />
            </q-item-section>
            <q-item-section
              lines="1"
              class="cursor-pointer"
              style="word-break: break-word"
            >
              <q-item-label title>{{
                $t("Settings.nostr_keys.use_nsec.title")
              }}</q-item-label>
              <q-item-label caption
                >{{ $t("Settings.nostr_keys.use_nsec.description") }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="signerType === 'PRIVATEKEY'">
              <q-icon
                name="delete_outline"
                @click="handleResetPrivateKeySigner"
                class="cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_keys.use_nsec.delete_tooltip")
                }}</q-tooltip></q-icon
              >
            </q-item-section>
          </q-item>
          <!-- Nip07Signer -->
          <q-item
            :active="signerType === 'NIP07'"
            active-class="text-weight-bold text-primary"
            clickable
            v-if="nip07SignerAvailable"
          >
            <q-item-section avatar>
              <q-icon
                :color="signerType === 'NIP07' ? 'primary' : 'grey'"
                :name="
                  signerType === 'NIP07'
                    ? 'check_circle'
                    : 'radio_button_unchecked'
                "
                @click="handleExtensionClick"
                class="cursor-pointer"
              />
            </q-item-section>
            <q-item-section
              lines="1"
              class="cursor-pointer"
              style="word-break: break-word"
            >
              <q-item-label title>{{
                $t("Settings.nostr_keys.signing_extension.title")
              }}</q-item-label>
              <q-item-label caption v-if="nip07SignerAvailable"
                >{{ $t("Settings.nostr_keys.signing_extension.description") }}
              </q-item-label>
              <q-item-label caption v-else
                >{{ $t("Settings.nostr_keys.signing_extension.not_found") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </div>

    <!-- NOSTR RELAYS SECTION -->
    <div class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.nostr_relays") }}
      </div>
      <div class="divider-line"></div>
    </div>

    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-expansion-item
          dense
          dense-toggle
          class="text-left"
          :label="$t('Settings.nostr_relays.expand_label')"
        >
          <q-item>
            <q-item-section>
              <q-item-label overline>{{
                $t("Settings.nostr_relays.add.title")
              }}</q-item-label>
              <q-item-label caption>{{
                $t("Settings.nostr_relays.add.description")
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input
                outlined
                rounded
                dense
                v-model="newNostrRelay"
                :label="$t('Settings.nostr_relays.list.title')"
                append
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    icon="add"
                    color="primary"
                    @click="addNostrRelay"
                  ></q-btn>
                </template>
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label overline>{{
                $t("Settings.nostr_relays.list.title")
              }}</q-item-label>
              <q-item-label caption>{{
                $t("Settings.nostr_relays.list.description")
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-for="(relay, idx) in defaultNostrRelays"
            :key="relay"
            clickable
          >
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.2em"
            >
              <q-icon
                name="content_copy"
                @click="copy(relay)"
                size="xs"
                color="grey"
                class="q-mr-sm cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_relays.list.copy_tooltip")
                }}</q-tooltip></q-icon
              >
            </q-item-section>
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="delete_outline"
                @click="removeNostrRelay(relay)"
                size="1.3em"
                color="grey"
                class="q-mr-sm cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_relays.list.remove_tooltip")
                }}</q-tooltip></q-icon
              >
            </q-item-section>
            <q-item-section style="max-width: 10rem" class="cursor-pointer">
              <q-input
                dense
                outlined
                rounded
                :model-value="relay"
                @update:model-value="updateNostrRelay(idx, $event)"
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- PAYMENT REQUESTS SECTION -->
    <div class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.payment_requests") }}
      </div>
      <div class="divider-line"></div>
    </div>

    <!-- payment requests -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-item class="q-pt-lg">
        <q-item-section>
          <q-item-label overline class="text-weight-bold">{{
            $t("Settings.payment_requests.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.payment_requests.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-toggle
          v-model="enablePaymentRequest"
          :label="$t('Settings.payment_requests.enable_toggle')"
          color="primary"
        />
      </q-item>
    </div>
    <div v-if="enablePaymentRequest" class="q-pb-sm q-px-xs text-left" on-left>
      <q-item>
        <q-toggle
          v-model="receivePaymentRequestsAutomatically"
          color="primary"
        />
        <q-item-section>
          <q-item-label title>{{
            $t("Settings.payment_requests.claim_automatically.toggle")
          }}</q-item-label>
          <q-item-label caption
            >{{
              $t("Settings.payment_requests.claim_automatically.description")
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>

    <!-- NOSTR WALLET CONNECT SECTION -->
    <div class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.nostr_wallet_connect") }}
      </div>
      <div class="divider-line"></div>
    </div>

    <!-- ln address -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <!-- NWC -->

        <q-item class="q-pt-lg">
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.nostr_wallet_connect.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.nostr_wallet_connect.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <!-- use a q-toggle to turn nwc on and off -->
        <q-item>
          <q-toggle
            v-model="enableNwc"
            :label="$t('Settings.nostr_wallet_connect.enable_toggle')"
            color="primary"
          />
        </q-item>
        <!-- <q-item>
          <q-btn
            v-if="false"
            class="q-ml-sm q-px-md"
            color="primary"
            rounded
            outline
            @click="listenToNWCCommands()"
            >Link wallet</q-btn
          >
        </q-item> -->
        <q-item v-if="enableNwc">
          <q-item-section>
            <!-- <q-item-label overline>Connections</q-item-label> -->
            <q-item-label caption
              >{{ $t("Settings.nostr_wallet_connect.payments_note") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="enableNwc">
          <q-item
            v-for="connection in connections"
            :key="getConnectionString(connection)"
          >
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="content_copy"
                @click="copy(getConnectionString(connection))"
                size="xs"
                color="grey"
                class="q-mr-sm cursor-pointer"
                :aria-label="
                  $t('Settings.nostr_wallet_connect.connection.copy_tooltip')
                "
                :title="
                  $t('Settings.nostr_wallet_connect.connection.copy_tooltip')
                "
                ><q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.copy_tooltip")
                }}</q-tooltip></q-icon
              >
            </q-item-section>
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="qr_code"
                @click="showNWCEntry(connection)"
                size="1.3em"
                color="grey"
                class="q-mr-sm cursor-pointer"
                :aria-label="
                  $t('Settings.nostr_wallet_connect.connection.qr_tooltip')
                "
                :title="
                  $t('Settings.nostr_wallet_connect.connection.qr_tooltip')
                "
              >
                <q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.qr_tooltip")
                }}</q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section style="max-width: 10rem">
              <!-- <q-item-label
                caption
                clickable
                style="word-break: break-word"
                @click="showNWCEntry(connection.connectionString)"
                >********************</q-item-label
              > -->
              <!-- input for allowanceleft -->
              <q-input
                type="number"
                outlined
                rounded
                dense
                v-model="connection.allowanceLeft"
                :label="
                  $t('Settings.nostr_wallet_connect.connection.allowance_label')
                "
              >
              </q-input>
            </q-item-section>
          </q-item>

          <q-expansion-item
            dense
            dense-toggle
            class="text-left"
            :label="$t('Settings.nostr_wallet_connect.relays.expand_label')"
          >
            <q-item>
              <q-item-section>
                <q-item-label overline>{{
                  $t("Settings.nostr_wallet_connect.relays.add.title")
                }}</q-item-label>
                <q-item-label caption
                  >{{
                    $t("Settings.nostr_wallet_connect.relays.add.description")
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-input
                  outlined
                  rounded
                  dense
                  v-model="newRelay"
                  :label="$t('Settings.nostr_wallet_connect.relays.list.title')"
                  append
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="add"
                      color="primary"
                      @click="addRelay"
                    ></q-btn>
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>{{
                  $t("Settings.nostr_wallet_connect.relays.list.title")
                }}</q-item-label>
                <q-item-label caption
                  >{{
                    $t("Settings.nostr_wallet_connect.relays.list.description")
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-for="relay in relays" :key="relay" clickable>
              <q-item-section
                class="q-mx-none q-pl-none"
                style="max-width: 1.2em"
              >
                <q-icon
                  name="content_copy"
                  @click="copy(relay)"
                  size="xs"
                  color="grey"
                  class="q-mr-sm cursor-pointer"
                  ><q-tooltip>{{
                    $t("Settings.nostr_wallet_connect.relays.list.copy_tooltip")
                  }}</q-tooltip></q-icon
                >
              </q-item-section>
              <q-item-section
                class="q-mx-none q-pl-none"
                style="max-width: 1.5em"
              >
                <q-icon
                  name="delete_outline"
                  @click="removeRelay(relay)"
                  size="1.3em"
                  color="grey"
                  class="q-mr-sm cursor-pointer"
                  ><q-tooltip>{{
                    $t(
                      "Settings.nostr_wallet_connect.relays.list.remove_tooltip"
                    )
                  }}</q-tooltip></q-icon
                >
              </q-item-section>
              <q-item-section style="max-width: 10rem" class="cursor-pointer">
                <q-item-label caption>{{ relay }} </q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </div>
      </q-list>
    </div>

    <!-- HARDWARE FEATURES SECTION -->
    <div v-if="ndefSupported" class="section-divider q-my-md">
      <div class="divider-line"></div>
      <div class="divider-text">
        {{ $t("Settings.sections.hardware_features") }}
      </div>
      <div class="divider-line"></div>
    </div>

    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <!-- Web NFC -->
        <div v-if="ndefSupported" class="q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">{{
                  $t("Settings.hardware_features.webnfc.title")
                }}</q-item-label>
                <q-item-label caption>
                  {{ $t("Settings.hardware_features.webnfc.description") }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="nfcEncoding = 'text'">
              <q-item-section avatar>
                <q-icon
                  :color="nfcEncoding === 'text' ? 'primary' : 'grey'"
                  :name="
                    nfcEncoding === 'text'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section
                lines="1"
                class="cursor-pointer"
                style="word-break: break-word"
              >
                <q-item-label title>{{
                  $t("Settings.hardware_features.webnfc.text.title")
                }}</q-item-label>
                <q-item-label caption>
                  {{ $t("Settings.hardware_features.webnfc.text.description") }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="nfcEncoding = 'weburl'">
              <q-item-section avatar>
                <q-icon
                  :color="nfcEncoding === 'weburl' ? 'primary' : 'grey'"
                  :name="
                    nfcEncoding === 'weburl'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section
                lines="1"
                class="cursor-pointer"
                style="word-break: break-word"
              >
                <q-item-label title>{{
                  $t("Settings.hardware_features.webnfc.weburl.title")
                }}</q-item-label>
                <q-item-label caption>
                  {{
                    $t("Settings.hardware_features.webnfc.weburl.description")
                  }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <!--
              disable binary for now
              TODO: re-enable once we can decode
            -->
            <!--
            <q-item clickable @click="nfcEncoding = 'binary'">
              <q-item-section avatar>
                <q-icon
                  :color="nfcEncoding === 'binary' ? 'primary' : 'grey'"
                  :name="
                    nfcEncoding === 'binary'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  class="cursor-pointer"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label title>{{ $t("Settings.hardware_features.webnfc.binary.title") }}</q-item-label>
                <q-item-label caption>
                  {{ $t("Settings.hardware_features.webnfc.binary.description") }}
                </q-item-label>
              </q-item-section>
            </q-item>
            -->
            <q-item>
              <q-toggle
                v-model="showNfcButtonInDrawer"
                :label="
                  $t('Settings.hardware_features.webnfc.quick_access.toggle')
                "
                color="primary"
              /> </q-item
            ><q-item class="q-pt-none">
              <q-item-label caption
                >{{
                  $t(
                    "Settings.hardware_features.webnfc.quick_access.description"
                  )
                }}
              </q-item-label>
            </q-item>
          </q-list>
        </div>

        <!-- P2PK SECTION -->
        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("Settings.sections.p2pk_features") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- P2PK -->
        <div class="q-py-sm q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">{{
                  $t("Settings.p2pk_features.title")
                }}</q-item-label>
                <q-item-label caption>{{
                  $t("Settings.p2pk_features.description")
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item style="display: inline-block">
              <q-btn
                class="q-ml-sm q-px-md"
                color="primary"
                size="sm"
                rounded
                outline
                @click="createAndSelectNewKey"
                >{{ $t("Settings.p2pk_features.generate_button") }}</q-btn
              >
            </q-item>
            <q-item style="display: inline-block">
              <q-btn
                class="q-ml-sm q-px-md"
                color="primary"
                size="sm"
                rounded
                outline
                @click="importNsec"
                >{{ $t("Settings.p2pk_features.import_button") }}</q-btn
              >
            </q-item>
            <q-item style="display: inline-block">
              <q-btn
                color="primary"
                :disable="!p2pkStore.firstKey"
                @click="doPublish"
              >
                Publish Nutzap profile
              </q-btn>
            </q-item>
            <q-item>
              <q-toggle
                v-model="showP2PkButtonInDrawer"
                :label="$t('Settings.p2pk_features.quick_access.toggle')"
                color="primary"
              /> </q-item
            ><q-item class="q-pt-none">
              <q-item-label caption
                >{{ $t("Settings.p2pk_features.quick_access.description") }}
              </q-item-label>
              <q-item-label caption class="q-mt-xs">
                The button appears in Receive Ecash after you generate or import
                a key.
              </q-item-label>
            </q-item>
          </q-list>
          <q-item v-if="p2pkKeys.length">
            <q-expansion-item
              dense
              dense-toggle
              v-if="p2pkKeys.length"
              class="text-left"
              :label="
                $t('Settings.p2pk_features.keys_expansion.label', {
                  count: p2pkKeys.length,
                })
              "
            >
              <q-item v-for="key in p2pkKeys" :key="key.privakey">
                <q-item-section
                  class="q-mx-none q-pl-none"
                  style="max-width: 1.05em"
                >
                  <q-icon
                    name="content_copy"
                    @click="copy(key.publicKey)"
                    size="1.2em"
                    color="grey"
                    class="q-mr-xs cursor-pointer"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    caption
                    clickable
                    style="word-break: break-word; font-size: 0.65rem"
                    class="q-mx-sm"
                    @click="showP2PKKeyEntry(key.publicKey)"
                    >{{ key.publicKey }}</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    v-if="key.used"
                    :label="
                      $t('Settings.p2pk_features.keys_expansion.used_badge')
                    "
                    color="primary"
                    class="q-mr-sm"
                  />
                </q-item-section>
                <q-item-section
                  class="q-mx-none q-pl-none"
                  style="max-width: 1.05em"
                >
                  <q-icon
                    name="qr_code"
                    @click="showP2PKKeyEntry(key.publicKey)"
                    size="1em"
                    color="grey"
                    class="q-mr-xs cursor-pointer"
                  />
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </q-item>
        </div>

        <!-- PRIVACY SECTION -->
        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">{{ $t("Settings.sections.privacy") }}</div>
          <div class="divider-line"></div>
        </div>

        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold q-pt-sm">{{
              $t("Settings.privacy.title")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Settings.privacy.description") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <div>
          <!-- periodically check incoming invoices -->
          <q-item>
            <q-toggle
              v-model="checkIncomingInvoices"
              :label="$t('Settings.privacy.check_incoming.toggle')"
              color="primary"
            >
            </q-toggle>
          </q-item>
          <q-item class="q-pt-none">
            <q-item-label caption
              >{{ $t("Settings.privacy.check_incoming.description") }}
            </q-item-label>
          </q-item>
          <!-- check pending invoices on startup -->
          <q-item>
            <q-toggle
              v-model="checkInvoicesOnStartup"
              :label="$t('Settings.privacy.check_startup.toggle')"
              color="primary"
            >
            </q-toggle>
          </q-item>
          <q-item class="q-pt-none">
            <q-item-label caption
              >{{ $t("Settings.privacy.check_startup.description") }}
            </q-item-label>
          </q-item>
          <!-- periodically check incoming invoices -->
          <q-item>
            <q-toggle
              v-model="periodicallyCheckIncomingInvoices"
              :label="$t('Settings.privacy.check_all.toggle')"
              color="primary"
            >
            </q-toggle>
          </q-item>
          <q-item class="q-pt-none">
            <q-item-label caption
              >{{ $t("Settings.privacy.check_all.description") }}
            </q-item-label>
          </q-item>

          <!-- check outgoing token state setting -->
          <q-item>
            <q-toggle
              v-model="checkSentTokens"
              :label="$t('Settings.privacy.check_sent.toggle')"
              color="primary"
            /> </q-item
          ><q-item class="q-pt-none">
            <q-item-label caption
              >{{ $t("Settings.privacy.check_sent.description") }}
            </q-item-label>
          </q-item>
          <!-- websockets -->
          <q-item v-if="checkIncomingInvoices || checkSentTokens">
            <q-toggle
              v-if="checkIncomingInvoices || checkSentTokens"
              v-model="useWebsockets"
              :label="$t('Settings.privacy.websockets.toggle')"
              color="primary"
            >
            </q-toggle> </q-item
          ><q-item
            class="q-pt-none"
            v-if="checkIncomingInvoices || checkSentTokens"
          >
            <q-item-label caption
              >{{ $t("Settings.privacy.websockets.description") }}
            </q-item-label>
          </q-item>
          <!-- price check setting -->
          <q-item>
            <q-toggle
              v-model="getBitcoinPrice"
              :label="$t('Settings.privacy.bitcoin_price.toggle')"
              color="primary"
            /> </q-item
          ><q-item class="q-pt-none">
            <q-item-label caption
              >{{ $t("Settings.privacy.bitcoin_price.description") }}
            </q-item-label>
          </q-item>
        </div>

        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("Settings.sections.experimental") }}
          </div>
          <div class="divider-line"></div>
        </div>
        <!-- enable receive swaps -->
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.experimental.title")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Settings.experimental.description") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-toggle
            v-model="enableReceiveSwaps"
            :label="$t('Settings.experimental.receive_swaps.toggle')"
            color="primary"
          >
            <q-badge
              color="primary"
              :label="$t('Settings.experimental.receive_swaps.badge')"
              class="q-mx-sm"
            ></q-badge>
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.experimental.receive_swaps.description") }}
          </q-item-label>
        </q-item>
        <q-item>
          <q-toggle
            v-model="autoPasteEcashReceive"
            :label="$t('Settings.experimental.auto_paste.toggle')"
            color="primary"
          /> </q-item
        ><q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.experimental.auto_paste.description") }}
          </q-item-label>
        </q-item>
        <q-item>
          <q-toggle
            v-model="autoRedeemLockedTokens"
            :label="$t('Settings.experimental.auto_redeem_locked.toggle')"
            color="primary"
          />
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption>
            {{ $t("Settings.experimental.auto_redeem_locked.description") }}
          </q-item-label>
        </q-item>

        <!-- auditor settings -->
        <q-item>
          <q-toggle
            v-model="auditorEnabled"
            :label="$t('Settings.experimental.auditor.toggle')"
            color="primary"
          >
            <q-badge
              color="primary"
              :label="$t('Settings.experimental.auditor.badge')"
              class="q-mx-sm"
            ></q-badge>
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.experimental.auditor.description") }}
          </q-item-label>
        </q-item>
        <div class="row q-mx-md">
          <div class="col-12">
            <q-input
              v-model="auditorUrl"
              :label="$t('Settings.experimental.auditor.url_label')"
              color="primary"
              outlined
              dense
              rounded
              :disable="!auditorEnabled"
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="copy(auditorUrl)"
                  size="sm"
                  color="grey"
                />
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-mx-md q-mt-md">
          <div class="col-12">
            <q-input
              v-model="auditorApiUrl"
              :label="$t('Settings.experimental.auditor.api_url_label')"
              color="primary"
              outlined
              dense
              rounded
              :disable="!auditorEnabled"
            >
              <template v-slot:append>
                <q-btn
                  dense
                  flat
                  icon="content_copy"
                  @click="copy(auditorApiUrl)"
                  size="sm"
                  color="grey"
                />
              </template>
            </q-input>
          </div>
        </div>

        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">
            {{ $t("Settings.sections.appearance") }}
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- use numeric keyboard -->
        <div class="q-py-sm q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">{{
                  $t("Settings.appearance.keyboard.title")
                }}</q-item-label>
                <q-item-label caption>{{
                  $t("Settings.appearance.keyboard.description")
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-toggle
                v-model="useNumericKeyboard"
                :label="$t('Settings.appearance.keyboard.toggle')"
                color="primary"
              /> </q-item
            ><q-item class="q-pt-none">
              <q-item-label caption
                >{{ $t("Settings.appearance.keyboard.toggle_description") }}
              </q-item-label>
            </q-item>
          </q-list>
        </div>

        <!-- theme -->
        <div class="q-py-mb q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">{{
                  $t("Settings.appearance.theme.title")
                }}</q-item-label>
                <q-item-label caption
                  >{{ $t("Settings.appearance.theme.description") }}
                </q-item-label>
                <div class="row q-py-md">
                  <q-btn dense flat rounded @click="toggleDarkMode" size="md">
                    Toggle dark mode
                    <q-icon
                      class="q-ml-sm"
                      :name="$q.dark.isActive ? 'brightness_3' : 'wb_sunny'"
                    />
                  </q-btn>
                </div>
                <div class="row q-pt-md">
                  <q-btn
                    v-if="themes.includes('monochrome')"
                    dense
                    flat
                    @click="changeColor('monochrome')"
                    icon="format_color_fill"
                    color="grey"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.mono')"
                    :title="$t('Settings.appearance.theme.tooltips.mono')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.mono")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('cyber')"
                    dense
                    flat
                    @click="changeColor('cyber')"
                    icon="format_color_fill"
                    color="green"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.cyber')"
                    :title="$t('Settings.appearance.theme.tooltips.cyber')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.cyber")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('freedom')"
                    dense
                    flat
                    @click="changeColor('freedom')"
                    icon="format_color_fill"
                    color="primary"
                    size="md"
                    :aria-label="
                      $t('Settings.appearance.theme.tooltips.freedom')
                    "
                    :title="$t('Settings.appearance.theme.tooltips.freedom')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.freedom")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('nostr')"
                    dense
                    flat
                    @click="changeColor('nostr')"
                    icon="format_color_fill"
                    color="primary"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.nostr')"
                    :title="$t('Settings.appearance.theme.tooltips.nostr')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.nostr")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('bitcoin')"
                    dense
                    flat
                    @click="changeColor('bitcoin')"
                    icon="format_color_fill"
                    color="orange"
                    size="md"
                    :aria-label="
                      $t('Settings.appearance.theme.tooltips.bitcoin')
                    "
                    :title="$t('Settings.appearance.theme.tooltips.bitcoin')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.bitcoin")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('mint')"
                    dense
                    flat
                    @click="changeColor('mint')"
                    icon="format_color_fill"
                    color="light-green-9"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.mint')"
                    :title="$t('Settings.appearance.theme.tooltips.mint')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.mint")
                    }}</q-tooltip> </q-btn
                  ><q-btn
                    v-if="themes.includes('autumn')"
                    dense
                    flat
                    @click="changeColor('autumn')"
                    icon="format_color_fill"
                    color="brown"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.nut')"
                    :title="$t('Settings.appearance.theme.tooltips.nut')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.nut")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('salvador')"
                    dense
                    flat
                    @click="changeColor('salvador')"
                    icon="format_color_fill"
                    color="blue-10"
                    size="md"
                    :aria-label="$t('Settings.appearance.theme.tooltips.blu')"
                    :title="$t('Settings.appearance.theme.tooltips.blu')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.blu")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('flamingo')"
                    dense
                    flat
                    @click="changeColor('flamingo')"
                    icon="format_color_fill"
                    color="primary"
                    size="md"
                    :aria-label="
                      $t('Settings.appearance.theme.tooltips.flamingo')
                    "
                    :title="$t('Settings.appearance.theme.tooltips.flamingo')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.flamingo")
                    }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="themes.includes('modern')"
                    dense
                    flat
                    @click="changeColor('modern')"
                    icon="format_color_fill"
                    color="blue-4"
                    size="md"
                    :aria-label="
                      $t('Settings.appearance.theme.tooltips.modern')
                    "
                    :title="$t('Settings.appearance.theme.tooltips.modern')"
                    ><q-tooltip>{{
                      $t("Settings.appearance.theme.tooltips.modern")
                    }}</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- language picker: hidden for till i18n integration is finished -->
        <!-- LANGUAGE SECTION -->
        <div class="section-divider q-my-md">
          <div class="divider-line"></div>
          <div class="divider-text">{{ $t("Settings.language.title") }}</div>
          <div class="divider-line"></div>
        </div>

        <div class="q-py-sm q-px-xs text-left" on-left>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label overline class="text-weight-bold">{{
                  $t("Settings.language.title")
                }}</q-item-label>
                <q-item-label caption>{{
                  $t("Settings.language.description")
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-select
                  v-model="selectedLanguage"
                  :options="languageOptions"
                  rounded
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="changeLanguage"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-expansion-item
          class="q-pt-lg"
          dense
          dense-toggle
          icon="code"
          :label="$t('Settings.advanced.title')"
        >
          <div>
            <q-item class="q-pt-lg">
              <q-item-section>
                <q-item-label overline>{{
                  $t("Settings.advanced.developer.title")
                }}</q-item-label>
                <q-item-label caption>{{
                  $t("Settings.advanced.developer.description")
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <div>
              <!-- check proofs spendable setting -->
              <q-item>
                <q-item-section>
                  <div class="row q-pt-md">
                    <div class="col-12" v-if="!confirmMnemonic">
                      <q-btn
                        flat
                        dense
                        @click="confirmMnemonic = !confirmMnemonic"
                        >{{
                          $t("Settings.advanced.developer.new_seed.button")
                        }}</q-btn
                      >
                      <div class="row">
                        <q-item-label class="q-px-sm" caption
                          >{{
                            $t(
                              "Settings.advanced.developer.new_seed.description"
                            )
                          }}
                        </q-item-label>
                      </div>
                    </div>
                    <div class="col-12" v-if="confirmMnemonic">
                      <span
                        >{{
                          $t(
                            "Settings.advanced.developer.new_seed.confirm_question"
                          )
                        }}
                      </span>
                      <q-btn
                        flat
                        dense
                        class="q-ml-sm"
                        color="warning"
                        @click="confirmMnemonic = false"
                        >{{
                          $t("Settings.advanced.developer.new_seed.cancel")
                        }}</q-btn
                      >
                      <q-btn
                        flat
                        dense
                        class="q-ml-sm"
                        color="secondary"
                        @click="
                          confirmMnemonic = false;
                          generateNewMnemonic();
                        "
                        >{{
                          $t("Settings.advanced.developer.new_seed.confirm")
                        }}</q-btn
                      >
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn
                      dense
                      flat
                      outline
                      click
                      @click="checkActiveProofsSpendable"
                      >{{
                        $t("Settings.advanced.developer.remove_spent.button")
                      }}</q-btn
                    >
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.remove_spent.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn dense flat outline click @click="toggleTerminal">
                      {{
                        $t("Settings.advanced.developer.debug_console.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.debug_console.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn dense flat outline click @click="exportActiveProofs">
                      {{
                        $t("Settings.advanced.developer.export_proofs.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.export_proofs.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <!-- add a caption, not a button here -->
                    <q-item-label class="q-pb-sm">{{
                      $t("Settings.advanced.developer.keyset_counters.title")
                    }}</q-item-label>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.keyset_counters.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                  <div class="row q-pa-sm">
                    <div
                      class="q-px-sm"
                      v-for="(mintCounter, mintUrl) in keysetCountersByMint"
                      :key="mintUrl"
                    >
                      <q-item-label class="q-px-xs" caption>
                        {{ shortUrl(mintUrl) }}
                      </q-item-label>
                      <q-btn
                        dense
                        v-for="(counter, id) in mintCounter"
                        :key="id"
                        flat
                        click
                        @click="increaseKeysetCounter(counter.id, 1)"
                        >{{ counter.id }} - counter: {{ counter.counter }}
                      </q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn
                      dense
                      flat
                      outline
                      click
                      @click="unsetAllReservedProofs"
                    >
                      {{
                        $t("Settings.advanced.developer.unset_reserved.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.unset_reserved.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn dense flat outline click @click="showOnboarding">
                      {{
                        $t("Settings.advanced.developer.show_onboarding.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.show_onboarding.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn
                      v-if="!confirmNuke"
                      dense
                      flat
                      outline
                      click
                      @click="confirmNuke = !confirmNuke"
                    >
                      {{
                        $t("Settings.advanced.developer.reset_wallet.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row" v-if="!confirmNuke">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.reset_wallet.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                  <div class="row" v-if="confirmNuke">
                    <span>{{
                      $t(
                        "Settings.advanced.developer.reset_wallet.confirm_question"
                      )
                    }}</span>
                    <q-btn
                      flat
                      dense
                      class="q-ml-sm"
                      color="primary"
                      @click="confirmNuke = false"
                      >{{
                        $t("Settings.advanced.developer.reset_wallet.cancel")
                      }}</q-btn
                    >
                    <q-btn
                      flat
                      dense
                      class="q-ml-sm"
                      color="warning"
                      @click="
                        confirmNuke = false;
                        nukeWallet();
                      "
                      >{{
                        $t("Settings.advanced.developer.reset_wallet.confirm")
                      }}</q-btn
                    >
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <div class="row">
                    <q-btn dense flat outline click @click="exportWalletState">
                      {{
                        $t("Settings.advanced.developer.export_wallet.button")
                      }}
                    </q-btn>
                  </div>
                  <div class="row">
                    <q-item-label class="q-px-sm" caption
                      >{{
                        $t(
                          "Settings.advanced.developer.export_wallet.description"
                        )
                      }}
                    </q-item-label>
                  </div>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-expansion-item>
      </q-list>
    </div>
  </div>

  <!-- P2PK DIALOG -->
  <P2PKDialog v-model="showP2PKDialog" />

  <!-- NWC DIALOG -->
  <NWCDialog v-model="showNWCDialog" />
</template>
<script lang="ts">
import { debug } from "src/js/logger";
import { defineComponent } from "vue";
import { useClipboard } from "src/composables/useClipboard";
import P2PKDialog from "./P2PKDialog.vue";
import NWCDialog from "./NWCDialog.vue";

import { getShortUrl } from "src/js/wallet-helpers";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useMnemonicStore } from "src/stores/mnemonic";
import { useSettingsStore } from "src/stores/settings";
import { useNostrStore, publishDiscoveryProfile } from "src/stores/nostr";
import { notifySuccess, notifyError } from "src/js/notify";
import { useNPCStore } from "src/stores/npubcash";
import { useP2PKStore } from "src/stores/p2pk";
import { useCreatorProfileStore } from "src/stores/creatorProfile";
import { useNWCStore } from "src/stores/nwc";
import { useUiStore } from "../stores/ui";
import { useWorkersStore } from "src/stores/workers";
import { useProofsStore } from "src/stores/proofs";
import { usePRStore } from "../stores/payment-request";
import { useRestoreStore } from "src/stores/restore";
import { useDexieStore } from "../stores/dexie";
import { useReceiveTokensStore } from "../stores/receiveTokensStore";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "SettingsView",
  components: {
    P2PKDialog,
    NWCDialog,
  },
  mixins: [windowMixin],
  setup() {
    const { copy } = useClipboard();
    const p2pkStore = useP2PKStore();
    return { copy, p2pkStore };
  },
  props: {},
  data: function () {
    return {
      themes: [
        "monochrome",
        "nostr",
        "bitcoin",
        "mint",
        "autumn",
        "salvador",
        "freedom",
        "cyber",
        "flamingo",
        "modern",
      ],
      selectedLanguage: navigator.language || "en-US",
      languageOptions: [
        { label: "English", value: "en-US" },
        { label: "Español", value: "es-ES" },
        { label: "Italiano", value: "it-IT" },
        { label: "Deutsch", value: "de-DE" },
        { label: "Français", value: "fr-FR" },
        { label: "Svenska", value: "sv-SE" },
        { label: "Ελληνικά", value: "el-GR" },
        { label: "Türkçe", value: "tr-TR" },
        { label: "ไทย", value: "th-TH" },
        { label: "العربية", value: "ar-SA" },
        { label: "中文", value: "zh-CN" },
        { label: "日本語", value: "ja-JP" },
      ],
      discoveringMints: false,
      hideMnemonic: true,
      confirmMnemonic: false,
      confirmNuke: false,
      nip46Token: "",
      nip07SignerAvailable: false,
      newRelay: "",
      newNostrRelay: "",
    };
  },
  computed: {
    ...mapWritableState(useSettingsStore, [
      "getBitcoinPrice",
      "checkSentTokens",
      "useWebsockets",
      "nfcEncoding",
      "useNumericKeyboard",
      "periodicallyCheckIncomingInvoices",
      "checkIncomingInvoices",
      "checkInvoicesOnStartup",
      "enableReceiveSwaps",
      "showNfcButtonInDrawer",
      "autoPasteEcashReceive",
      "autoRedeemLockedTokens",
      "auditorEnabled",
      "auditorUrl",
      "auditorApiUrl",
      "defaultNostrRelays",
    ]),
    ...mapState(useP2PKStore, ["p2pkKeys", "firstKey"]),
    ...mapWritableState(useP2PKStore, [
      "showP2PKDialog",
      "showP2PkButtonInDrawer",
    ]),
    ...mapWritableState(useNWCStore, ["showNWCDialog", "showNWCData"]),
    ...mapState(useMintsStore, ["activeMintUrl", "mints", "activeProofs"]),
    ...mapState(useNPCStore, ["npcLoading"]),
    ...mapState(useNostrStore, [
      "pubkey",
      "mintRecommendations",
      "signerType",
      "seedSignerPrivateKeyNsecComputed",
    ]),
    ...mapState(useMnemonicStore, ["mnemonic"]),
    ...mapState(useUiStore, ["ndefSupported"]),
    ...mapWritableState(useNPCStore, ["npcAddress"]),
    ...mapWritableState(useNPCStore, ["npcEnabled", "automaticClaim"]),
    ...mapWritableState(useWalletStore, ["keysetCounters"]),
    ...mapWritableState(useMintsStore, [
      "addMintData",
      "showAddMintDialog",
      "showRemoveMintDialog",
    ]),
    ...mapWritableState(useNWCStore, ["nwcEnabled", "connections", "relays"]),
    ...mapWritableState(usePRStore, [
      "enablePaymentRequest",
      "receivePaymentRequestsAutomatically",
    ]),

    keysetCountersByMint() {
      const mints = this.mints;
      const keysetCountersByMint = {}; // {mintUrl: [keysetCounter: {id: string, count: number}, ...]}
      for (let mint of mints) {
        const mintIds = mint.keysets.map((keyset) => keyset.id);
        const keysetCounterThisMint = this.keysetCounters.filter((entry) =>
          mintIds.includes(entry.id)
        );
        keysetCountersByMint[mint.url] = keysetCounterThisMint;
      }
      return keysetCountersByMint;
    },
    hiddenMnemonic() {
      if (this.hideMnemonic) {
        return this.mnemonic
          .split(" ")
          .map((w) => "*".repeat(6))
          .join(" ");
      } else {
        return this.mnemonic;
      }
    },
    enableNwc: {
      get() {
        return this.nwcEnabled;
      },
      set(value) {
        this.nwcEnabled = value;
      },
    },
  },
  watch: {
    enableNwc: function () {
      if (this.enableNwc) {
        this.listenToNWCCommands();
      } else {
        this.unsubscribeNWC();
      }
    },
    npcEnabled: async function () {
      if (this.npcEnabled) {
        await this.initSigner();
        await this.generateNPCConnection();
      } else {
        this.npcAddress = "";
      }
    },
  },
  methods: {
    ...mapActions(useNostrStore, [
      "init",
      "initNip07Signer",
      "initNip46Signer",
      "initPrivateKeySigner",
      "initWalletSeedPrivateKeySigner",
      "checkNip07Signer",
      "resetPrivateKeySigner",
      "resetNip46Signer",
      "initSigner",
    ]),
    ...mapActions(useNWCStore, [
      "generateNWCConnection",
      "listenToNWCCommands",
      "unsubscribeNWC",
      "getConnectionString",
    ]),
    ...mapActions(useP2PKStore, [
      "importNsec",
      "createAndSelectNewKey",
      "showKeyDetails",
    ]),
    ...mapActions(useMintsStore, [
      "addMint",
      "removeMint",
      "activateMintUrl",
      "updateMint",
    ]),
    ...mapActions(useMnemonicStore, ["newMnemonic"]),
    ...mapActions(useWalletStore, [
      "decodeRequest",
      "checkProofsSpendable",
      "increaseKeysetCounter",
    ]),
    ...mapActions(useProofsStore, ["serializeProofs"]),
    ...mapActions(useNPCStore, ["generateNPCConnection"]),
    ...mapActions(useRestoreStore, ["restoreMint"]),
    ...mapActions(useDexieStore, ["deleteAllTables"]),
    ...mapActions(useStorageStore, ["restoreFromBackup", "exportWalletState"]),
    generateNewMnemonic: async function () {
      this.newMnemonic();
      await this.initSigner();
      await this.generateNPCConnection();
    },
    shortUrl: function (url) {
      return getShortUrl(url);
    },
    toggleMnemonicVisibility: function () {
      this.hideMnemonic = !this.hideMnemonic;
    },
    toggleTerminal: function () {
      useUiStore().toggleDebugConsole();
    },
    toggleDarkMode: function () {
      this.$q.dark.toggle();
      this.$q.localStorage.set("cashu.darkMode", this.$q.dark.isActive);
    },
    unsetAllReservedProofs: async function () {
      // mark all this.proofs as reserved=false
      const proofsStore = useProofsStore();
      await proofsStore.setReserved(await proofsStore.getProofs(), false);
      this.notifySuccess("All reserved proofs unset");
    },
    checkActiveProofsSpendable: async function () {
      // iterate over this.activeProofs in batches of 50 and check if they are spendable
      let wallet = useWalletStore().mintWallet(
        this.activeMintUrl,
        this.activeUnit
      );
      let proofs = this.activeProofs.flat();
      debug("Checking proofs", proofs);
      let allSpentProofs = [];
      let batch_size = 50;
      for (let i = 0; i < proofs.length; i += batch_size) {
        debug("Checking proofs", i, i + batch_size);
        let batch = proofs.slice(i, i + batch_size);
        let spent = await this.checkProofsSpendable(batch, wallet, true);
        allSpentProofs.push(spent);
      }
      let spentProofs = allSpentProofs.flat();
      if (spentProofs.length > 0) {
        debug("Spent proofs", spentProofs);
        this.notifySuccess("Removed " + spentProofs.length + " spent proofs");
      } else {
        this.notifySuccess("No spent proofs found");
      }
    },
    showP2PKKeyEntry: async function (pubKey) {
      this.showKeyDetails(pubKey);
      this.showP2PKDialog = true;
    },
    showNWCEntry: async function (connection) {
      this.showNWCData = {
        connection,
        connectionString: this.getConnectionString(connection),
      };
      this.showNWCDialog = true;
    },
    exportActiveProofs: async function () {
      // export active proofs
      const token = await this.serializeProofs(this.activeProofs);
      this.copy(token);
    },
    doPublish: async function () {
      try {
        await useNostrStore().initSignerIfNotSet();
      } catch (e) {
        useUiStore().showMissingSignerModal = true;
        return;
      }
      try {
        if (!this.firstKey) {
          notifyError("No P2PK key");
          return;
        }
        const profileStore = useCreatorProfileStore();
        await publishDiscoveryProfile({
          profile: {
            display_name: profileStore.display_name,
            picture: profileStore.picture,
            about: profileStore.about,
          },
          p2pkPub: this.firstKey.publicKey,
          mints: profileStore.mints,
          relays: profileStore.relays,
        });
        notifySuccess("Profile published");
      } catch (e: any) {
        notifyError(e?.message || "Failed to publish");
      }
    },
    handleSeedClick: async function () {
      await this.initWalletSeedPrivateKeySigner();
      await this.generateNPCConnection();
    },
    handleExtensionClick: async function () {
      await this.initNip07Signer();
      await this.generateNPCConnection();
    },
    handleBunkerClick: async function () {
      await this.initNip46Signer();
      await this.generateNPCConnection();
    },
    handleNsecClick: async function () {
      await this.initPrivateKeySigner();
      await this.generateNPCConnection();
    },
    handleResetPrivateKeySigner: async function () {
      await this.resetPrivateKeySigner();
      await this.generateNPCConnection();
    },
    handleResetNip46Signer: async function () {
      await this.resetNip46Signer();
      await this.generateNPCConnection();
    },
    showOnboarding: function () {
      const welcomeStore = useWelcomeStore();
      welcomeStore.resetWelcome();
      this.$router.push("/welcome");
    },
    nukeWallet: async function () {
      // create a backup just in case
      await this.exportWalletState();
      // clear dexie tables
      this.deleteAllTables();
      localStorage.clear();
      window.location.href = "/";
    },
    addRelay: function () {
      if (this.newRelay) {
        this.newRelay = this.newRelay.trim();
        // if relay is already in relays, don't add it, send notification
        if (this.relays.includes(this.newRelay)) {
          this.notifyWarning("Relay already added");
        } else {
          this.relays.push(this.newRelay);
          const profileStore = useCreatorProfileStore();
          if (!profileStore.relays.includes(this.newRelay)) {
            profileStore.relays.push(this.newRelay);
          }
          this.newRelay = "";
        }
      }
    },
    removeRelay: function (relay) {
      this.relays = this.relays.filter((r) => r !== relay);
      const profileStore = useCreatorProfileStore();
      profileStore.relays = profileStore.relays.filter((r) => r !== relay);
    },
    addNostrRelay: function () {
      if (this.newNostrRelay) {
        this.newNostrRelay = this.newNostrRelay.trim();
        if (this.defaultNostrRelays.includes(this.newNostrRelay)) {
          this.notifyWarning("Relay already added");
        } else {
          this.defaultNostrRelays.push(this.newNostrRelay);
          const profileStore = useCreatorProfileStore();
          if (!profileStore.relays.includes(this.newNostrRelay)) {
            profileStore.relays.push(this.newNostrRelay);
          }
          this.newNostrRelay = "";
        }
      }
    },
    removeNostrRelay: function (relay) {
      this.defaultNostrRelays = this.defaultNostrRelays.filter(
        (r) => r !== relay
      );
      const profileStore = useCreatorProfileStore();
      profileStore.relays = profileStore.relays.filter((r) => r !== relay);
    },
    updateNostrRelay: function (index: number, value: string) {
      const val = value.trim();
      this.defaultNostrRelays.splice(index, 1, val);
      const profileStore = useCreatorProfileStore();
      profileStore.relays.splice(index, 1, val);
    },
    changeLanguage(locale) {
      if (locale === "en") {
        locale = "en-US";
      }
      // Set the i18n locale
      this.$i18n.locale = locale;

      // Store the selected language in localStorage
      localStorage.setItem("cashu.language", locale);

      // // Reload the page to apply the language change
      // setTimeout(() => {
      //   window.location.reload();
      // }, 300);
    },
  },
  created: async function () {
    this.nip07SignerAvailable = await this.checkNip07Signer();
    debug("Nip07 signer available", this.nip07SignerAvailable);
    // Set the initial selected language based on the current locale
    const currentLocale =
      this.$i18n.locale === "en" ? "en-US" : this.$i18n.locale;
    this.selectedLanguage = currentLocale;
  },
});
</script>
<style>
/* Section Divider */
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: var(--divider-color);
}

.divider-text {
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
}
</style>
