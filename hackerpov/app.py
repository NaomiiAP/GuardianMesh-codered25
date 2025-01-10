from flask import Flask, render_template, request, jsonify
import subprocess

app = Flask(__name__)

# Global variable to store the container ID
container_id = None

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/setup-container", methods=["POST"])
def setup_container():
    global container_id
    try:
        # Step 1: Run the Docker container in detached mode
        run_container_command = [
            "docker", "run", "--rm", "-dit", "--network", "hackathon_my_network", "debian", "bash"
        ]
        container_id = subprocess.check_output(run_container_command, text=True).strip()
        
        # Step 2: Update apt-get in the container
        subprocess.run(["docker", "exec", container_id, "apt-get", "update"], check=True)
        
        # Step 3: Install hping3 in the container
        subprocess.run(["docker", "exec", container_id, "apt-get", "install", "-y", "hping3"], check=True)
        
        return jsonify({"status": "success", "message": "Container setup and hping3 installed."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/run-hping3", methods=["POST"])
def run_hping3():
    global container_id
    if not container_id:
        return jsonify({"status": "error", "message": "Container is not set up yet!"}), 400
    
    # Get the node address from the POST request
    node = request.json.get("node")
    if not node:
        return jsonify({"status": "error", "message": "No node specified!"}), 400

    try:
        # Run the hping3 command for the specified node
        hping3_command = [
            "docker", "exec", container_id, "hping3", "-S", "-p", "80", "-i", "u1000", node
        ]
        subprocess.run(hping3_command, check=True)
        return jsonify({"status": "success", "message": f"hping3 command executed for {node}."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/stop-hping3", methods=["POST"])
def stop_hping3():
    global container_id
    if not container_id:
        return jsonify({"status": "error", "message": "Container is not set up yet!"}), 400
    
    node = request.json.get("node")
    if not node:
        return jsonify({"status": "error", "message": "No node specified!"}), 400

    try:
        # Ensure procps and sudo are installed
        subprocess.run(["docker", "exec", container_id, "apt-get", "install", "-y", "procps", "sudo"], check=True)

        # Attempt to stop the hping3 process
        pkill_command = [
            "docker", "exec", container_id, "sudo", "pkill", "-f", f"hping3.*{node}"
        ]
        subprocess.run(pkill_command, check=True)
        
        return jsonify({"status": "success", "message": f"hping3 process stopped for {node}."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
