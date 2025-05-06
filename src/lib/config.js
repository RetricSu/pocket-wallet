import * as toml from "toml";

// Function to fetch and parse the TOML file
export const getConfig = async () => {
  try {
    // Fetch the TOML file directly as text
    const response = await fetch("/src/lib/config.toml");
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }

    const configText = await response.text();
    console.log("Raw TOML content:", configText);

    // Parse the TOML content
    const config = toml.parse(configText);
    return config;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
};
