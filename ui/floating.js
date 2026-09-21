const floatingOutput = document.getElementById("floatingOutput");

window.executor.onFloatingOutput((result) => {
  const value = result;
  floatingOutput.textContent = value.error
    ? `${value.output ? `${value.output}\n\n` : ""}Error: ${value.error}`
    : value.output;
});
