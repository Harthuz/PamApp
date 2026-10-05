// Tela de Cadastro de novos usuarios com selecao de perfil (RBAC)

import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { UserRole } from '@/@types/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setError('');
    try {
      await signUp(name, email, password, selectedRole);
      router.replace('/(app)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar usuário.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Cabecalho */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Criar Nova Conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se na plataforma para auditoria de treinos e telemetria
          </Text>
        </View>

        {/* Card de Formulario */}
        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Hernandes da Silva"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail institucional</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="seu.nome@fatec.br"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha (mínimo 6 dígitos)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Sua senha secreta"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Selecao de Perfil (RBAC) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Perfil de Acesso (RBAC)</Text>
            <View style={styles.roleSelectionRow}>
              <Pressable
                style={[
                  styles.roleCard,
                  selectedRole === 'USER' && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole('USER')}>
                <Ionicons
                  name="fitness-outline"
                  size={22}
                  color={selectedRole === 'USER' ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleCardText,
                    selectedRole === 'USER' && styles.roleCardTextActive,
                  ]}>
                  Aluno / Atleta (USER)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleCard,
                  selectedRole === 'ADMIN' && styles.roleCardAdminActive,
                ]}
                onPress={() => setSelectedRole('ADMIN')}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={selectedRole === 'ADMIN' ? Colors.admin : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleCardText,
                    selectedRole === 'ADMIN' && { color: Colors.admin },
                  ]}>
                  Professor (ADMIN)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Botao de Cadastrar */}
          <Pressable
            style={({ pressed }) => [
              styles.buttonPrimary,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.buttonPrimaryText}>Concluir Cadastro</Text>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
              </>
            )}
          </Pressable>
        </View>

        {/* Rodape */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui uma conta?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>Fazer login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450A0A',
    borderColor: Colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#FCA5A5',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  roleSelectionRow: {
    gap: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#1C2E14',
  },
  roleCardAdminActive: {
    borderColor: Colors.admin,
    backgroundColor: '#2E1065',
  },
  roleCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  roleCardTextActive: {
    color: Colors.primary,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
