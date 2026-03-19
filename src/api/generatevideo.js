export const generateVideo = async (prompt) => {
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: "r8_FgZyAFlUCrgxoznobM5FbNhlyYUzqme2DB0kCY",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a16z-infra/latent-video-diffusion",
        input: {
          prompt: prompt,
        },
      }),
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("AI error:", err);
    return null;
  }
};