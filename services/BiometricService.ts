import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric';

export class BiometricService {
    /**
     * Checks if biometric authentication is available on the device.
     */
    static async isAvailable(): Promise<{ available: boolean; type?: BiometryType }> {
        try {
            const result = await NativeBiometric.isAvailable();
            return {
                available: true,
                type: result.biometryType
            };
        } catch (error) {
            console.warn('Biometrics not available', error);
            return { available: false };
        }
    }

    /**
     * Prompts the user for biometric authentication.
     */
    static async authenticate(reason: string = 'Acesse sua conta com segurança'): Promise<boolean> {
        try {
            await NativeBiometric.verifyIdentity({
                reason,
                title: 'Login Biométrico',
                subtitle: 'Use sua digital ou face para entrar',
                description: 'Autenticação rápida e segura.',
                maxAttempts: 3
            });
            return true;
        } catch (error) {
            console.warn('Authentication failed or cancelled', error);
            return false;
        }
    }

    /**
     * Securely saves credentials to the device keychain/keystore.
     */
    static async saveCredentials(email: string, password: string): Promise<void> {
        try {
            await NativeBiometric.setCredentials({
                username: email,
                password: password,
                server: 'morador.app'
            });
        } catch (error) {
            console.error('Error saving credentials', error);
            throw error;
        }
    }

    /**
     * Securely retrieves saved credentials.
     */
    static async getCredentials(): Promise<{ username: string; password: string } | null> {
        try {
            const credentials = await NativeBiometric.getCredentials({
                server: 'morador.app'
            });
            return credentials;
        } catch (error) {
            console.warn('No credentials found or access denied', error);
            return null;
        }
    }

    /**
     * Deletes saved credentials.
     */
    static async deleteCredentials(): Promise<void> {
        try {
            await NativeBiometric.deleteCredentials({
                server: 'morador.app'
            });
        } catch (error) {
            console.error('Error deleting credentials', error);
        }
    }
}
