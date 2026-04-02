<script setup lang="ts">
import type { TopicManifestEntry } from '~/types'

useHead({ title: 'Topic Practice' })

const { data: manifest } = await useFetch<{ topics: TopicManifestEntry[] }>('/topics/index.json')

const topics = computed(() => manifest.value?.topics ?? [])
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="mb-8">
      <NuxtLink to="/" class="text-sm text-primary-500 hover:text-primary-600">
        &larr; Back to menu
      </NuxtLink>
      <h1 class="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">Topic Practice</h1>
      <p class="mt-1 text-surface-600 dark:text-surface-400">
        Choose a topic and master it through three levels of increasing difficulty.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="topic in topics"
        :key="topic.slug"
        :to="`/topics/${topic.slug}`"
        class="group rounded-xl bg-surface-50 p-5 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-surface-800"
      >
        <h2
          class="mb-1 text-lg font-bold text-surface-900 group-hover:text-primary-500 dark:text-surface-50"
        >
          {{ topic.name }}
        </h2>
        <p class="mb-3 text-sm text-surface-600 dark:text-surface-400">
          {{ topic.description }}
        </p>
        <span class="text-xs text-surface-500 dark:text-surface-400">
          {{ topic.pairCount }} pairs &middot; 3 levels
        </span>
      </NuxtLink>
    </div>

    <div v-if="topics.length === 0" class="py-20 text-center text-surface-500">
      No topics available yet.
    </div>
  </div>
</template>
