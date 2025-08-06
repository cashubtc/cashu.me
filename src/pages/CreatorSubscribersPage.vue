<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 p-4">
    <h1 class="text-2xl font-bold mb-4">Subscribers</h1>
    <div ref="sparkline" class="w-full h-16 mb-4"></div>
    <div class="flex-1 overflow-y-auto custom-scroll">
      <transition-group name="fade" tag="ul" class="space-y-2">
        <li
          v-for="n in 20"
          :key="n"
          class="p-2 bg-white rounded shadow"
        >
          Subscriber {{ n }}
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const sparkline = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (sparkline.value) {
    const canvas = document.createElement('canvas');
    canvas.width = sparkline.value.clientWidth;
    canvas.height = sparkline.value.clientHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const points = [5, 3, 6, 2, 7, 4, 6, 3, 5, 4];
      const max = Math.max(...points);
      const min = Math.min(...points);
      const width = canvas.width / (points.length - 1);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = i * width;
        const y = canvas.height - ((p - min) / (max - min)) * canvas.height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    sparkline.value.appendChild(canvas);
  }
});
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

