import argon2 from 'argon2';

// Paramètres recommandés Argon2id
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 Mo
  timeCost: 3,
  parallelism: 2,
  hashLength: 32,
};

/**
 * Hash un mot de passe avec Argon2id.
 * @param {string} password
 * @returns {Promise<string>} hash Argon2id
 */
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Le mot de passe doit être une chaîne valide de 8 caractères minimum.');
  }
  return await argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Vérifie un mot de passe et effectue un rehash si nécessaire.
 * @param {string} hashedPassword - hash stocké en BDD
 * @param {string} plainPassword - mot de passe fourni
 * @returns {Promise<{valid: boolean, newHash?: string}>}
 */
export async function verifyAndRehash(hashedPassword, plainPassword) {
  try {
    const valid = await argon2.verify(hashedPassword, plainPassword, ARGON2_OPTIONS);
    if (!valid) return { valid: false };

    // Vérifie si le hash nécessite un rehash (si paramètres modifiés)
    const needsRehash = await argon2.needsRehash(hashedPassword, ARGON2_OPTIONS);
    if (needsRehash) {
      const newHash = await argon2.hash(plainPassword, ARGON2_OPTIONS);
      return { valid: true, newHash };
    }

    return { valid: true };
  } catch (err) {
    console.error('Erreur lors de la vérification du mot de passe :', err);
    return { valid: false };
  }
}

// detruire une session req.session.destroy();