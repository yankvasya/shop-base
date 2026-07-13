<script setup lang="ts">
import { Button } from '@shared/ui/button'
import { useAuth } from '../model/use-auth'

const { isLoggedIn, login, logout } = useAuth()
const { t } = useI18n()
</script>

<template>
  <div class="flex items-center gap-2 text-sm">
    <template v-if="isLoggedIn">
      <NuxtLink to="/account" class="hover:underline">{{ t('account.myAccount') }}</NuxtLink>
      <Button variant="ghost" size="sm" @click="logout">{{ t('account.logout') }}</Button>
    </template>
    <Button v-else variant="ghost" size="sm" @click="() => login()">{{ t('account.login') }}</Button>
  </div>
</template>
