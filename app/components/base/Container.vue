<script setup>
import backdrop from '~/assets/img/background.webp'
import Danantara from '~/assets/logo/danantara.svg?component'
import TimahIndustri from '~/assets/logo/timahindustri.svg?component'

defineProps({ maxWidth: { type: String, default: 'none' } })
</script>

<template>
  <div class="container">
    <aside>
      <div class="logo-wrapper">
        <Danantara class="logo-danantara" />
        <TimahIndustri class="logo-timahindustri" />
      </div>
      <div class="title">
        <h1>SAPA KAMI, TINDUSTRIAN</h1>
        <span>
          Sistem ini hadir untuk membangun budaya kerja yang transparan dan kolaboratif. Kami
          mendengarkan setiap ide, keluhan, dan saran anda demi mewujudkan tata kelola perusahaan yang lebih baik.
        </span>
      </div>
      <div class="backdrop">
        <img :src="backdrop" alt="Backdrop">
      </div>
    </aside>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-height: 50dvh;
  max-width: v-bind(maxWidth);

  display: flex;
  align-items: stretch;
  overflow: hidden;
  z-index: 1;

  gap: var(--size-s);
  padding: var(--size-s);
  border-radius: var(--size-l);

  background-color: var(--white);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.container aside {
  width: 45%;
  overflow: hidden;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: var(--size-s);
  border-radius: var(--size-s);
  background-color: var(--grey-100);
}

.container aside .backdrop::after {
  content: '';

  position: absolute;
  z-index: 1;
  inset: 0;

  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 25%);
}

.container aside .logo-wrapper {
  width: 100%;
  height: fit-content;

  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container aside .logo-wrapper svg {
  width: auto;
  flex-shrink: 0;
}

.container aside .logo-wrapper svg.logo-danantara {
  height: var(--size-l);
}

.container aside .logo-wrapper svg.logo-timahindustri {
  height: var(--size-xxl);
}

.container aside .title {
  width: 100%;
  position: relative;

  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: var(--size-3xs);
  padding: var(--size-s);
  border-radius: var(--size-s);

  background: rgba(255, 255, 255, 0.75);
}

.container aside .title::before {
  content: '';
  z-index: -1;

  position: absolute;
  inset: 0;

  backdrop-filter: blur(2.5px);
  border-radius: var(--size-s);
}

.container aside .title h1 {
  font-size: var(--size-xl);
  color: #16325C;
}

.container aside .title > span {
  font-size: var(--size-xs);
  text-align: justify;
  line-height: 1.5;

  color: var(--grey-600);
}

.container aside .backdrop {
  width: 100%;
  height: 100%;

  position: absolute;
  overflow: hidden;
  z-index: 0;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.container aside .backdrop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.container .content {
  flex: 1;
  display: flex;
  flex-direction: column;

  padding: var(--size-s);
  border-radius: var(--size-s);
  background-color: var(--grey-50);
}

@media (max-width: 768px) {
  .container {
    min-height: 0;
    flex-direction: column;

    gap: 0;
    padding: 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .container aside {
    width: 100%;
    height: 200px;

    border-radius: 0;
  }

  .container aside .backdrop img {
    transform: scale(1.5);
    transform-origin: 50% 40%;
  }

  .container .content {
    width: 100%;
    height: auto;

    border-radius: 0;
  }
}
</style>
