const editor = document.getElementById("editor");
const output = document.getElementById("output");
const status = document.getElementById("status");
const runButton = document.getElementById("runButton");
const clearButton = document.getElementById("clearButton");

runButton.addEventListener("click", async () => {
  runButton.disabled = true;
  status.textContent = "Running...";
  output.textContent = "";

  try {
    const result = await window.executor.run(editor.value);
    output.textContent = result.error
      ? `${result.output ? `${result.output}\n\n` : ""}Error: ${result.error}`
      : result.output;
    status.textContent = result.ok ? "Completed" : "Failed";
  } catch (error) {
    output.textContent = `Executor error: ${error.message}`;
    status.textContent = "Failed";
  } finally {
    runButton.disabled = false;
  }
});

clearButton.addEventListener("click", () => {
  editor.value = "";
  output.textContent = "Ready to run.";
  status.textContent = "Ready";
});
