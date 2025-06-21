// الوضع الليلي/النهاري مع حفظ
const themeButton = document.getElementById('toggle-theme');
if (themeButton) {
  themeButton.onclick = function() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      themeButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
      localStorage.setItem('site-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
      localStorage.setItem('site-theme', 'dark');
    }
  };
  if (localStorage.getItem('site-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

// تحديث السنة الحالية في الفوتر
document.querySelectorAll('#current-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// التقويم الهجري في الفوتر (حساب تقريبي)
function getHijriDate() {
  const today = new Date();
  const hijri = new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'}).format(today);
  return hijri.replace('هـ', '').trim() + " هـ";
}
document.querySelectorAll('#hijri-date').forEach(el => {
  el.textContent = getHijriDate();
});

// مواقيت الصلاة (prayer.html)
const defaultPrayerTimes = {
  "Makkah": { fajr: "04:06", sunrise: "05:36", dhuhr: "12:25", asr: "15:46", maghrib: "19:14", isha: "20:44" },
  "Cairo": { fajr: "03:12", sunrise: "04:58", dhuhr: "11:58", asr: "15:33", maghrib: "18:58", isha: "20:32" },
  "Riyadh": { fajr: "03:45", sunrise: "05:12", dhuhr: "11:53", asr: "15:20", maghrib: "18:38", isha: "20:08" },
  "Dubai": { fajr: "04:00", sunrise: "05:28", dhuhr: "12:20", asr: "15:47", maghrib: "19:10", isha: "20:39" }
};
function renderPrayerTimes(times) {
  const ptDiv = document.getElementById('prayer-times');
  ptDiv.innerHTML = '';
  if (!times) { ptDiv.innerHTML = '<p>لا توجد بيانات.</p>'; return; }
  const prayers = [
    {label: "الفجر", name: 'fajr', icon:'fa-cloud-moon'},
    {label: "الشروق", name: 'sunrise', icon:'fa-sun'},
    {label: "الظهر", name: 'dhuhr', icon:'fa-sun-bright'},
    {label: "العصر", name: 'asr', icon:'fa-cloud-sun'},
    {label: "المغرب", name: 'maghrib', icon:'fa-sunset'},
    {label: "العشاء", name: 'isha', icon:'fa-cloud-moon-rain'},
  ];
  prayers.forEach(pr => {
    ptDiv.innerHTML += `
      <div class="prayer-item">
        <i class="fa-solid ${pr.icon}" style="display:block;margin-bottom:3px"></i>
        <div>${pr.label}</div>
        <span>${times[pr.name]}</span>
      </div>
    `;
  });
}
async function fetchPrayerTimesByCoords(lat, lng) {
  document.getElementById('prayer-loader').style.display = 'flex';
  document.getElementById('prayer-times').innerHTML = '';
  try {
    const today = new Date();
    const url = `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}?latitude=${lat}&longitude=${lng}&method=4&lang=ar`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 200) {
      renderPrayerTimes({
        fajr: data.data.timings.Fajr,
        sunrise: data.data.timings.Sunrise,
        dhuhr: data.data.timings.Dhuhr,
        asr: data.data.timings.Asr,
        maghrib: data.data.timings.Maghrib,
        isha: data.data.timings.Isha
      });
    } else {
      renderPrayerTimes(null);
    }
  } catch {
    renderPrayerTimes(null);
  }
  document.getElementById('prayer-loader').style.display = 'none';
}
if (document.getElementById('prayer-times')) {
  // المدينة الافتراضية
  let selectedCity = document.getElementById('city').value;
  renderPrayerTimes(defaultPrayerTimes[selectedCity]);
  document.getElementById('city').onchange = function(e) {
    selectedCity = e.target.value;
    renderPrayerTimes(defaultPrayerTimes[selectedCity]);
  };
  // الموقع الجغرافي
  const locBtn = document.getElementById('use-location');
  if (locBtn) {
    locBtn.onclick = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          fetchPrayerTimesByCoords(
            pos.coords.latitude,
            pos.coords.longitude
          );
        }, () => {
          alert('تعذر الحصول على الموقع الجغرافي.');
        });
      } else {
        alert('المتصفح لا يدعم الموقع الجغرافي.');
      }
    };
  }
}

// الأذكار (azkar.html) - توليد ديناميكي
function generateAzkar(type) {
  const core = {
    morning: [
      "أصبحنا وأصبح الملك لله والحمد لله.",
      "اللهم بك أصبحنا وبك أمسينا.",
      "رضيت بالله ربًا وبالإسلام دينًا.",
      "اللهم إني أسألك العافية في الدنيا والآخرة.",
      "اللهم أنت ربي لا إله إلا أنت.",
      "اللهم إني أصبحت أشهدك وأشهد حملة عرشك.",
      "اللهم ما أصبح بي من نعمة أو بأحد من خلقك."
    ],
    evening: [
      "أمسينا وأمسى الملك لله والحمد لله.",
      "اللهم بك أمسينا وبك أصبحنا.",
      "اللهم إني أمسيت أشهدك وأشهد حملة عرشك.",
      "اللهم ما أمسى بي من نعمة.",
      "أعوذ بكلمات الله التامات.",
      "اللهم إني أسألك خير هذه الليلة."
    ],
    prayer: [
      "استغفر الله.",
      "اللهم أنت السلام ومنك السلام.",
      "سبحان الله (33)، الحمد لله (33)، الله أكبر (33).",
      "لا إله إلا الله وحده لا شريك له.",
      "اللهم أعني على ذكرك وشكرك."
    ],
    other: [
      "سبحان الله وبحمده، سبحان الله العظيم.",
      "اللهم صل وسلم على نبينا محمد.",
      "اللهم إني أعوذ بك من الهم والحزن.",
      "حسبي الله لا إله إلا هو عليه توكلت.",
      "لا حول ولا قوة إلا بالله."
    ]
  };
  // توليد أذكار إضافية تلقائية ليصبح العدد كبيرا
  const base = core[type] || [];
  const more = [];
  for (let i = 0; i < 30; i++) {
    if (base[i % base.length])
      more.push(base[i % base.length] + " #" + (i+1));
  }
  return base.concat(more);
}
function renderAzkar(type = "morning") {
  const azkarDiv = document.getElementById('azkar-list');
  azkarDiv.innerHTML = '';
  const azkarList = generateAzkar(type);
  azkarList.forEach(zkr => {
    azkarDiv.innerHTML += `
      <div class="azkar-item">
        <span>${zkr}</span>
        <button onclick="copyZikr('${zkr.replace(/'/g,"\\'").replace(/"/g,"&quot;")}')"><i class="fa-solid fa-copy"></i> نسخ</button>
      </div>
    `;
  });
}
window.copyZikr = function(zkr) {
  navigator.clipboard.writeText(zkr);
  alert('تم نسخ الذكر!');
}
if (document.getElementById('azkar-list')) {
  renderAzkar("morning");
  document.querySelectorAll('.azkar-tab').forEach(tab => {
    tab.onclick = function() {
      document.querySelectorAll('.azkar-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderAzkar(this.dataset.type);
    };
  });
}

// المسبحة الإلكترونية (sebha.html) مع جدول ديناميكي وزر مسح الكل
const defaultDhikrList = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "لا حول ولا قوة إلا بالله"
];

function getSebhaStats() {
  let stats = {};
  try { stats = JSON.parse(localStorage.getItem('sebha-stats')) || {}; } catch { stats = {}; }
  return stats;
}
function saveSebhaStats(stats) {
  localStorage.setItem('sebha-stats', JSON.stringify(stats));
}
function renderSebhaTable() {
  const stats = getSebhaStats();
  const tbody = document.getElementById('sebha-stats');
  if (!tbody) return;
  tbody.innerHTML = '';
  defaultDhikrList.forEach(dhikr => {
    const row = stats[dhikr] || {count: 0, date: "-" };
    tbody.innerHTML += `<tr>
      <td>${dhikr}</td>
      <td>${row.count || 0}</td>
      <td>${row.date || '-'}</td>
    </tr>`;
  });
}
if (document.getElementById('sebha-btn')) {
  let stats = getSebhaStats();
  let currentDhikr = localStorage.getItem('sebha-dhikr') || defaultDhikrList[0];
  let sebhaCount = stats[currentDhikr]?.count || 0;
  const countSpan = document.getElementById('sebha-count');
  const dhikrSelect = document.getElementById('sebha-dhikr');
  dhikrSelect.value = currentDhikr;
  countSpan.textContent = sebhaCount;
  renderSebhaTable();

  document.getElementById('sebha-btn').onclick = function() {
    sebhaCount++;
    countSpan.textContent = sebhaCount;
    const now = new Date();
    stats[currentDhikr] = {
      count: sebhaCount,
      date: now.toLocaleString('ar-EG')
    };
    saveSebhaStats(stats);
    renderSebhaTable();
  }
  document.getElementById('sebha-reset').onclick = function() {
    sebhaCount = 0;
    countSpan.textContent = sebhaCount;
    stats[currentDhikr] = {count: sebhaCount, date: '-'};
    saveSebhaStats(stats);
    renderSebhaTable();
  }
  dhikrSelect.onchange = function() {
    currentDhikr = dhikrSelect.value;
    localStorage.setItem('sebha-dhikr', currentDhikr);
    sebhaCount = stats[currentDhikr]?.count || 0;
    countSpan.textContent = sebhaCount;
  }
  // زر مسح الكل
  const clearAllBtn = document.getElementById('sebha-clear-all');
  if (clearAllBtn) {
    clearAllBtn.onclick = function() {
      if (confirm('هل أنت متأكد أنك تريد مسح جميع الجدول؟')) {
        // اصفر الجدول بالكامل
        let newStats = {};
        defaultDhikrList.forEach(dhikr => {
          newStats[dhikr] = {count: 0, date: '-'};
        });
        saveSebhaStats(newStats);
        stats = newStats;
        renderSebhaTable();
        // إعادة العدادات للصفر للذكر الحالي
        sebhaCount = 0;
        countSpan.textContent = sebhaCount;
      }
    }
  }
}


// هذا الكود يمكنك وضعه في ملف منفصل أو بين <script> ... </script> في صفحتك
async function fetchPrayerTimes() {
  const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=EG&method=5');
  const data = await response.json();
  const timings = data.data.timings;

  document.getElementById('fajr').textContent = timings.Fajr;
  document.getElementById('sunrise').textContent = timings.Sunrise;
  document.getElementById('dhuhr').textContent = timings.Dhuhr;
  document.getElementById('asr').textContent = timings.Asr;
  document.getElementById('maghrib').textContent = timings.Maghrib;
  document.getElementById('isha').textContent = timings.Isha;
}

// استدعِ الدالة بعد تحميل الصفحة
window.onload = fetchPrayerTimes;




// تعطيل الزر الأيمن
document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });

    // تعطيل اختصارات F12 و Ctrl+Shift+I و Ctrl+Shift+J و Ctrl+U
    document.addEventListener("keydown", function (e) {
        if (e.key === "F12" || 
            (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || 
            (e.ctrlKey && e.key === "U")) {
            e.preventDefault();
        }
    });