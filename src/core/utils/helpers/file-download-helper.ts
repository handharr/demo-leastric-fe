// Fetch file as blob
export async function pdfDownloadHelper(
  stringUrl: string,
  fileName: string
): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("This function can only be used in a browser environment");
  }

  // Fetch the file as blob
  const response = await fetch(stringUrl, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();

  // Create object URL
  const url = window.URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return Promise.resolve();
}
