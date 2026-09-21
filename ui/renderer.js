const editor = document.getElementById("editor");
const output = document.getElementById("output");
const status = document.getElementById("status");
const runButton = document.getElementById("runButton");
const clearButton = document.getElementById("clearButton");
const floatingButton = document.getElementById("floatingButton");
const updateButton = document.getElementById("updateButton");

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

floatingButton.addEventListener("click", async () => {
  const visible = await window.executor.toggleFloating();
  floatingButton.textContent = visible ? "Hide Output" : "Float Output";
});

updateButton.addEventListener("click", async () => {
  updateButton.disabled = true;
  status.textContent = await window.executor.checkForUpdates();
  updateButton.disabled = false;
});

window.executor.onUpdateStatus((message) => {
  status.textContent = message;
});
