const OPENROUTER_API_KEY = "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";

async function generateStudyPlan(goal, time, energy) {
  const systemPrompt = `
You are TinyStudy, a gentle AI study coach.
You turn the user's study goal into a cozy, realistic plan.
Tone: soft, validating, encouraging, zero pressure.
`;

  const userPrompt = `
Goal: ${goal}
Time available: ${time}
Mood: ${energy}

Create:
• Cute study plan title
• 3 tiny realistic steps
• Estimated pacing
• Gentle encouragement
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost",   
      "X-Title": "TinyStudy AI",            
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-nano-12b-v2-vl:free", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.85
    })
  });

  const data = await response.json();
  console.log("API raw:", data);

  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.delta?.content ||
    "Failed to generate.";

  return content;
}


const goalInput = document.getElementById("goal");
const timeInput = document.getElementById("time");
const energySelect = document.getElementById("energy");
const generateBtn = document.getElementById("generateBtn");
const outputBox = document.getElementById("output");
const statusBadge = document.getElementById("statusBadge");

generateBtn.addEventListener("click", async () => {
  console.log("Button clicked");

  const goal = goalInput.value.trim();
  const time = timeInput.value.trim();
  const energy = energySelect.value;

  if (!goal || !time || !energy) {
    outputBox.textContent = "Please fill all fields ❤️";
    statusBadge.textContent = "Missing info";
    statusBadge.classList.remove("loading", "ready");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "✨ Planning your session…";
  statusBadge.textContent = "Thinking...";
  statusBadge.classList.add("loading");
  statusBadge.classList.remove("ready");
  outputBox.textContent = "Generating your gentle study plan...";

  try {
    const plan = await generateStudyPlan(goal, time, energy);
    outputBox.innerHTML = plan.replace(/\n/g, "<br>");
    statusBadge.textContent = "Plan ready";
    statusBadge.classList.remove("loading");
    statusBadge.classList.add("ready");
  } catch (err) {
    console.error(err);
    outputBox.textContent = "Something went wrong, Try again.";
    statusBadge.textContent = "Error";
    statusBadge.classList.remove("loading", "ready");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate my gentle study plan";
  }
});
