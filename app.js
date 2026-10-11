const $ = (selector) => document.querySelector(selector);

const resumeText = $("#resumeText");
const jobText = $("#jobText");
const resumeFile = $("#resumeFile");
const resumeCount = $("#resumeCount");
const jobCount = $("#jobCount");
const formMessage = $("#formMessage");
const results = $("#results");

const SAMPLE_JOB = `Junior Software Developer

We are looking for an entry-level software developer to build and maintain web applications.

Required skills:
Java, Python, JavaScript, HTML, CSS, SQL, object-oriented programming (OOP), data structures, algorithms, Git, GitHub, REST API, debugging, problem solving, communication, teamwork.

Responsibilities:
Write clean code, test and debug applications, work with databases, collaborate with the development team, document solutions, and learn new technologies.

Preferred:
React, Node.js, Agile, unit testing, Linux.`;

const SKILLS = [
  {name:"Java", terms:["java"]},
  {name:"Python", terms:["python"]},
  {name:"JavaScript", terms:["javascript","js"]},
  {name:"TypeScript", terms:["typescript"]},
  {name:"C", terms:["c programming"," c language "]},
  {name:"C++", terms:["c++","cpp"]},
  {name:"C#", terms:["c#","c sharp"]},
  {name:"HTML", terms:["html","html5"]},
  {name:"CSS", terms:["css","css3"]},
  {name:"React", terms:["react","react.js","reactjs"]},
  {name:"Angular", terms:["angular"]},
  {name:"Vue", terms:["vue","vue.js","vuejs"]},
  {name:"Node.js", terms:["node.js","nodejs","node js"]},
  {name:"Express", terms:["express.js","expressjs","express framework"]},
  {name:"SQL", terms:["sql","structured query language"]},
  {name:"MySQL", terms:["mysql"]},
  {name:"PostgreSQL", terms:["postgresql","postgres"]},
  {name:"MongoDB", terms:["mongodb","mongo db"]},
  {name:"DBMS", terms:["dbms","database management"]},
  {name:"OOP", terms:["oop","object-oriented programming","object oriented programming"]},
  {name:"Data structures", terms:["data structures","data structure"]},
  {name:"Algorithms", terms:["algorithms","algorithm"]},
  {name:"Git", terms:["git"]},
  {name:"GitHub", terms:["github","git hub"]},
  {name:"REST API", terms:["rest api","restful api","rest apis","restful apis"]},
  {name:"API integration", terms:["api integration","api integrations"]},
  {name:"Debugging", terms:["debugging","debug"]},
  {name:"Unit testing", terms:["unit testing","unit tests","junit","jest"]},
  {name:"Agile", terms:["agile","scrum"]},
  {name:"Linux", terms:["linux"]},
  {name:"Cloud computing", terms:["cloud computing","aws","azure","google cloud","gcp"]},
  {name:"Machine learning", terms:["machine learning","ml"]},
  {name:"Data analysis", terms:["data analysis","data analytics","pandas","power bi","tableau"]},
  {name:"Communication", terms:["communication","communicate"]},
  {name:"Teamwork", terms:["teamwork","collaboration","collaborate","team player"]},
  {name:"Problem solving", terms:["problem solving","problem-solving","analytical skills"]},
  {name:"Leadership", terms:["leadership","led a team"]},
  {name:"Time management", terms:["time management","prioritization"]},
  {name:"Figma", terms:["figma"]},
  {name:"UI/UX", terms:["ui/ux","user experience","user interface"]},
  {name:"Docker", terms:["docker"]},
  {name:"Kubernetes", terms:["kubernetes"]},
  {name:"Spring Boot", terms:["spring boot","springboot"]},
  {name:"PHP", terms:["php"]},
  {name:"Django", terms:["django"]},
  {name:"Flask", terms:["flask"]},
  {name:"JSON", terms:["json"]},
  {name:"XML", terms:["xml"]},
  {name:"Cybersecurity", terms:["cybersecurity","information security"]},
  {name:"Networking", terms:["computer networks","networking","tcp/ip"]}
];

const STOP_WORDS = new Set(("a an and are as at be by for from has have in into is it its of on or our that the their this to we with will you your looking seeking required requirements preferred responsibilities experience skills skill knowledge ability strong good work working build maintain develop developer development").split(" "));

function normalize(text) {
  return ` ${String(text || "").toLowerCase().replace(/[\u2010-\u2015]/g, "-").replace(/[^a-z0-9+#./\-\s]/g, " ").replace(/\s+/g, " ")} `;
}

function containsTerm(text, term) {
  const source = normalize(text);
  const needle = normalize(term).trim();
  if (!needle) return false;
  // Whitespace padding helps prevent partial matches such as "java" in "javascript".
  return source.includes(` ${needle} `) || source.includes(` ${needle}. `) || source.includes(` ${needle}, `);
}

function getDetectedSkills(text) {
  return SKILLS.filter(skill => skill.terms.some(term => containsTerm(text, term)));
}

function getWords(text) {
  return (String(text || "").match(/\b[\w+#.-]+\b/g) || []).length;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

function updateCounts() {
  resumeCount.textContent = `${resumeText.value.length.toLocaleString()} characters`;
  jobCount.textContent = `${jobText.value.length.toLocaleString()} characters`;
}
resumeText.addEventListener("input", updateCounts);
jobText.addEventListener("input", updateCounts);

resumeFile.addEventListener("change", () => {
  const file = resumeFile.files && resumeFile.files[0];
  $("#resumeFileName").textContent = "";
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".txt") && file.type !== "text/plain") {
    formMessage.textContent = "Please upload a plain-text .txt file. For PDF or DOCX, copy the text into the resume box.";
    resumeFile.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    resumeText.value = String(reader.result || "");
    $("#resumeFileName").textContent = `Loaded: ${file.name}`;
    formMessage.textContent = "";
    updateCounts();
  };
  reader.onerror = () => {
    formMessage.textContent = "The file could not be read. Please paste the resume text instead.";
  };
  reader.readAsText(file);
});

$("#loadSample").addEventListener("click", () => {
  jobText.value = SAMPLE_JOB;
  updateCounts();
  formMessage.textContent = "";
  jobText.focus();
});

function extractJobKeywords(job) {
  const detected = getDetectedSkills(job);
  const normalized = normalize(job);
  const extraPhrases = [
    "software development","web development","front end","frontend","back end","backend",
    "full stack","version control","quality assurance","technical documentation",
    "object oriented programming","data visualization","responsive design","software testing"
  ];
  const extras = extraPhrases
    .filter(phrase => containsTerm(normalized, phrase))
    .map(name => ({name: name.replace(/\b\w/g, c => c.toUpperCase()), terms:[name]}));
  const unique = new Map();
  [...detected, ...extras].forEach(skill => unique.set(skill.name.toLowerCase(), skill));
  return [...unique.values()];
}

function analyze() {
  const resume = resumeText.value.trim();
  const job = jobText.value.trim();
  formMessage.textContent = "";
  if (resume.length < 30) {
    formMessage.textContent = "Please enter at least 30 characters of resume text.";
    resumeText.focus();
    return;
  }
  if (job.length < 30) {
    formMessage.textContent = "Please enter a job description with at least 30 characters.";
    jobText.focus();
    return;
  }

  const jobKeywords = extractJobKeywords(job);
  if (jobKeywords.length === 0) {
    formMessage.textContent = "No recognized skills or keywords were found in the job description. Try including more specific requirements such as Java, SQL, or communication.";
    return;
  }

  const matched = jobKeywords.filter(skill => skill.terms.some(term => containsTerm(resume, term)));
  const missing = jobKeywords.filter(skill => !matched.some(item => item.name === skill.name));
  const score = Math.round((matched.length / jobKeywords.length) * 100);
  const detected = getDetectedSkills(resume);
  const report = {
    date: new Date().toLocaleString(),
    score,
    matched: matched.map(x => x.name),
    missing: missing.map(x => x.name),
    resumeWords: getWords(resume),
    resumeChars: resume.length,
    detectedCount: detected.length,
    jobKeywordCount: jobKeywords.length,
    role: guessRole(job)
  };

  renderReport(report);
  saveHistory(report);
  renderHistory();
  results.hidden = false;
  results.scrollIntoView({behavior:"smooth", block:"start"});
}

function guessRole(job) {
  const firstLine = job.split(/\n/).map(line => line.trim()).find(Boolean) || "Target job";
  return firstLine.length > 60 ? firstLine.slice(0,57) + "..." : firstLine;
}

function renderChips(element, items, isMissing) {
  if (!items.length) {
    element.innerHTML = `<div class="empty-state">${isMissing ? "Great! No recognized keyword gaps were found in this comparison." : "No matching keywords found yet. Review the job description and resume text."}</div>`;
    return;
  }
  element.innerHTML = items.map(name => `<span class="skill-chip${isMissing ? " missing" : ""}">${escapeHtml(name)}</span>`).join("");
}

function renderReport(report) {
  $("#matchScore").innerHTML = `${report.score}<sup>%</sup>`;
  $("#resultRing").style.background = `conic-gradient(var(--primary) 0 ${report.score}%, #e8edfa ${report.score}% 100%)`;
  $("#scoreTitle").textContent = report.score >= 75 ? "Strong keyword alignment" : report.score >= 45 ? "Room to strengthen your match" : "Opportunity to improve alignment";
  $("#scoreDescription").textContent = `Matched ${report.matched.length} of ${report.jobKeywordCount} recognized job keywords.`;
  $("#matchedCount").innerHTML = `${report.matched.length} <span>matched</span>`;
  $("#matchProgress").style.width = `${report.score}%`;
  $("#coverageLabel").textContent = `${report.score}%`;
  $("#wordCount").innerHTML = `${report.resumeWords} <span>words</span>`;
  $("#charCount").textContent = report.resumeChars.toLocaleString();
  $("#detectedCount").textContent = report.detectedCount;
  $("#reportMeta").textContent = `${report.role} · Generated ${report.date}`;
  renderChips($("#matchedSkills"), report.matched, false);
  renderChips($("#missingSkills"), report.missing, true);
  renderSuggestions(report);
  $("#downloadReport").dataset.report = JSON.stringify(report);
}

function renderSuggestions(report) {
  const suggestions = [];
  if (report.missing.length) {
    suggestions.push(`Review the missing terms: ${report.missing.slice(0,8).join(", ")}. Add them only if they accurately describe your skills or experience.`);
  } else {
    suggestions.push("No recognized skill gaps were detected. Review the job description manually for responsibilities and qualifications beyond keywords.");
  }
  if (report.resumeWords < 150) {
    suggestions.push("Your resume text is quite short. Consider including relevant projects, education, certifications, and specific accomplishments where applicable.");
  } else if (report.resumeWords > 900) {
    suggestions.push("Your resume text is lengthy. Consider making it concise and prioritizing experience relevant to this role.");
  } else {
    suggestions.push("Use concise bullet points that describe what you built, the tools you used, and measurable results when you can support them.");
  }
  suggestions.push("Use consistent headings such as Summary, Skills, Projects, Education, and Experience to make the resume easier to scan.");
  suggestions.push("Proofread dates, spelling, links, and formatting. Tailor the resume to this role without claiming skills you do not have.");
  $("#suggestionsList").innerHTML = suggestions.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function getHistory() {
  try {
    const data = JSON.parse(localStorage.getItem("careerlens-history") || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveHistory(report) {
  const history = getHistory();
  history.unshift({
    date: report.date,
    score: report.score,
    role: report.role,
    matchedCount: report.matched.length,
    missingCount: report.missing.length
  });
  try {
    localStorage.setItem("careerlens-history", JSON.stringify(history.slice(0,5)));
  } catch {
    formMessage.textContent = "Report created, but browser storage is unavailable. You can still download the report.";
  }
}

function renderHistory() {
  const history = getHistory();
  const list = $("#historyList");
  if (!history.length) {
    list.innerHTML = `<div class="empty-state">No saved reports yet. Analyze a resume to add one.</div>`;
    return;
  }
  list.innerHTML = history.map(item => `
    <div class="history-item">
      <div><strong>${escapeHtml(item.role)}</strong><small>${escapeHtml(item.date)} · ${item.matchedCount} matched · ${item.missingCount} gaps</small></div>
      <span class="history-score">${Number(item.score)}%</span>
    </div>`).join("");
}

$("#analyzeBtn").addEventListener("click", analyze);

$("#downloadReport").addEventListener("click", () => {
  const raw = $("#downloadReport").dataset.report;
  if (!raw) return;
  const report = JSON.parse(raw);
  const content = [
    "CAREERLENS — RESUME COMPATIBILITY REPORT",
    `Generated: ${report.date}`,
    `Target role: ${report.role}`,
    "",
    `Keyword match score: ${report.score}%`,
    `Matched keywords (${report.matched.length}/${report.jobKeywordCount}): ${report.matched.join(", ") || "None"}`,
    `Potential keyword gaps (${report.missing.length}): ${report.missing.join(", ") || "None detected"}`,
    "",
    `Resume word count: ${report.resumeWords}`,
    `Resume character count: ${report.resumeChars}`,
    `Recognized resume skills: ${report.detectedCount}`,
    "",
    "Suggestions:",
    ...buildPlainSuggestions(report).map((s, i) => `${i+1}. ${s}`),
    "",
    "Disclaimer: Educational keyword analysis only. This score does not predict hiring outcomes. Only claim skills you genuinely have."
  ].join("\n");
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "CareerLens-Report.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

function buildPlainSuggestions(report) {
  if (!report.missing.length) {
    return ["No recognized skill gaps were detected; manually review responsibilities and qualifications too."];
  }
  return [
    `Review these terms and add only those that accurately describe your skills: ${report.missing.slice(0,8).join(", ")}.`,
    "Use concise project bullets to explain what you built, tools used, and outcomes.",
    "Proofread dates, spelling, links, and formatting before applying."
  ];
}

$("#printReport").addEventListener("click", () => window.print());

$("#clearHistory").addEventListener("click", () => {
  localStorage.removeItem("careerlens-history");
  renderHistory();
});

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  $("#themeToggle").setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem("careerlens-theme", isDark ? "dark" : "light"); } catch {}
});

try {
  if (localStorage.getItem("careerlens-theme") === "dark") document.body.classList.add("dark");
} catch {}

$("#year").textContent = new Date().getFullYear();
updateCounts();
renderHistory();
