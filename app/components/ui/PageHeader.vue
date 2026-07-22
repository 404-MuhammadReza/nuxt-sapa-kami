<script setup>
import IconChevron from '~/assets/icons/chevron/right.svg?component'

defineProps({
  path: { type: Array, required: true },
  icon: { type: Object, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
})
</script>

<template>
  <div class="header-wrapper">
    <div class="path">
      <template v-for="(item, index) in path" :key="index">
        <span>{{ item }}</span>
        <IconChevron
          v-if="index !== path.length - 1"
          class="icon-chevron"
        />
      </template>
    </div>
    <div class="title">
      <div class="icon">
        <component :is="icon" class="icon-page" />
      </div>
      <div class="text">
        <h1>{{ title }}</h1>
        <span>{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--size-xxs);
}

.header-wrapper .path {
  display: flex;
  align-items: center;
  gap: var(--size-5xs);
}

.header-wrapper .path span {
  font-size: var(--size-xs);
  font-weight: var(--font-regular);

  color: var(--grey-400);
}

.header-wrapper .path span:last-child {
  font-weight: var(--font-medium);

  color: var(--blue-600);
}

.header-wrapper .path .icon-chevron {
  width: var(--size-xxs);
  height: var(--size-xxs);

  color: var(--grey-400);
}

.header-wrapper .path .icon-chevron * {
  stroke-width: 1.75;
}

.header-wrapper .title {
  display: flex;
  align-items: center;

  gap: var(--size-s);
}

.header-wrapper .title .icon {
  width: var(--size-5xl);
  height: var(--size-5xl);
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--size-xxs);
  border-radius: var(--size-s);

  background-color: var(--white);
  border: 1px solid var(--grey-200);
}

.header-wrapper .title .icon-page {
  width: 100%;
  height: 100%;

  color: var(--blue-500);
}

.header-wrapper .title .text {
  display: flex;
  flex-direction: column;
  gap: var(--size-4xs);
}

.header-wrapper .title .text h1 {
  font-weight: var(--font-bold);
  font-size: var(--size-xxl);

  color: var(--grey-900);
}

.header-wrapper .title .text span {
  font-size: var(--size-s);
  color: var(--grey-500);
}
</style>
