<template>
  <div class="q-pa-md flex flex-center">
    <div class="text-center">
      <q-icon name="gavel" size="4em" color="primary" />
      <h2 class="text-center q-mt-xl">{{ $t("WelcomeSlide4.title") }}</h2>
      <q-expansion-item
        :label="$t('WelcomeSlide4.actions.more.label')"
        class="q-mt-sm"
      >
        <div
          class="text-left q-mt-sm"
          style="
            max-height: 350px;
            max-width: 90%;
            overflow-y: auto;
            margin: 0 auto;
          "
        >
          <p><strong>Last Updated: 20.12.2024</strong></p>
          <p>
            <strong>
              IMPORTANT NOTICE: THESE TERMS OF SERVICE INCLUDE A MEDIATION-FIRST
              CLAUSE REQUIRING MEDIATION BEFORE ARBITRATION OR LITIGATION.
              PLEASE READ THESE TERMS CAREFULLY. IF YOU DO NOT AGREE, DO NOT USE
              CASHU.ME.
            </strong>
          </p>
          <p>
            <strong>
              ALL REFERENCES TO LAW, REGULATION, AND JURISDICTION IN THESE TERMS
              REFER TO THE LAWS AND REGULATIONS OF THE USER’S JURISDICTION.
              USERS ARE RESPONSIBLE FOR DETERMINING THE LEGALITY AND REGULATORY
              COMPLIANCE OF THEIR ACTIVITIES.
            </strong>
          </p>
          <p>
            <strong
              >CASHU.ME DOES NOT HOLD ECASH, DOES NOT EXECUTE AND CANNOT MONITOR
              TRANSACTIONS, AND DOES NOT OPERATE OR VERIFY ANY MINTS.</strong
            >
          </p>
          <p>
            These Terms of Service (these “Terms”) constitute the entire
            agreement and understanding between you (“you” or “your”) and
            Cashu.me (“Cashu.me,” “we,” “us,” or “our”) regarding your use of
            the Cashu.me website and any related applications, software, code,
            or services (collectively, the “Site” or “Services”). By accessing
            or using the Site or Services, you acknowledge that you have read,
            understand, and agree to be bound by these Terms. If you do not
            agree, do not access or use the Site or Services.
          </p>
          <p><strong>1. Nature of the Services</strong></p>
          <p>
            1.1 <strong>Non-Custodial Web Application:</strong> Cashu.me
            provides a non-custodial web application (“wallet”) that is executed
            entirely on your device. Our Site merely makes available client-side
            code implementing the open-source Cashu protocol. We do not run a
            server that holds your ecash or executes transactions on your
            behalf.
          </p>
          <p>
            1.2 <strong>No Control Over Mints:</strong> Cashu.me does not issue
            ecash and does not operate or control any Mint. The choice of any
            Mint and any transaction or relationship you establish with that
            Mint is solely between you and that Mint. Cashu.me has no
            involvement, responsibility, or liability in any such interaction.
          </p>
          <p>
            1.3 <strong>No Funds Access:</strong> At no time does Cashu.me have
            custody, possession, or control of your ecash. Transactions occur
            solely by your actions and through your chosen Mint. We do not
            monitor, verify, or facilitate transfers between you and any Mint or
            other parties.
          </p>
          <p>
            1.4 <strong>Web Server Only:</strong> Cashu.me does not operate any
            servers except for the web server that delivers the application to
            your device. The application is executed entirely on your device.
            Once the code is served, all logic executes locally and Cashu.me has
            no control over the application.
          </p>
          <p>
            1.5 <strong>Open Source Code:</strong> The application code is open
            source, meaning it can be self-hosted and run by third parties using
            different domains. Cashu.me has no control over, and does not
            endorse or assume responsibility for, any instances of the code
            running outside of the Cashu.me service. Your use of any such
            third-party instances is at your own risk.
          </p>
          <p>
            1.6 <strong>Code Disclaimer:</strong> The open-source code is
            provided without any guarantee of security, error-free operation, or
            technical support. Users must independently verify the authenticity,
            security, and integrity of the open-source code prior to use.
          </p>
          <p><strong>2. User Responsibilities & Disclaimers</strong></p>
          <p>
            2.1 <strong>User’s Sole Responsibility:</strong> You understand and
            agree that you use the Site and Services at your own risk and for
            your own account. You alone are fully responsible for selecting
            Mints, conducting transactions, and safeguarding your ecash and
            secret values. Cashu.me is not a party to and disclaims any
            responsibility for any agreements, terms, or disputes between you
            and any Mint.
          </p>
          <p>
            2.2 <strong>No Partnership with Mints:</strong> Cashu.me is not
            affiliated with, endorsed by, or responsible for any Mint. We make
            no representations, warranties, or guarantees about any Mint’s
            integrity, legality, liquidity, or functionality. Your relationship
            with any Mint, including the issuance, redemption, or valuation of
            ecash, is solely a matter between you and that Mint. Cashu.me is not
            a party to any transaction between you and any Mint or third party.
            No agency, partnership, or joint venture relationship is formed by
            your use of the Site.
          </p>
          <p>
            2.3 <strong>Risk of Ecash:</strong> Ecash is an experimental,
            bearer-like digital asset that may not be recognized as money,
            currency, or a store of value. Anyone with the secret value has
            control over the ecash. You agree to review and understand all risks
            disclosed in our Risk Disclosure Statement before using ecash.
          </p>
          <p><strong>3. Modifications to Terms</strong></p>
          <p>
            We may amend or update these Terms at any time without notice. You
            are advised to review these Terms periodically. Your continued use
            of the Site or Services after any modifications constitutes
            acceptance of the updated Terms. If you do not agree, discontinue
            your use.
          </p>
          <p><strong>4. Compliance with Laws</strong></p>
          <p>
            4.1 <strong>Legal Compliance:</strong> Your use of the Site and any
            Services is void where prohibited by law. You must determine whether
            your use of ecash and related activities are lawful. You are solely
            responsible for compliance with all applicable laws, taxes, and
            regulations.
          </p>
          <p>
            4.2 <strong>Not Financial Services:</strong> The Services are not
            intended to constitute regulated financial, banking, e-money, or
            payment services. You are solely responsible for determining whether
            your use of ecash or related activities requires any form of
            license, registration, or compliance with financial regulations in
            your jurisdiction.
          </p>
          <p><strong>5. License to Use the Site</strong></p>
          <p>
            Subject to your compliance with these Terms, we grant you a limited,
            personal, non-exclusive, non-transferable, revocable license to use
            the Site. We may suspend or terminate your access at our sole
            discretion.
          </p>
          <p><strong>6. Risks and Limitation of Liability</strong></p>
          <p>
            6.1 <strong>No Liability for Interactions with Mints:</strong>
            Cashu.me is not liable for any transactions, disputes, or issues
            arising from your dealings with Mints.
          </p>
          <p>
            6.2 <strong>Assumption of Risk:</strong> You acknowledge
            ecash-related activities involve significant risks, including market
            volatility, theft, and regulatory uncertainty.
          </p>
          <p>
            6.3 <strong>Waiver of Accountability:</strong> By using the Site,
            you waive any right to hold Cashu.me accountable for any damages,
            losses, or disputes arising from your use of the Site or Services.
          </p>
          <p>
            6.4 <strong>No Warranties:</strong> THE SITE AND SERVICES ARE
            PROVIDED “AS IS” WITHOUT ANY WARRANTIES. WE DISCLAIM ALL WARRANTIES
            TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>
          <p>
            6.5 <strong>Limitation of Liability:</strong> TO THE FULLEST EXTENT
            PERMITTED BY LAW, CASHU.ME IS NOT LIABLE FOR INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR
            RELATED TO THESE TERMS, THE SITE, OR THE SERVICES.
          </p>
          <p>
            6.6 <strong>Maximum Liability:</strong> To the maximum extent
            permitted by applicable law, the Site and Services are provided ‘as
            is’ without warranties of any kind. This does not affect any
            statutory warranties or rights which cannot be excluded under your
            jurisdiction’s law.
          </p>
          <p><strong>7. Indemnification and Release</strong></p>
          <p>
            You agree to indemnify and hold harmless Cashu.me and its affiliates
            from claims arising out of your use of the Site or Services. If you
            have a dispute with any Mint or third party, you release Cashu.me
            from all related claims.
          </p>
          <p><strong>8. Mediation and Dispute Resolution</strong></p>
          <p>
            8.1 <strong>Mediation Requirement:</strong> If a dispute arises out
            of or relates to these Terms, the Site, or the Services, the parties
            agree to first attempt to resolve the dispute through good-faith
            mediation administered by a reputable mediation provider. Each party
            shall bear its own costs for the mediation, and the costs of the
            mediator shall be shared equally.
          </p>
          <p>
            8.2 <strong>Arbitration Option:</strong> If mediation does not
            resolve the dispute within 30 days (or a mutually agreed period),
            either party may initiate final and binding arbitration administered
            by a reputable arbitration provider within the user’s jurisdiction.
            Arbitration shall be conducted on an individual basis, and class
            actions or collective proceedings are not permitted.
          </p>
          <p>
            8.3 <strong>Waiver of Jury Trial:</strong> If arbitration is not
            invoked and the dispute proceeds to court, you waive your right to a
            trial by jury to the fullest extent permitted by the governing law
            of your jurisdiction.
          </p>
          <p>
            8.4 <strong>EU Consumer Rights:</strong> If you are residing in the
            EU, any mandatory statutory rights regarding dispute resolution
            procedures remain unaffected by this clause. Nothing in this Section
            8 shall limit or affect any mandatory rights you may have under EU
            consumer protection or other applicable statutory laws.
          </p>
          <p><strong>9. Prohibited Uses</strong></p>
          <p>
            You may not use the Site or Services for unlawful activities, to
            violate applicable laws, or to engage in market manipulation. We may
            suspend or terminate access for prohibited uses. You agree not to
            use the Site or Services to engage in any activity that violates
            applicable anti-money laundering (AML), counter-terrorism financing
            (CTF), or other financial crime regulations. Any use of the Site or
            Services for unlawful or fraudulent purposes is strictly prohibited.
          </p>
          <p><strong>10. Privacy and Data Protection</strong></p>
          <p>
            10.1 <strong>GDPR Compliance:</strong> Cashu.me does not collect or
            store any personal data, including IP addresses. No data is shared
            with third parties. As such, Cashu.me does not engage in data
            processing activities that would subject it to GDPR or similar
            regulations. Users remain responsible for ensuring their own
            device’s security and verifying the authenticity of the code they
            run.
          </p>
          <p>
            10.2 <strong>Security:</strong> Because the code executes entirely
            on your device and no personal data is collected, Cashu.me does not
            perform any data processing activities that would fall under the
            GDPR or similar data protection laws.
          </p>
          <p>
            10.3 <strong>Local Data:</strong> Any data or information stored
            locally on your device, including browser storage, cookies, or
            application state, is controlled by you and not transmitted to or
            accessible by Cashu.me.
          </p>
          <p><strong>11. Your Representations and Warranties</strong></p>
          <p>
            You represent and warrant you have the right and authority to enter
            into these Terms and that your use of the Site will be lawful.
          </p>
          <p><strong>12. No Investment Advice</strong></p>
          <p>
            Cashu.me does not provide investment, legal, or tax advice. No
            fiduciary, advisory, or trust relationship is formed between you and
            Cashu.me by using the Site or Services.
          </p>
          <p><strong>13. No Waiver</strong></p>
          <p>
            No failure or delay to exercise any right by Cashu.me shall
            constitute a waiver of that right.
          </p>
          <p><strong>14. Force Majeure</strong></p>
          <p>
            Cashu.me is not liable for delays or failures due to events beyond
            our reasonable control.
          </p>
          <p><strong>15. Assignment</strong></p>
          <p>
            You may not assign your rights without our consent. We may assign
            our rights freely.
          </p>
          <p><strong>16. Severability</strong></p>
          <p>
            If any provision is deemed invalid, remaining provisions remain in
            effect.
          </p>
          <p><strong>17. Electronic Communications; Language</strong></p>
          <p>
            By using the Site or Services, you consent to receive communications
            electronically. We will communicate in English.
          </p>
          <p><strong>18. Governing Law</strong></p>
          <p>
            18.1 <strong>Choice of Law:</strong>
            These Terms and any dispute arising from or related to these Terms,
            the Site, or the Services shall be governed by the applicable laws
            of your jurisdiction, without regard to conflict of law principles.
          </p>
          <p>
            18.2 <strong>Consumer Rights:</strong>
            Nothing in these Terms shall exclude or limit any rights you may
            have under applicable mandatory consumer protection laws or
            regulations in your jurisdiction, including any rights under EU law
            that cannot be lawfully limited or disclaimed.
          </p>
          <p><strong>19. E-Sign Consent Policy</strong></p>
          <p>
            By using the Site, you consent to receive all communications
            electronically.
          </p>
          <p><strong>20. Risk Disclosure Statement</strong></p>
          <p>
            Using ecash involves significant risks including legal, market,
            liquidity, counterparty, and operational risks. You acknowledge and
            accept these risks.
          </p>
          <p><strong>21. Entire Agreement</strong></p>
          <p>
            These Terms represent the entire agreement between you and Cashu.me.
          </p>
        </div>
      </q-expansion-item>
      <q-checkbox
        v-model="welcomeStore.termsAccepted"
        :label="$t('WelcomeSlide4.inputs.checkbox.label')"
        class="q-mt-md"
      />
    </div>
  </div>
</template>

<script lang="ts">
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
p {
  font-size: 0.82rem;
  color: #c6c6c6;
}

/* Unified content width for consistency with other slides */
.q-pa-md .text-center,
.q-pa-md .q-expansion-item,
.q-pa-md .q-checkbox {
  max-width: 500px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
</style>
