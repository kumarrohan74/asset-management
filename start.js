const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";

const projectRoot = __dirname;
const backendDir = path.join(projectRoot, "backend");
const frontendDir = path.join(projectRoot, "frontend");

const venvDir = path.join(backendDir, "venv");

const pythonPath = isWindows
  ? path.join(venvDir, "Scripts", "python.exe")
  : path.join(venvDir, "bin", "python");

const npmCommand = isWindows ? "npm.cmd" : "npm";

let backendProcess = null;
let frontendProcess = null;

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  child.on("error", (error) => {
    console.error(`Failed to start ${command}:`, error.message);
  });

  return child;
}

function waitForProcess(child, errorMessage) {
  return new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(errorMessage));
      }
    });
  });
}

function commandExists(command) {
  return new Promise((resolve) => {
    const checkCommand = isWindows ? "where" : "which";

    const child = spawn(checkCommand, [command], {
      stdio: "ignore",
      shell: false,
    });

    child.on("exit", (code) => {
      resolve(code === 0);
    });

    child.on("error", () => {
      resolve(false);
    });
  });
}

async function checkPython() {
  const pythonCommands = isWindows
    ? ["python", "py"]
    : ["python3", "python"];

  for (const command of pythonCommands) {
    if (await commandExists(command)) {
      return command;
    }
  }

  return null;
}

async function setupBackend(pythonCommand) {
  let needsInstall = false;

  if (!fs.existsSync(pythonPath)) {
    console.log("");
    console.log("Python virtual environment not found.");
    console.log("Creating backend virtual environment...");
    console.log("");

    const venvProcess = run(
      pythonCommand,
      ["-m", "venv", "venv"],
      {
        cwd: backendDir,
      }
    );

    await waitForProcess(
      venvProcess,
      "Failed to create Python virtual environment."
    );

    needsInstall = true;
  }

  if (needsInstall) {
    console.log("");
    console.log("Installing backend dependencies...");
    console.log("");

    const pipProcess = run(
      pythonPath,
      ["-m", "pip", "install", "-r", "requirements.txt"],
      {
        cwd: backendDir,
      }
    );

    await waitForProcess(
      pipProcess,
      "Failed to install backend dependencies."
    );
  }
}

async function setupFrontend() {
  const nodeModulesPath = path.join(
    frontendDir,
    "node_modules"
  );

  if (!fs.existsSync(nodeModulesPath)) {
    console.log("");
    console.log("Frontend dependencies not found.");
    console.log("Installing frontend dependencies...");
    console.log("");

    const npmInstallProcess = run(
      npmCommand,
      ["install"],
      {
        cwd: frontendDir,
      }
    );

    await waitForProcess(
      npmInstallProcess,
      "Failed to install frontend dependencies."
    );
  }
}

function printStartupInformation() {
  console.log("");
  console.log("========================================");
  console.log(" Asset Management System");
  console.log("========================================");
  console.log("");
  console.log(" Frontend : http://localhost:5173");
  console.log(" Backend  : http://127.0.0.1:8000");
  console.log(" Swagger  : http://127.0.0.1:8000/docs");
  console.log(" Database : database/asset_management.db");
  console.log("");
  console.log(" Press Ctrl+C to stop the application.");
  console.log("");
  console.log("========================================");
  console.log("");
}

function shutdown() {
  console.log("");
  console.log("Stopping Asset Management System...");

  if (backendProcess) {
    backendProcess.kill();
  }

  if (frontendProcess) {
    frontendProcess.kill();
  }

  process.exit(0);
}

async function startApplication() {
  console.log("");
  console.log("========================================");
  console.log(" Starting Asset Management System");
  console.log("========================================");
  console.log("");

  // Check Python
  const pythonCommand = await checkPython();

  if (!pythonCommand) {
    console.error("ERROR: Python is not installed.");
    console.error("");
    console.error(
      "Please install Python and then run:"
    );
    console.error("");
    console.error("    npm run start");
    console.error("");

    process.exit(1);
  }

  console.log("Python : OK");

  // Node/npm is already available because this script
  // was launched through npm.
  console.log("Node.js: OK");

  try {
    // Backend setup
    await setupBackend(pythonCommand);

    console.log("Backend: Ready");

    // Frontend setup
    await setupFrontend();

    console.log("Frontend: Ready");

    // Start backend
    console.log("");
    console.log("Starting backend...");

    backendProcess = run(
      pythonPath,
      [
        "-m",
        "uvicorn",
        "app.main:app",
        "--reload",
      ],
      {
        cwd: backendDir,
      }
    );

    // Start frontend
    console.log("Starting frontend...");

    frontendProcess = run(
      npmCommand,
      [
        "run",
        "dev",
      ],
      {
        cwd: frontendDir,
      }
    );

    printStartupInformation();
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error(" Startup failed");
    console.error("========================================");
    console.error("");
    console.error(error.message);
    console.error("");

    shutdown();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startApplication();