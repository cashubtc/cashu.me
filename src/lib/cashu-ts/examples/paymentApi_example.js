import { CashuMint, CashuWallet, getDecodedToken, getEncodedTokenV4 } from '@cashu/cashu-ts';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

admin.initializeApp();

export const ecashPayment = onRequest(async (req, res) => {
	const waitedAmount = 10000;
	const p2pkLock = '02b3af078efa4583111915fe4d169c26f6fee86e3920cbe815522e62b946411001';
	const trustedMints = [
		'https://mint.minibits.cash/Bitcoin',
		'https://mint.lnwallet.app',
		'https://mint.coinos.io',
		'https://mint.lnserver.com',
		'https://mint.0xchat.com'
	];

	const uid = req.body.uid;
	const token = req.body.ecashToken;

	const auth = admin.auth();
	try {
		await auth.getUser(uid);
	} catch (error) {
		res.json({
			success: false,
			error: 'uid_not_found',
			message: 'Uid not found'
		});
		return;
	}

	let decodedToken;
	try {
		decodedToken = getDecodedToken(token);
	} catch (error) {
		res.json({
			success: false,
			error: 'invalid_token',
			message: 'Invalid token'
		});
		return;
	}

	const isUnitSat = decodedToken.unit === 'sat';
	if (!isUnitSat) {
		res.json({
			success: false,
			error: 'invalid_unit',
			message: 'Token unit is not satoshi'
		});
		return;
	}

	const totalAmount = decodedToken.proofs.reduce((sum, proof) => sum + proof.amount, 0);
	const isWrongAmount = totalAmount !== waitedAmount;
	if (isWrongAmount) {
		res.json({
			success: false,
			error: 'wrong_amount',
			message: `Wrong amount, must be ${waitedAmount} satoshi`
		});
		return;
	}

	const mintUrl = decodedToken.mint;
	const isTrustedMint = trustedMints.includes(mintUrl);
	if (!isTrustedMint) {
		res.json({
			success: false,
			error: 'untrusted_mint',
			message: 'Untrusted mint'
		});
		return;
	}

	const mint = new CashuMint(mintUrl);
	const wallet = new CashuWallet(mint);
	await wallet.loadMint();

	let receiveProofs;
	try {
		receiveProofs = await wallet.receive(token, { p2pk: { pubkey: p2pkLock } });
	} catch (error) {
		if (error.code === 11001) {
			res.json({
				success: false,
				error: 'token_spent',
				message: 'Token already spent'
			});
			return;
		}

		res.json({
			success: false,
			error: 'cannot_receive_token',
			message: `Cannot receive token: ${error.code}`
		});
		return;
	}

	const backToken = getEncodedTokenV4({ mint: mintUrl, proofs: receiveProofs });

	const db = getFirestore();
	const collectionRef = db.collection('payments');
	await collectionRef.add({
		uid,
		ecashToken: backToken
	});

	await db.collection('users').doc(uid).update({
		plan: 'Unlimited'
	});

	res.json({
		success: true,
		message: 'Payment accepted'
	});
	return;
});
