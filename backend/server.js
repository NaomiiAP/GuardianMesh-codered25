const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to run the 'ls' command
app.get("/run-ls", (req, res) => {
    exec("docker exec hackathon-node1-1 cat blacklisted_macs.log", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`LS Output: ${stdout}`);
        res.json({ output: stdout });
    });
});

app.get("/run-log1", (req, res) => {
    exec("docker exec hackathon-node1-1 cat blacklisted_macs.log", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`LS Output: ${stdout}`);
        res.json({ output: stdout });
    });
});

app.get("/run-log2", (req, res) => {
    exec("docker exec hackathon-node2-1 cat blacklisted_macs.log", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`LS Output: ${stdout}`);
        res.json({ output: stdout });
    });
});

app.get("/run-log3", (req, res) => {
    exec("docker exec hackathon-node3-1 cat blacklisted_macs.log", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`LS Output: ${stdout}`);
        res.json({ output: stdout });
    });
});



const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
