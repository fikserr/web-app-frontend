self.addEventListener("install", (event) => {
  console.log("Service worker installed");
});

self.addEventListener("fetch", (event) => {
  // offline cache qo'shmoqchi bo‘lsang shu yerda qilasan
});

