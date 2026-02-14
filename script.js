// script.js

const input = document.getElementById("fileUpload");
const preview = document.getElementById("preview");
const resultEl = document.getElementById("result");

// TODO: replace with your Lambda Function URL
const LAMBDA_URL = "https://xoit3b5ymnyfrfbpk7ix4hzjxy0hjbpm.lambda-url.us-east-1.on.aws/";

// ⚠️ If you put an API key in frontend code, anyone can see it.
// For hackathon demo it's okay, but for real use put this behind your own backend/proxy.
const API_KEY = "hackz_26";

input.addEventListener("change", async () => {
  const file = input.files[0];
  if (!file) return;

  // Preview image
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

  resultEl.textContent = "Uploading + extracting...";

  try {
    // Convert image -> base64 (without the "data:image/...;base64," prefix)
    const base64 = await fileToBase64(file);

    const payload = {
      image_base64: base64,
      media_type: file.type || "image/jpeg",
    };

    const res = await fetch(LAMBDA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Lambda error ${res.status}: ${text}`);
    }

    const data = await res.json();

    // Pretty print the whole response
    resultEl.textContent = JSON.stringify(data, null, 2);

    // If your lambda returns { ok: true, result: {...} }, you can also do:
    // resultEl.textContent = JSON.stringify(data.result, null, 2);

  } catch (err) {
    console.error(err);
    resultEl.textContent = `Failed: ${err.message}`;
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File read failed"));
    reader.onload = () => {
      const dataUrl = reader.result; // "data:image/jpeg;base64,...."
      const base64 = String(dataUrl).split(",")[1]; // remove prefix
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
