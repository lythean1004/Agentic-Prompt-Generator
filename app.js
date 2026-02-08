const architectureText = `User Input
   │
   ▼
[State Tracker]──stores→ user_intent, iteration_count, agent_feedback, convergence_score
   │
   ▼
[Agent A: ChatGPT Free] ⇄ [Agent B: Gemini Pro]
   │        ▲                  │
   │        └─ critique + improvements + rationale
   ▼
[Convergence Gate]
   │  stop if marginal improvement < threshold
   ▼
[Final Synthesizer]
   │
   ▼
[UI Outputs: prompt, change log, rationale, risks, tips]`;

const algorithmText = `initialize state(user_intent, iteration_count=0)
set threshold = 12% marginal improvement
for round in 1..3:
  agentA = generateDraft(user_input, round)
  agentB = generateDraft(user_input, round)
  critiqueA = critique(agentB, principles)
  critiqueB = critique(agentA, principles)
  improvements = merge(agentA, agentB, critiques)
  update convergence_score from overlap + change impact
  state.iteration_count += 1
  if convergence_score >= (100 - threshold):
      break
final_prompt = synthesize(improvements, hierarchy, safety checks)
render outputs + logs + rationale + risks + tips`;

const frontendFlow = [
  "User lands on orchestration dashboard and reviews architecture and templates.",
  "User submits intake form with purpose, format, domain, and constraints.",
  "System runs 2-3 bidirectional critique rounds and updates state tracking.",
  "User reviews agent outputs side-by-side, plus highlighted diffs.",
  "User inspects final prompt, change log, rationale, risks, and tips.",
  "User exports or re-runs with updated inputs."
];

const templates = [
  {
    title: "Agent A Template (ChatGPT Free)",
    body: `Role: Practical prompt optimizer.
Objective: Deliver concise, feasible prompt improvements.
Process:
1) Draft prompt from user_intent.
2) Flag real-world feasibility issues.
3) Compress instructions without losing control.
4) Provide critique of Agent B with concrete edits + why.`
  },
  {
    title: "Agent B Template (Gemini Pro)",
    body: `Role: Structured reasoning prompt architect.
Objective: Build robust instruction hierarchy and failure-mode prevention.
Process:
1) Draft prompt with explicit steps and clarifying questions.
2) Identify missing constraints or ambiguous scope.
3) Offer critique of Agent A emphasizing logic gaps.
4) Provide improvements + reasoning principles.`
  }
];

const exampleInput = {
  purpose: "Design a market research brief for a new AI-enabled fitness app.",
  format: "Provide a bullet-point brief with sections: audience, differentiation, risks, and next steps.",
  domain: "Consumer tech / fitness",
  constraints: "Executive tone, <= 350 words, avoid unverified claims, include data gaps."
};

const principles = [
  "Clarity",
  "Instruction hierarchy",
  "Role anchoring",
  "Output controllability",
  "Failure-mode prevention"
];

const state = {
  user_intent: "",
  iteration_count: 0,
  agent_feedback: "",
  convergence_score: 0
};

const elements = {
  form: document.getElementById("prompt-form"),
  purpose: document.getElementById("purpose"),
  format: document.getElementById("format"),
  domain: document.getElementById("domain"),
  constraints: document.getElementById("constraints"),
  iterations: document.getElementById("iterations"),
  compareA: document.getElementById("compare-a"),
  compareB: document.getElementById("compare-b"),
  diff: document.getElementById("diff"),
  finalPrompt: document.getElementById("final-prompt"),
  changeLog: document.getElementById("change-log"),
  rationale: document.getElementById("rationale"),
  risks: document.getElementById("risks"),
  tips: document.getElementById("tips"),
  exampleRun: document.getElementById("example-run")
};

const stateElements = {
  intent: document.getElementById("state-intent"),
  iterations: document.getElementById("state-iterations"),
  feedback: document.getElementById("state-feedback"),
  convergence: document.getElementById("state-convergence")
};

function updateStaticContent() {
  document.getElementById("architecture").textContent = architectureText;
  document.getElementById("algorithm").textContent = algorithmText;

  const templatesContainer = document.getElementById("templates");
  templatesContainer.innerHTML = "";
  templates.forEach((template) => {
    const card = document.createElement("article");
    card.innerHTML = `<h3>${template.title}</h3><pre>${template.body}</pre>`;
    templatesContainer.appendChild(card);
  });

  const flowList = document.getElementById("frontend-flow");
  flowList.innerHTML = "";
  frontendFlow.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    flowList.appendChild(li);
  });

  renderExample();
}

function renderExample() {
  elements.exampleRun.innerHTML = `
    <strong>Sample Input</strong>
    <pre>${JSON.stringify(exampleInput, null, 2)}</pre>
    <p>Use the “Load Example” button to populate the form with this input.</p>
  `;
}

function updateStateDisplay() {
  stateElements.intent.textContent = state.user_intent || "Waiting for input";
  stateElements.iterations.textContent = state.iteration_count;
  stateElements.feedback.textContent = state.agent_feedback || "None";
  stateElements.convergence.textContent = `${state.convergence_score}%`;
}

function buildIntent({ purpose, format, domain, constraints }) {
  const domainText = domain ? `Domain: ${domain}. ` : "Domain: Any. ";
  const constraintText = constraints ? `Constraints: ${constraints}.` : "Constraints: none.";
  return `${purpose} ${format} ${domainText}${constraintText}`.trim();
}

function generateDraft(agent, input, round) {
  const base = `Goal: ${input.purpose}
Output format: ${input.format}
${input.domain ? `Domain focus: ${input.domain}` : "Domain focus: Any"}
Constraints: ${input.constraints || "None"}
`;

  if (agent === "A") {
    return `${base}
Draft (${agent}, round ${round}):
- Use direct instructions with minimal ambiguity.
- Keep only high-value steps.
- Include a short checklist for feasibility.
- End with a validation question for the user.`;
  }

  return `${base}
Draft (${agent}, round ${round}):
- Build a stepwise instruction hierarchy.
- Add guardrails against hallucinations.
- Specify output sections and ordering.
- Include a reflection step to catch gaps.`;
}

function critique(agent, counterpartDraft) {
  const critiquePoints = [
    "Clarify ambiguous scope to prevent drift.",
    "Ensure instruction hierarchy is explicit.",
    "Add output controllability via numbered sections.",
    "Tighten role anchoring for domain expertise.",
    "Add a failure-mode checklist to reduce omissions."
  ];

  return `${agent} critique of counterpart:
- ${critiquePoints.slice(0, 3).join("\n- ")}
Why it helps:
- ${principles.slice(0, 3).join(", ")} improve execution fidelity.`;
}

function proposeImprovements(agent) {
  return [
    `${agent}: Add explicit instruction hierarchy with priority tags (must/should/optional).`,
    `${agent}: Replace vague verbs with action-oriented directives.`,
    `${agent}: Introduce a final verification checklist for completeness.`
  ];
}

function computeConvergence(previousText, newText) {
  if (!previousText) return 0;
  const prevWords = new Set(previousText.split(/\s+/));
  const newWords = new Set(newText.split(/\s+/));
  const intersection = [...prevWords].filter((word) => newWords.has(word));
  const overlap = intersection.length / Math.max(prevWords.size, 1);
  return Math.round(overlap * 100);
}

function synthesizeFinal(agentA, agentB, input) {
  return `You are an expert prompt engineer tasked with creating a single, elite prompt.

User intent: ${input.purpose}
Desired output: ${input.format}
Domain: ${input.domain || "Any"}
Constraints: ${input.constraints || "None"}

Instructions (priority order):
1) MUST: Follow the specified output format exactly.
2) MUST: Surface assumptions and data gaps explicitly.
3) SHOULD: Use domain-accurate language and concise structure.
4) SHOULD: Include a short verification checklist.
5) OPTIONAL: Offer 1-2 questions if clarifications are required.

Output format:
- Section 1: Summary of intent
- Section 2: Structured response with labeled bullets
- Section 3: Risks, unknowns, and mitigation prompts
- Section 4: Verification checklist

Quality checks:
- Ensure clarity, instruction hierarchy, and role anchoring are explicit.
- Prevent failure modes (missing constraints, vague outputs, unsupported claims).
- Keep within length/tone constraints.

Context for reference (Agent A):
${agentA}

Context for reference (Agent B):
${agentB}`;
}

function buildChangeLog() {
  return [
    {
      before: "Implicit instructions",
      after: "Priority-tagged MUST/SHOULD/OPTIONAL hierarchy",
      reason: "Improves instruction hierarchy and controllability."
    },
    {
      before: "Generic output description",
      after: "Explicit output sections with labeled bullets",
      reason: "Boosts clarity and reduces ambiguity."
    },
    {
      before: "No validation layer",
      after: "Verification checklist and risk surfacing",
      reason: "Prevents failure modes and omissions."
    }
  ];
}

function diffWords(a, b) {
  const aWords = a.split(/(\s+)/);
  const bWords = b.split(/(\s+)/);
  const table = Array.from({ length: aWords.length + 1 }, () =>
    Array(bWords.length + 1).fill(0)
  );

  for (let i = 1; i <= aWords.length; i += 1) {
    for (let j = 1; j <= bWords.length; j += 1) {
      if (aWords[i - 1] === bWords[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }

  const output = [];
  let i = aWords.length;
  let j = bWords.length;

  while (i > 0 && j > 0) {
    if (aWords[i - 1] === bWords[j - 1]) {
      output.unshift({ type: "same", value: aWords[i - 1] });
      i -= 1;
      j -= 1;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      output.unshift({ type: "remove", value: aWords[i - 1] });
      i -= 1;
    } else {
      output.unshift({ type: "add", value: bWords[j - 1] });
      j -= 1;
    }
  }

  while (i > 0) {
    output.unshift({ type: "remove", value: aWords[i - 1] });
    i -= 1;
  }

  while (j > 0) {
    output.unshift({ type: "add", value: bWords[j - 1] });
    j -= 1;
  }

  return output
    .map((part) => {
      if (part.type === "add") {
        return `<span class="add">${part.value}</span>`;
      }
      if (part.type === "remove") {
        return `<span class="remove">${part.value}</span>`;
      }
      return part.value;
    })
    .join("");
}

function renderIterations(iterations) {
  elements.iterations.innerHTML = "";
  iterations.forEach((round) => {
    const card = document.createElement("article");
    card.className = "iteration-card";
    card.innerHTML = `
      <h3>Round ${round.round}</h3>
      <div class="grid two">
        <div>
          <h4>Agent A Draft</h4>
          <pre>${round.agentA}</pre>
        </div>
        <div>
          <h4>Agent B Draft</h4>
          <pre>${round.agentB}</pre>
        </div>
      </div>
      <details>
        <summary>Mutual Critiques & Improvements</summary>
        <div class="grid two">
          <div>
            <h4>Agent A critique</h4>
            <pre>${round.critiqueA}</pre>
          </div>
          <div>
            <h4>Agent B critique</h4>
            <pre>${round.critiqueB}</pre>
          </div>
        </div>
        <div>
          <h4>Concrete improvements</h4>
          <ul>
            ${round.improvements.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </details>
    `;
    elements.iterations.appendChild(card);
  });
}

function renderFinalOutput(finalPrompt, changeLog) {
  elements.finalPrompt.textContent = finalPrompt;

  elements.changeLog.innerHTML = changeLog
    .map(
      (entry) => `
      <div class="iteration-card">
        <strong>${entry.before}</strong> → <strong>${entry.after}</strong>
        <p>${entry.reason}</p>
      </div>
    `
    )
    .join("");

  elements.rationale.innerHTML = changeLog
    .map((entry) => `<div class="iteration-card">${entry.reason}</div>`)
    .join("");

  elements.risks.innerHTML = [
    "Domain-specific data may require clarification.",
    "Output length could exceed constraints if inputs are verbose.",
    "Assumption surfacing depends on user-provided context."
  ]
    .map((risk) => `<li>${risk}</li>`)
    .join("");

  elements.tips.innerHTML = [
    "Best with models that support instruction hierarchy (GPT-4 class, Gemini Pro, Claude).",
    "Use temperature 0.2-0.4 for precision and consistency.",
    "Provide supplemental context (data, constraints) for top-tier results."
  ]
    .map((tip) => `<li>${tip}</li>`)
    .join("");
}

function runOrchestration(input) {
  state.user_intent = buildIntent(input);
  state.iteration_count = 0;
  state.convergence_score = 0;

  const iterations = [];
  let lastMerged = "";

  for (let round = 1; round <= 3; round += 1) {
    const agentA = generateDraft("A", input, round);
    const agentB = generateDraft("B", input, round);
    const critiqueA = critique("Agent A", agentB);
    const critiqueB = critique("Agent B", agentA);
    const improvements = [...proposeImprovements("Agent A"), ...proposeImprovements("Agent B")];
    const merged = `${agentA}\n\n${agentB}\n\n${improvements.join("\n")}`;

    state.iteration_count += 1;
    state.agent_feedback = `Round ${round}: critiques and improvements captured.`;
    state.convergence_score = computeConvergence(lastMerged, merged);

    iterations.push({
      round,
      agentA,
      agentB,
      critiqueA,
      critiqueB,
      improvements,
      convergence: state.convergence_score
    });

    lastMerged = merged;

    if (state.convergence_score >= 88) {
      break;
    }
  }

  updateStateDisplay();
  renderIterations(iterations);

  const finalPrompt = synthesizeFinal(
    iterations.at(-1).agentA,
    iterations.at(-1).agentB,
    input
  );

  elements.compareA.textContent = iterations.at(-1).agentA;
  elements.compareB.textContent = iterations.at(-1).agentB;
  elements.diff.innerHTML = diffWords(iterations.at(-1).agentA, iterations.at(-1).agentB);

  const changeLog = buildChangeLog();
  renderFinalOutput(finalPrompt, changeLog);
}

function resetForm() {
  elements.form.reset();
  elements.iterations.innerHTML = "";
  elements.compareA.textContent = "";
  elements.compareB.textContent = "";
  elements.diff.innerHTML = "";
  elements.finalPrompt.textContent = "";
  elements.changeLog.innerHTML = "";
  elements.rationale.innerHTML = "";
  elements.risks.innerHTML = "";
  elements.tips.innerHTML = "";
  state.user_intent = "";
  state.iteration_count = 0;
  state.agent_feedback = "";
  state.convergence_score = 0;
  updateStateDisplay();
}

updateStaticContent();
updateStateDisplay();

if (elements.form) {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    runOrchestration({
      purpose: elements.purpose.value.trim(),
      format: elements.format.value.trim(),
      domain: elements.domain.value.trim(),
      constraints: elements.constraints.value.trim()
    });
  });
}

document.getElementById("run-example").addEventListener("click", () => {
  elements.purpose.value = exampleInput.purpose;
  elements.format.value = exampleInput.format;
  elements.domain.value = exampleInput.domain;
  elements.constraints.value = exampleInput.constraints;
  runOrchestration(exampleInput);
});

document.getElementById("reset").addEventListener("click", resetForm);
