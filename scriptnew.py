import socket
import struct
import time
import json
import threading
import subprocess
import logging

# Threshold for detecting compromised node (e.g., 1000 bytes or 100 packets per second)
TRAFFIC_THRESHOLD_BYTES = 1000
TRAFFIC_THRESHOLD_PACKETS = 50

# Dictionary to store traffic statistics
traffic_stats = {}

# Dictionary to store isolated status
isolated_nodes = {}

# Lock for thread safety
lock = threading.Lock()

# Set up logging
LOG_FILE_PATH = '/app/blacklisted_macs.log'
ACTION_LOG_FILE_PATH = '/app/node_actions.log'
logging.basicConfig(filename=LOG_FILE_PATH, level=logging.INFO, 
                    format='%(asctime)s - Blacklisted MAC: %(message)s')

def parse_ethernet_header(packet):
    """Extract Source MAC, Destination MAC, and Ethernet protocol."""
    eth_length = 14  # Ethernet header length
    eth_header = packet[:eth_length]
    eth = struct.unpack('!6s6sH', eth_header)
    dest_mac = ':'.join(format(b, '02x') for b in eth[0])  # Destination MAC
    src_mac = ':'.join(format(b, '02x') for b in eth[1])   # Source MAC
    eth_protocol = socket.ntohs(eth[2])
    return src_mac, dest_mac, eth_protocol, packet[eth_length:]

def update_stats(src_mac, dest_mac, packet_len, direction):
    """Update traffic statistics for a communication."""
    key = (src_mac, dest_mac)
    with lock:
        if key not in traffic_stats:
            traffic_stats[key] = {
                "BytesSent": 0, "BytesReceived": 0, "PacketsSent": 0, "PacketsReceived": 0, "StartTime": None, "Duration": 0
            }
        
        stats = traffic_stats[key]
        current_time = time.time()
        
        if stats["StartTime"] is None:
            stats["StartTime"] = current_time
        
        if direction == "sent":
            stats["BytesSent"] += packet_len
            stats["PacketsSent"] += 1
        elif direction == "received":
            stats["BytesReceived"] += packet_len
            stats["PacketsReceived"] += 1
        
        stats["Duration"] = current_time - stats["StartTime"]
        
        # Check for anomaly detection
        check_anomaly(key)

def check_anomaly(key):
    """Check if traffic statistics exceed the thresholds for anomaly detection."""
    stats = traffic_stats[key]
    if stats["BytesSent"] > TRAFFIC_THRESHOLD_BYTES or stats["PacketsSent"] > TRAFFIC_THRESHOLD_PACKETS:
        if key not in isolated_nodes or not isolated_nodes[key]:
            print(f"Anomaly detected for {key}. Isolating the node.")
            isolate_node(key)
            isolated_nodes[key] = True
    elif stats["BytesSent"] < TRAFFIC_THRESHOLD_BYTES and stats["PacketsSent"] < TRAFFIC_THRESHOLD_PACKETS:
        if key in isolated_nodes and isolated_nodes[key]:
            print(f"Traffic normalized for {key}. Recovering the node.")
            recover_node(key)
            isolated_nodes[key] = False

def isolate_node(key):
    """Dynamically isolate the Docker container corresponding to the node."""
    src_mac = key[0]
    container_name = mac_to_container(src_mac)
    if container_name:
        print(f"Isolating container: {container_name}")
        subprocess.run(["docker", "network", "disconnect", "my_network", container_name])
        log_blacklisted_mac(src_mac)
        log_action("Isolated", src_mac)
    else:
        print(f"Container for MAC {src_mac} not found.")

def recover_node(key):
    """Dynamically recover the Docker container corresponding to the node."""
    src_mac = key[0]
    container_name = mac_to_container(src_mac)
    if container_name:
        print(f"Recovering container: {container_name}")
        subprocess.run(["docker", "network", "connect", "my_network", container_name])
        log_action("Recovered", src_mac)
    else:
        print(f"Container for MAC {src_mac} not found.")

def mac_to_container(mac_address):
    """Map a MAC address to the corresponding Docker container name."""
    try:
        output = subprocess.check_output(["docker", "ps", "--format", "{{.Names}}"], text=True)
        container_names = output.strip().split("\n")
        
        for container in container_names:
            cmd = f"docker inspect --format '{{{{ .NetworkSettings.MacAddress }}}}' {container}"
            container_mac = subprocess.check_output(cmd, shell=True, text=True).strip()
            if container_mac.lower() == mac_address.lower():
                return container
    except subprocess.CalledProcessError as e:
        print(f"Error while mapping MAC to container: {e}")
    return None

def log_blacklisted_mac(src_mac):
    """Log the blacklisted MAC address."""
    logging.info(src_mac)

def log_action(action, mac_address):
    """Log isolation or recovery actions."""
    with open(ACTION_LOG_FILE_PATH, 'a') as log_file:
        log_file.write(f"{time.asctime()}: {action} - {mac_address}\n")

def capture_traffic():
    """Capture packets and extract required details."""
    s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
    
    print("Capturing traffic... Press Ctrl+C to stop.")
    try:
        while True:
            # Capture packet
            packet, _ = s.recvfrom(65565)
            
            # Parse Ethernet header
            src_mac, dest_mac, eth_protocol, payload = parse_ethernet_header(packet)
            
            # Update statistics for packets (assuming bi-directional communication)
            packet_length = len(packet)
            update_stats(src_mac, dest_mac, packet_length, "sent")
            update_stats(dest_mac, src_mac, packet_length, "received")
    except KeyboardInterrupt:
        print("\nStopped capturing traffic.")
        print("Final Traffic Statistics in JSON:")
        print(json.dumps(traffic_stats, indent=4))

# Start capturing traffic
capture_traffic()
