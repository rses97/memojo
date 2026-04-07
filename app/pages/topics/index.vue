<script setup lang="ts">
import type { TopicManifestEntry } from '~/types'

const { data: manifest } = await useFetch<{ topics: TopicManifestEntry[] }>('/topics/manifest.json')

const topics = computed(() => manifest.value?.topics ?? [])

useSeoMeta({
  title: 'Topics — Memojo',
  ogTitle: 'Topics — Memojo',
  description:
    'Browse memory game topics: World Flags, Solar System, Animals, Human Body, and World Landmarks. Pick a topic and start training your memory.',
  ogDescription:
    'Browse memory game topics: World Flags, Solar System, Animals, Human Body, and World Landmarks. Pick a topic and start training your memory.',
  ogImage: '/og-image.png',
  ogType: 'website',
})

useHead({
  title: 'Topics — Memojo',
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Memojo Topics',
        description: 'Browse memory game topic packs for cross-modal matching practice.',
        url: 'https://memojo.vercel.app/topics',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: (manifest.value?.topics ?? []).map((topic, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: topic.name,
            url: `https://memojo.vercel.app/topics/${topic.slug}`,
          })),
        },
      }),
    },
  ],
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="mb-8">
      <NuxtLink to="/" class="text-sm text-primary-500 hover:text-primary-600">
        &larr; Back to menu
      </NuxtLink>
      <h1 class="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">Topic Practice</h1>
      <p class="mt-1 text-surface-700 dark:text-surface-300">
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
        <p class="mb-3 text-sm text-surface-700 dark:text-surface-300">
          {{ topic.description }}
        </p>
        <span class="text-xs text-surface-700 dark:text-surface-300">
          {{ topic.pairCount }} pairs &middot; 3 levels
        </span>
      </NuxtLink>
    </div>

    <div
      v-if="topics.length === 0"
      class="py-20 text-center text-surface-700 dark:text-surface-300"
    >
      No topics available yet.
    </div>
  </div>
</template>
